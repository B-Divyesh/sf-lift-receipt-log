import './styles.css';
import { loadData, saveData, validateImport } from './db';
import { canonicalExercise, parseSet } from './parser';
import { CHECKOUT_URL, cachedUnlock, captureLicense, storeLicense, verifyLicense } from './license';
import { csvText, formatDuration, receiptText, workoutDuration, workoutVolume } from './receipt';
import { DEFAULT_ALIASES, type Alias, type AppData, type LiftSet, type Workout } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
let data: AppData;
let view: 'log' | 'history' | 'settings' = 'log';
let selectedReceipt: string | null = null;
let status = '';
let error = '';
let storageFailed = false;
let restEndsAt = 0;
let restTimer: number | undefined;
let isPro = false;
let undoSet: { workoutId: string; set: LiftSet; index: number } | null = null;
let undoTimeout: number | undefined;
let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
let updateAvailable = false;
let refreshAfterUpdate = false;

const escapeHtml = (value: unknown) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const id = () => crypto.randomUUID();
const activeWorkout = () => data.workouts.find((workout) => !workout.endedAt);
const dateLabel = (value: string) => new Date(value).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const timeLabel = (value: string) => new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

function shell(content: string, page: 'app' | 'legal' = 'app'): string {
  return `<header class="site-header">
    <a class="wordmark" href="/" data-route="home" aria-label="SR — Set Receipt home"><span aria-hidden="true">SR</span> Set Receipt</a>
    ${page === 'app' ? `<nav aria-label="Primary">
      <button class="nav-button ${view === 'log' ? 'active' : ''}" data-view="log">Log</button>
      <button class="nav-button ${view === 'history' ? 'active' : ''}" data-view="history">Receipts</button>
      <button class="nav-button ${view === 'settings' ? 'active' : ''}" data-view="settings">Setup</button>
    </nav>` : '<a class="back-link" href="/" data-route="home">← Back to logger</a>'}
  </header>
  <div class="network-status" id="network-status" role="status">${navigator.onLine ? 'Saved on this device' : 'Offline · logging still works'}</div>
  ${content}
  <footer><p>Private by default. No account, feed, or tracking.</p><nav aria-label="Legal"><a href="/privacy" data-route="privacy">Privacy</a><a href="/terms" data-route="terms">Terms</a></nav><p class="disclosure">Editorial image generated for Set Receipt.</p></footer>
  <div class="toast ${status || error ? 'show' : ''}" role="status" aria-live="polite">${escapeHtml(error || status)}${undoSet ? ' <button data-action="undo-delete">Undo</button>' : ''}</div>
  <div class="update-toast" id="update-toast" role="status"${updateAvailable ? '' : ' hidden'}>Update ready. <button data-action="refresh-app">Refresh</button></div>`;
}

function renderLoading(): void {
  app.innerHTML = shell('<main id="main" class="loading"><h1>Set Receipt</h1><p>Opening your local log…</p></main>');
}

function renderLegal(kind: 'privacy' | 'terms'): void {
  const privacy = `<main id="main" class="legal"><p class="eyebrow">THE PLAIN-LANGUAGE VERSION</p><h1>Privacy</h1>
    <p><strong>Your workout log stays on this device.</strong> Set Receipt stores workouts, aliases, and preferences in your browser’s IndexedDB. We do not operate an account system, analytics tracker, or advertising profile.</p>
    <h2>What leaves your device</h2><p>Nothing during ordinary logging. If you buy or verify a Pro license, the license token is sent to Sociobot’s billing API. Sociobot and Dodo are the merchant of record and process checkout details; payment card data never passes through this app.</p>
    <h2>Your controls</h2><p>You can export a complete JSON backup or CSV at any time, import your backup on another device, and erase all local data from Setup. Shared or printed receipts leave the app only when you choose.</p>
    <h2>Contact</h2><p>Questions can be sent through <a href="https://sociobot.in">sociobot.in</a>. Effective 27 August 2026.</p></main>`;
  const terms = `<main id="main" class="legal"><p class="eyebrow">SHORT AND STRAIGHT</p><h1>Terms</h1>
    <p>Set Receipt is a personal record-keeping utility, not training, medical, or injury advice. You are responsible for your exercise choices and for keeping backups of data that matters to you.</p>
    <h2>License and purchase</h2><p>The free logger remains useful without payment. Set Receipt Pro is a $9 one-time purchase for the listed extras on this device when a valid license is present. Sociobot/Dodo is the merchant of record; it handles payment and refunds. A refund revokes the license.</p>
    <h2>Availability</h2><p>The software is provided “as is” without a promise that every browser or device will preserve local storage forever. Export regularly. We may improve the app while preserving reasonable backup compatibility.</p>
    <h2>Acceptable use</h2><p>Do not interfere with license verification or use this software unlawfully. Effective 27 August 2026.</p></main>`;
  app.innerHTML = shell(kind === 'privacy' ? privacy : terms, 'legal');
}

