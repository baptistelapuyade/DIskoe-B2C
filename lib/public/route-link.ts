// "Route öffnen": a map search for the shown place. Only built when an address
// is shown; the link carries the public place data and nothing else. Pure.

export function routeHref(
  placeName: string | null,
  addressLines: string[],
): string | null {
  const lines = addressLines.map((line) => line.trim()).filter(Boolean);

  if (lines.length === 0) return null;

  const query = [placeName?.trim() ?? "", ...lines].filter(Boolean).join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
