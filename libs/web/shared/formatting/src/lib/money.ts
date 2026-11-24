/** Amounts are PLN only in the MVP and stored in grosze (theme decisions, "Money"). */
const groszePerZloty = 100;

const pln = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });

/**
 * Grosze as a `pl-PL` amount: `142000` → "1420,00 zł", `1420000` → "14 200,00 zł". CLDR doesn't
 * group four-digit numbers, which is accepted as is. Spaces are no-break spaces.
 */
export function formatMoney(minor: number): string {
  return pln.format(minor / groszePerZloty);
}

/** Whole złoty, then optionally a comma or a dot and at most two decimals. */
const amountPattern = /^(?<zloty>\d+)(?:[,.](?<grosze>\d{1,2}))?$/;

/**
 * A typed amount in grosze, or `null` when it isn't one: "14,20" and "14.20" → `1420`, "14,2" →
 * `1420`. Accepts a comma or a dot and at most two decimals; no sign, no group separators. Works
 * on the digits rather than through a float, so "0.29" is `29`, not `28.999…`.
 */
export function parseAmount(text: string): number | null {
  const groups = amountPattern.exec(text.trim())?.groups;
  if (!groups) return null;
  const minor =
    Number(groups['zloty']) * groszePerZloty + Number((groups['grosze'] ?? '').padEnd(2, '0'));
  return Number.isSafeInteger(minor) ? minor : null;
}