function setRows(workout: Workout): string {
  if (!workout.sets.length) return `<div class="sets-empty"><p>No sets yet. Your first line becomes the first row.</p></div>`;
  return `<ol class="set-list">${workout.sets.slice().reverse().map((set) => `<li class="set-row">
    <span class="set-exercise">${escapeHtml(set.exercise)}</span>
    <strong>${set.weight}<small>${set.unit}</small> × ${set.reps}</strong>
    ${set.isPr ? '<span class="pr-stamp" aria-label="Personal record">PR</span>' : '<span></span>'}
    <time datetime="${escapeHtml(set.createdAt)}">${timeLabel(set.createdAt)}</time>
    <button class="icon-button" data-delete-set="${escapeHtml(set.id)}" aria-label="Remove ${escapeHtml(set.exercise)} set">×</button>
  </li>`).join('')}</ol>`;
}

function logView(): string {
  const workout = activeWorkout();
  const exerciseNames = [...new Set([...data.aliases.map((item) => item.exercise), ...data.workouts.flatMap((item) => item.sets.map((set) => set.exercise))])].sort();
  return `<main id="main" class="log-layout">
    <section class="log-main" aria-labelledby="page-title">
      <p class="eyebrow">LOCAL LIFT LOG / ${navigator.onLine ? 'READY' : 'OFFLINE'}</p>
      <h1 id="page-title">Log the set.<br><span>Keep the proof.</span></h1>
      <p class="lede">Type it like a notebook. Enter logs it.</p>
      <form id="set-form" class="entry-docket" novalidate>
        <div class="entry-field exercise-field"><label for="exercise">Exercise</label><input id="exercise" name="exercise" list="exercise-list" autocomplete="off" enterkeyhint="next" placeholder="Squat or sq" required><datalist id="exercise-list">${exerciseNames.map((name) => `<option value="${escapeHtml(name)}"></option>`).join('')}${data.aliases.map((item) => `<option value="${escapeHtml(item.alias)}">${escapeHtml(item.exercise)}</option>`).join('')}</datalist></div>
        <div class="entry-field set-field"><label for="set-expression">Weight × reps</label><input id="set-expression" name="set" inputmode="decimal" autocomplete="off" enterkeyhint="done" placeholder="225x5" aria-describedby="entry-help entry-error" required></div>
        <button class="primary-button" type="submit">Log set <span aria-hidden="true">↵</span></button>
        <p id="entry-help" class="form-help">Try 225x5, 100x8kg, or 135 × 10.</p><p id="entry-error" class="form-error" aria-live="assertive">${escapeHtml(error)}</p>
      </form>
      ${workout ? `<section class="active-sheet" aria-labelledby="active-title"><div class="sheet-heading"><div><p class="eyebrow">OPEN RECEIPT · ${dateLabel(workout.startedAt)}</p><h2 id="active-title">Today’s sets</h2></div><span class="set-count">${workout.sets.length} SET${workout.sets.length === 1 ? '' : 'S'}</span></div>${setRows(workout)}<div class="sheet-actions"><button class="secondary-button" data-action="finish-workout" ${workout.sets.length ? '' : 'disabled'}>Finish workout</button><span>${workoutVolume(workout).toLocaleString()} load volume</span></div></section>` : ''}
    </section>
    <aside class="utility-rail" aria-label="Workout utilities">
      <section class="rest-block"><p class="eyebrow">REST CLOCK</p><div id="rest-time" class="rest-time">${restEndsAt ? restDisplay() : formatClock(data.settings.restSeconds)}</div><div class="timer-actions"><button data-action="timer-toggle">${restEndsAt ? 'Pause' : 'Start'}</button><button data-action="timer-reset">Reset</button></div><p>${Math.round(data.settings.restSeconds / 60)} min default · starts after each set</p></section>
      ${!workout ? `<section class="empty-illustration"><img src="/assets/set-receipt-hero.webp" width="800" height="800" fetchpriority="high" decoding="async" alt="A blank paper receipt curling across blue weight plates beside an orange barbell collar"><div><h2>Your next receipt starts here.</h2><p>No account. No loading spinner. Your sets stay on this device.</p></div></section>` : `<section class="syntax-card"><p class="eyebrow">FAST KEYS</p><dl><div><dt>Enter</dt><dd>Log set</dd></div><div><dt>sq</dt><dd>Squat</dd></div><div><dt>bp</dt><dd>Bench press</dd></div></dl></section>`}
    </aside>
  </main>`;
}

