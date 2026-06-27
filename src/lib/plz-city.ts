import data from '../data/plz-city.json';

const PLZ_CITY = data as Record<string, string>;

export function lookupCityByPlz(plz: string): string | null {
  return PLZ_CITY[plz] ?? null;
}
