const SLUG = 'lift-receipt-log';
const KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${KEY}:verdict`;
const DAY = 86_400_000;
export const CHECKOUT_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;

interface Verdict { valid: boolean; checkedAt: number; token: string }

function readVerdict(token: string): Verdict | undefined {
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Partial<Verdict>;
    if (verdict.token !== token || typeof verdict.valid !== 'boolean' || !Number.isFinite(verdict.checkedAt) || verdict.checkedAt! <= 0) return undefined;
    return verdict as Verdict;
  } catch {
    return undefined;
  }
}

export function captureLicense(): void {
  const url = new URL(location.href);
  const license = url.searchParams.get('license')?.trim();
  if (!license) return;
  const previousToken = localStorage.getItem(KEY);
  localStorage.setItem(KEY, license);
  if (previousToken !== license) localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function removeLicense(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedUnlock(): boolean {
  const token = localStorage.getItem(KEY);
  return token ? readVerdict(token)?.valid === true : false;
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  const cached = readVerdict(token);
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached.valid;
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const body = await response.json() as { valid: boolean };
    if (typeof body.valid !== 'boolean') throw new Error('Invalid verification response');
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: body.valid, checkedAt: Date.now(), token }));
    return body.valid === true;
  } catch {
    // Offline use is allowed only after this exact token has received a valid
    // server verdict. A new, malformed, or legacy verdict never grants Pro.
    return cached?.valid === true;
  }
}