function receiptMarkup(workout: Workout, compact = false): string {
  const prs = workout.sets.filter((set) => set.isPr).length;
  return `<article class="receipt ${compact ? 'compact' : ''}" aria-label="Workout receipt for ${escapeHtml(dateLabel(workout.startedAt))}">
    <header><div><p class="receipt-brand">SET RECEIPT</p><p>${dateLabel(workout.startedAt)} · ${timeLabel(workout.startedAt)}</p></div><span class="receipt-id">#${workout.id.slice(0, 6).toUpperCase()}</span></header>
    <div class="receipt-rule">SET / LOAD / REPS</div>
    <ol>${workout.sets.map((set) => `<li><span>${escapeHtml(set.exercise)}</span><strong>${set.weight}${set.unit} × ${set.reps}</strong>${set.isPr ? '<b aria-label="Personal record">★ PR</b>' : ''}</li>`).join('')}</ol>
    <dl class="totals"><div><dt>Sets</dt><dd>${workout.sets.length}</dd></div><div><dt>Volume</dt><dd>${workoutVolume(workout).toLocaleString()}</dd></div><div><dt>Duration</dt><dd>${formatDuration(workoutDuration(workout))}</dd></div><div><dt>PRs</dt><dd>${prs}</dd></div></dl>
    ${workout.note ? `<p class="receipt-note">${escapeHtml(workout.note)}</p>` : ''}<p class="receipt-footer">Stored locally · Set Receipt</p>
  </article>`;
}

