const STORAGE_KEY = "tm_attribution";

export type Attribution = {
  path: string;
  params: Record<string, string>;
};

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(STORAGE_KEY)) return; // first-touch — never overwrite

  const url = new URL(window.location.href);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const attribution: Attribution = { path: url.pathname, params };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return { path: "/", params: {} };

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Attribution;
  } catch {
    // fall through to live location
  }

  return { path: window.location.pathname, params: {} };
}
