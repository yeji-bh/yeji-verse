const YEAR_START = 2019;

export function getFilterYears(endYear = new Date().getFullYear()): number[] {
  const years: number[] = [];
  for (let y = endYear; y >= YEAR_START; y--) {
    years.push(y);
  }
  return years;
}