function historyView(): string {
  const receipts = data.workouts.filter((workout) => workout.endedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const chosen = receipts.find((workout) => workout.id === selectedReceipt);
  if (chosen) return `<main id="main" class="history-page"><div class="page-heading"><div><p class="eyebrow">IMMUTABLE TRAINING RECORD</p><h1>Workout receipt</h1></div><button class="secondary-button" data-action="back-history">← All receipts</button></div><div class="receipt-wrap">${receiptMarkup(chosen)}<div class="receipt-actions"><button class="primary-button" data-share="${escapeHtml(chosen.id)}">Share receipt</button><button class="secondary-button" data-action="print">Print / save PDF</button></div>${isPro ? `<label class="note-field" for="receipt-note">Private receipt note<textarea id="receipt-note" data-note="${escapeHtml(chosen.id)}" maxlength="180" placeholder="How did it feel?">${escapeHtml(chosen.note ?? '')}</textarea></label>` : `<div class="pro-nudge"><strong>Pro extra</strong><p>Add private notes to completed receipts.</p><button data-view="settings">See Pro</button></div>`}</div></main>`;
  return `<main id="main" class="history-page"><div class="page-heading"><div><p class="eyebrow">YOUR TRAINING, YOUR FILE</p><h1>Workout receipts</h1></div><span class="big-count">${receipts.length.toString().padStart(2, '0')}</span></div>
    ${receipts.length ? `<div class="receipt-grid">${receipts.map((workout) => `<button class="receipt-card" data-receipt="${escapeHtml(workout.id)}"><span>${dateLabel(workout.startedAt)}</span><strong>${workout.sets.length} sets</strong><span>${workoutVolume(workout).toLocaleString()} volume</span><i>View receipt →</i></button>`).join('')}</div>` : `<section class="history-empty"><img src="/assets/set-receipt-hero.webp" width="800" height="800" decoding="async" alt="A blank paper receipt curling across blue weight plates beside an orange barbell collar"><div><p class="eyebrow">NO RECEIPTS YET</p><h2>Finish a workout to file it here.</h2><p>Your active sets are safe in the Log tab.</p><button class="primary-button" data-view="log">Log a set</button></div></section>`}
  </main>`;
}

function settingsView(): string {
  return `<main id="main" class="settings-page"><div class="page-heading"><div><p class="eyebrow">MAKE THE SHORTHAND YOURS</p><h1>Setup</h1></div></div>
    <div class="settings-grid"><section><h2>Logging defaults</h2><fieldset><legend>Default unit</legend><label><input type="radio" name="unit" value="lb" ${data.settings.unit === 'lb' ? 'checked' : ''}> Pounds (lb)</label><label><input type="radio" name="unit" value="kg" ${data.settings.unit === 'kg' ? 'checked' : ''}> Kilograms (kg)</label></fieldset><label for="rest-select">Rest clock</label><select id="rest-select" data-setting="rest"><option value="60" ${data.settings.restSeconds === 60 ? 'selected' : ''}>1 minute</option><option value="90" ${data.settings.restSeconds === 90 ? 'selected' : ''}>1½ minutes</option><option value="120" ${data.settings.restSeconds === 120 ? 'selected' : ''}>2 minutes</option><option value="180" ${data.settings.restSeconds === 180 ? 'selected' : ''}>3 minutes</option>${!['60','90','120','180'].includes(String(data.settings.restSeconds)) ? `<option value="${data.settings.restSeconds}" selected>${data.settings.restSeconds} seconds</option>` : ''}</select>${isPro ? `<form id="custom-rest-form" class="inline-form"><label for="custom-rest">Custom seconds</label><input id="custom-rest" type="number" min="15" max="900" value="${data.settings.restSeconds}"><button>Set</button></form>` : '<p class="form-help">Pro adds any custom rest interval.</p>'}</section>
      <section><div class="section-title"><div><h2>Exercise aliases</h2><p>Type the short code in the exercise box.</p></div></div><form id="alias-form" class="alias-form"><label for="alias-code">Short code<input id="alias-code" maxlength="12" placeholder="rdl" required></label><label for="alias-exercise">Exercise<input id="alias-exercise" maxlength="48" placeholder="Romanian deadlift" required></label><button class="secondary-button">Add alias</button></form><ul class="alias-list">${data.aliases.map((item) => `<li><code>${escapeHtml(item.alias)}</code><span>→ ${escapeHtml(item.exercise)}</span><button data-delete-alias="${escapeHtml(item.id)}" aria-label="Delete ${escapeHtml(item.alias)} alias" ${DEFAULT_ALIASES.some((base) => base.id === item.id) ? 'title="Default alias"' : ''}>×</button></li>`).join('')}</ul></section>
      <section><h2>Your data</h2><p>Back up or move every workout. Export is always free.</p><div class="stack-actions"><button class="secondary-button" data-action="export-json">Export JSON</button><button class="secondary-button" data-action="export-csv">Export CSV</button><label class="file-button">Import JSON<input id="import-file" type="file" accept="application/json,.json"></label><button class="danger-button" data-action="erase-data">Erase all local data</button></div><p class="form-help">Import replaces the log on this device after confirmation.</p></section>
      <section class="pro-panel"><p class="eyebrow">ONE-TIME UNLOCK</p><h2>Set Receipt Pro</h2><p class="price"><strong>$9</strong> once</p><ul><li>Custom rest intervals</li><li>Private notes on receipts</li><li>Supports a focused, ad-free tool</li></ul>${isPro ? '<p class="license-active">✓ Pro is active on this device.</p><button class="secondary-button" data-action="verify-license">Check license</button>' : `<a class="primary-button" href="${CHECKOUT_URL}">Buy Pro</a><details><summary>Have a license?</summary><form id="license-form"><label for="license-token">Paste license token</label><input id="license-token" autocomplete="off" required><button class="secondary-button">Verify and unlock</button></form></details>`}<p class="legal-small">Checkout is hosted by Sociobot/Dodo, the merchant of record. Refunds are handled there and revoke the license. <a href="/privacy" data-route="privacy">Privacy</a> · <a href="/terms" data-route="terms">Terms</a></p></section>
    </div></main>`;
}

function render(): void {
  const path = location.pathname;
  if (path === '/privacy') return renderLegal('privacy');
  if (path === '/terms') return renderLegal('terms');
  const content = view === 'log' ? logView() : view === 'history' ? historyView() : settingsView();
  app.innerHTML = shell(content);
  updateTimer();
}

function formatClock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function restDisplay(): string { return formatClock(Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000))); }
function updateTimer(): void {
  const output = document.querySelector('#rest-time');
  if (!output) return;
  output.textContent = restEndsAt ? restDisplay() : formatClock(data.settings.restSeconds);
  if (restEndsAt && restEndsAt <= Date.now()) {
    restEndsAt = 0;
    output.textContent = 'DONE';
    status = 'Rest complete. Ready for the next set.';
    if ('vibrate' in navigator) navigator.vibrate?.([100, 80, 100]);
  }
}
function startTimer(): void {
  restEndsAt = Date.now() + data.settings.restSeconds * 1000;
  window.clearInterval(restTimer);
  restTimer = window.setInterval(updateTimer, 250);
  updateTimer();
}

