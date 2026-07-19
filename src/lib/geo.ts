const CITY_PLZ: Record<string, string> = {
  münchen: '80331',
  berlin: '10115',
  hamburg: '20095',
  frankfurt: '60311',
  köln: '50667',
  düsseldorf: '40213',
  stuttgart: '70173',
  dortmund: '44135',
  essen: '45127',
  leipzig: '04109',
  bremen: '28195',
  dresden: '01067',
  hannover: '30159',
  nürnberg: '90402',
  duisburg: '47051',
};

export function cityToPlz(city: string): string {
  const decoded = decodeURIComponent(city).trim().toLowerCase();
  return CITY_PLZ[decoded] ?? '';
}

// A plausible postal code: 4–5 digits (German 5-digit, Austrian/Swiss 4-digit).
// Shared by the PLZ-Abfrage form (client pre-submit) and /api/register (server).
export function isValidPlz(plz: string): boolean {
  return /^\d{4,5}$/.test(plz.trim());
}

export function resolveGeo(headers: Headers): { city: string; zip_code: string } {
  const city = decodeURIComponent(headers.get('x-vercel-ip-city') ?? '');
  const zip_code = headers.get('x-vercel-ip-postal-code') || cityToPlz(city);
  return { city, zip_code };
}
