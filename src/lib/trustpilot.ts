export type TrustpilotStats = {
  rating: string;      // e.g. "4,8"
  reviewCount: string; // e.g. "8.072"
};

const FALLBACK: TrustpilotStats = { rating: "4,8", reviewCount: "8.072" };

export async function getTrustpilotStats(): Promise<TrustpilotStats> {
  try {
    const res = await fetch("https://www.trustpilot.com/review/www.tm.org", {
      next: { revalidate: 86400 }, // re-fetch at most once per day
      headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
    });
    if (!res.ok) return FALLBACK;

    const html = await res.text();

    // Trustpilot embeds schema.org JSON-LD — find the one with AggregateRating
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(match[1]);
        const ratingRaw = data?.aggregateRating?.ratingValue ?? data?.ratingValue;
        const countRaw  = data?.aggregateRating?.reviewCount ?? data?.reviewCount;
        if (ratingRaw && countRaw) {
          return {
            rating:      parseFloat(ratingRaw).toFixed(1).replace(".", ","),
            reviewCount: parseInt(countRaw).toLocaleString("de-DE"),
          };
        }
      } catch {
        continue;
      }
    }
  } catch {
    // network error — fall through
  }

  return FALLBACK;
}