async function persist(message = ''): Promise<void> {
  try {
    await saveData(data);
    storageFailed = false;
    if (message) status = message;
  } catch {
    storageFailed = true;
    error = 'Could not save on this device. Export your data and check browser storage.';
  }
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isPersonalRecord(exercise: string, weight: number, unit: 'lb' | 'kg'): boolean {
  const kg = unit === 'kg' ? weight : weight * 0.453592;
  const prior = data.workouts.flatMap((workout) => workout.sets).filter((set) => set.exercise.toLowerCase() === exercise.toLowerCase());
  return !prior.length || prior.every((set) => kg > (set.unit === 'kg' ? set.weight : set.weight * 0.453592));
}

async function addSet(form: HTMLFormElement): Promise<void> {
  error = ''; status = '';
  const formData = new FormData(form);
  let resolvedExercise = '';
  try {
    const exercise = canonicalExercise(String(formData.get('exercise') ?? ''), data.aliases);
    resolvedExercise = exercise;
    const parsed = parseSet(String(formData.get('set') ?? ''), data.settings.unit);
    let workout = activeWorkout();
    if (!workout) {
      workout = { id: id(), startedAt: new Date().toISOString(), endedAt: null, sets: [] };
      data.workouts.push(workout);
    }
    workout.sets.push({ id: id(), exercise, ...parsed, createdAt: new Date().toISOString(), isPr: isPersonalRecord(exercise, parsed.weight, parsed.unit) });
    await persist(`${exercise} ${parsed.weight}${parsed.unit} × ${parsed.reps} logged.`);
    startTimer();
    render();
    // Re-rendering rebuilds the form. Keep the resolved exercise so the next
    // keyboard entry is another set for the same lift, just like a paper log.
    const exerciseInput = document.querySelector<HTMLInputElement>('#exercise');
    if (exerciseInput) exerciseInput.value = exercise;
    const expression = document.querySelector<HTMLInputElement>('#set-expression');
    if (expression) { expression.value = ''; expression.focus(); }
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'Could not log that set.';
    render();
    // A parser error should not make a lifter re-enter the lift they just
    // resolved. Keep the canonical value while they correct the expression.
    const exerciseInput = document.querySelector<HTMLInputElement>('#exercise');
    if (resolvedExercise && exerciseInput) exerciseInput.value = resolvedExercise;
    document.querySelector<HTMLInputElement>(error.startsWith('Choose') ? '#exercise' : '#set-expression')?.focus();
  }
}

async function finishWorkout(): Promise<void> {
  const workout = activeWorkout();
  if (!workout?.sets.length) return;
  workout.endedAt = new Date().toISOString();
  await persist('Workout finished. Receipt filed.');
  selectedReceipt = workout.id;
  view = 'history';
  restEndsAt = 0;
  render();
}

function navigate(path: string): void {
  history.pushState({}, '', path);
  if (path === '/') view = 'log';
  render();
  document.querySelector('h1')?.focus({ preventScroll: true });
  scrollTo(0, 0);
}

app.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  if (form.id === 'set-form') return addSet(form);
  if (form.id === 'alias-form') {
    const aliasInput = form.querySelector<HTMLInputElement>('#alias-code')!;
    const exerciseInput = form.querySelector<HTMLInputElement>('#alias-exercise')!;
    const alias = aliasInput.value.trim().toLowerCase();
    const exercise = exerciseInput.value.trim();
    if (!alias || !exercise) return;
    if (data.aliases.some((item) => item.alias.toLowerCase() === alias)) { error = 'That short code already exists.'; render(); return; }
    data.aliases.push({ id: id(), alias, exercise: canonicalExercise(exercise, []) });
    await persist('Alias added.'); render();
  }
  if (form.id === 'custom-rest-form') {
    const seconds = Number(form.querySelector<HTMLInputElement>('#custom-rest')!.value);
    if (seconds < 15 || seconds > 900) { error = 'Choose 15 to 900 seconds.'; render(); return; }
    data.settings.restSeconds = seconds; await persist('Custom rest saved.'); render();
  }
  if (form.id === 'license-form') {
    const token = form.querySelector<HTMLInputElement>('#license-token')!.value.trim();
    storeLicense(token); status = 'Checking license…'; render();
    isPro = await verifyLicense(true); error = isPro ? '' : 'That license is not active. Check the token and try again.'; status = isPro ? 'Pro unlocked.' : ''; render();
  }
});

