export function getHeaderIndex(
  sheet: string[][],
  headersConst: Record<string, string>,
  maxRows = 6
): number | null {
  if (!sheet.length) {
    return null;
  }

  const normalize = (value: unknown) =>
    String(value ?? "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[‐-‒–—−]/g, "-")
      .replace(/ё/gi, "е")
      .trim()
      .toLowerCase();

  const headerConst = new Set(
    Object.values(headersConst)
      .map(normalize)
      .filter(Boolean)
  );

  const rowsToCheck = Math.min(
    maxRows,
    sheet.length
  );

  for (let rowIndex = 0; rowIndex < rowsToCheck; rowIndex++) {
    const row = sheet[rowIndex].map(normalize);

    const matches = row.filter((value) =>
      headerConst.has(value)
    );

    if (matches.length >= 3) {
      return rowIndex + 1; // как в GAS
    }
  }

  return null;
}