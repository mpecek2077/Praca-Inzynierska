/** Inicjały i kolor karty marki - bez oficjalnych logo / znaków towarowych OEM. */

const KNOWN_INITIALS: Record<string, string> = {
  bmw: "BMW",
  audi: "AU",
  volkswagen: "VW",
  vw: "VW",
  toyota: "TY",
  mercedes: "MB",
  "mercedes-benz": "MB",
  honda: "HO",
  ford: "FO",
};

/** Kolory UI (nie oficjalne palety marek) - tylko do rozróżnienia kart. */
const KNOWN_COLORS: Record<string, string> = {
  bmw: "#3d6ea5",
  audi: "#8a9099",
  volkswagen: "#3d8f7a",
  vw: "#3d8f7a",
  toyota: "#b85a3a",
  mercedes: "#6a7a8c",
  "mercedes-benz": "#6a7a8c",
  honda: "#4a7c9a",
  ford: "#8b4a5c",
};

const FALLBACK_PALETTE = [
  "#c45c26",
  "#5b7c99",
  "#6b8f71",
  "#8b6b9a",
  "#9a7b4f",
  "#4a7c8c",
];

export function brandInitials(name: string, slug?: string | null): string {
  const key = (slug ?? name).trim().toLowerCase();
  if (KNOWN_INITIALS[key]) {
    return KNOWN_INITIALS[key];
  }

  const trimmed = name.trim();
  if (!trimmed) return "?";

  const words = trimmed.split(/[\s/-]+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w[0]!.toUpperCase())
      .join("");
  }

  const single = words[0] ?? trimmed;
  if (single.length <= 3) {
    return single.toUpperCase();
  }
  return single.slice(0, 2).toUpperCase();
}

export function brandAccentColor(slug: string, name?: string): string {
  const key = slug.trim().toLowerCase();
  if (KNOWN_COLORS[key]) {
    return KNOWN_COLORS[key];
  }

  const source = key || (name ?? "").toLowerCase();
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length]!;
}
