/**
 * The site began life as a real restaurant's storefront and is now a neutral
 * demo ("Pizza Nova"). `prisma/seed.ts` only ever creates catalog rows on an
 * empty database, so a database seeded before the rebrand keeps the original
 * name inside dish titles and descriptions (e.g. "Pizza House Supreme
 * Special"). These helpers rewrite that name in place; they are pure so the
 * behaviour can be tested without a database.
 */

const LEGACY_BRAND_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/بيتزا\s+هاوس/g, "بيتزا نوڤا"],
  [/Pizza\s+House/gi, "Pizza Nova"],
];

/** Replaces the legacy brand name in `text`; leaves everything else untouched. */
export function neutralizeLegacyBrand(text: string): string {
  return LEGACY_BRAND_PATTERNS.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text);
}

/**
 * The columns of `row` whose value changes under `neutralizeLegacyBrand`, or
 * `null` when nothing needs rewriting — callers skip the write entirely, which
 * keeps the production seeder idempotent.
 */
export function legacyBrandChanges<T extends { id: string }>(
  row: T,
  fields: ReadonlyArray<keyof T & string>,
): Record<string, string> | null {
  const changes: Record<string, string> = {};
  for (const field of fields) {
    const value = row[field];
    if (typeof value !== "string") continue;
    const next = neutralizeLegacyBrand(value);
    if (next !== value) changes[field] = next;
  }
  return Object.keys(changes).length > 0 ? changes : null;
}
