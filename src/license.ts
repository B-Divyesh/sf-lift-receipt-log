const SLUG = 'lift-receipt-log';
const KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${KEY}:verdict`;
const DAY = 86_400_000;
export const CHECKOUT_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;

interface Verdict { valid: boolean; checkedAt: number }

export function captureLicense(): void {
  const url = new URL(location.href);
  const license = url.searchParams.get('license');
  if (!license) return;
  localStorage.setItem(KEY, license);
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
}

export function removeLicense(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedUnlock(): boolean {
  if (!localStorage.getItem(KEY)) return false;
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '').valid === true; } catch { return true; }
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  let cached: Verdict | undefined;
  try { cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? ''); } catch { /* verify */ }
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached.valid;
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const body = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: body.valid, checkedAt: Date.now() }));
    return body.valid;
  } catch {
    return cached?.valid ?? true;
  }
}