app.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  if (target.name === 'unit') { data.settings.unit = target.value as 'lb' | 'kg'; await persist('Default unit saved.'); render(); }
  if (target.dataset.setting === 'rest') { data.settings.restSeconds = Number(target.value); restEndsAt = 0; await persist('Rest clock saved.'); render(); }
  if (target.dataset.note) { const workout = data.workouts.find((item) => item.id === target.dataset.note); if (workout && isPro) { workout.note = target.value.trim(); await persist('Receipt note saved.'); } }
  if (target.id === 'import-file' && target instanceof HTMLInputElement && target.files?.[0]) {
    try {
      const fileText = await target.files[0].text();
      let backup: unknown;
      try { backup = JSON.parse(fileText); } catch { throw new Error('That file is not valid JSON. Choose a Set Receipt backup exported by this app and try again.'); }
      const imported = validateImport(backup);
      if (!confirm(`Replace this device’s log with ${imported.workouts.length} imported workout(s)?`)) return;
      data = imported; await persist('Backup imported.'); render();
    } catch (cause) { error = cause instanceof Error ? cause.message : 'Could not read that backup.'; render(); }
  }
});

app.addEventListener('click', async (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('button, a');
  if (!target) return;
  const route = target.dataset.route;
  if (route) { event.preventDefault(); navigate(route === 'home' ? '/' : `/${route}`); return; }
  if (target.dataset.view) { view = target.dataset.view as typeof view; selectedReceipt = null; render(); return; }
  if (target.dataset.receipt) { selectedReceipt = target.dataset.receipt; render(); return; }
  if (target.dataset.deleteSet) {
    const workout = activeWorkout(); const index = workout?.sets.findIndex((set) => set.id === target.dataset.deleteSet) ?? -1;
    if (workout && index >= 0) { undoSet = { workoutId: workout.id, set: workout.sets[index], index }; workout.sets.splice(index, 1); await persist('Set removed.'); window.clearTimeout(undoTimeout); undoTimeout = window.setTimeout(() => { undoSet = null; render(); }, 6000); render(); }
    return;
  }
  if (target.dataset.deleteAlias) { data.aliases = data.aliases.filter((item) => item.id !== target.dataset.deleteAlias); await persist('Alias removed.'); render(); return; }
  if (target.dataset.share) {
    const workout = data.workouts.find((item) => item.id === target.dataset.share); if (!workout) return;
    const text = receiptText(workout);
    try { if (navigator.share) await navigator.share({ title: 'My Set Receipt', text }); else { await navigator.clipboard.writeText(text); status = 'Receipt copied.'; render(); } } catch (cause) { if ((cause as DOMException).name !== 'AbortError') { error = 'Sharing failed. Try Print / save PDF.'; render(); } }
    return;
  }
  switch (target.dataset.action) {
    case 'finish-workout': await finishWorkout(); break;
    case 'back-history': selectedReceipt = null; render(); break;
    case 'print': print(); break;
    case 'timer-toggle': restEndsAt ? (restEndsAt = 0) : startTimer(); render(); break;
    case 'timer-reset': restEndsAt = 0; render(); break;
    case 'undo-delete': {
      if (!undoSet) break; const workout = data.workouts.find((item) => item.id === undoSet!.workoutId); if (workout) workout.sets.splice(undoSet.index, 0, undoSet.set); undoSet = null; await persist('Set restored.'); render(); break;
    }
    case 'export-json': download(`set-receipt-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json'); status = 'JSON backup exported.'; render(); break;
    case 'export-csv': download(`set-receipt-${new Date().toISOString().slice(0, 10)}.csv`, csvText(data.workouts), 'text/csv'); status = 'CSV exported.'; render(); break;
    case 'erase-data': if (confirm(`Erase ${data.workouts.length} workout(s), all aliases, and settings from this device? Export first if you need a backup.`)) { data = structuredClone({ ...data, workouts: [], aliases: DEFAULT_ALIASES }); await persist('All local workout data erased.'); view = 'log'; render(); } break;
    case 'verify-license': isPro = await verifyLicense(true); status = isPro ? 'License is active.' : ''; error = isPro ? '' : 'License is no longer active.'; render(); break;
    case 'refresh-app': {
      const waiting = serviceWorkerRegistration?.waiting;
      if (!waiting) { location.reload(); break; }
      refreshAfterUpdate = true;
      updateAvailable = false;
      document.querySelector<HTMLElement>('#update-toast')!.hidden = true;
      waiting.postMessage({ type: 'SKIP_WAITING' });
      break;
    }
  }
});

window.addEventListener('popstate', render);
window.addEventListener('online', render);
window.addEventListener('offline', render);

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  serviceWorkerRegistration = registration;
  const announceUpdate = () => {
    if (!registration.waiting || !navigator.serviceWorker.controller) return;
    updateAvailable = true;
    const toast = document.querySelector<HTMLElement>('#update-toast');
    if (toast) toast.hidden = false;
  };
  announceUpdate();
  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    installing?.addEventListener('statechange', () => {
      if (installing.state === 'installed') announceUpdate();
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshAfterUpdate) location.reload();
  });
}

async function init(): Promise<void> {
  renderLoading();
  captureLicense();
  isPro = cachedUnlock();
  try { data = await loadData(); } catch { data = structuredClone({ ...({ version: 1, workouts: [], aliases: DEFAULT_ALIASES, settings: { unit: 'lb', restSeconds: 120, theme: 'auto' } } as AppData) }); storageFailed = true; error = 'Local storage is unavailable. Logging will last only for this tab.'; }
  render();
  verifyLicense().then((valid) => { if (valid !== isPro) { isPro = valid; if (!valid) error = 'License is no longer active.'; render(); } });
  registerServiceWorker().catch(() => { /* Logging still works without installation. */ });
}

void init();

export { storageFailed };
