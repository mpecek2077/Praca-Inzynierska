/**
 * Reguły wyceny części niestandardowej (demo MVP).
 *
 * estimatedPrice =
 *   BASE_PLN
 *   + volumeCm3 * PLN_PER_CM3 * materialMult * infillMult * qualityMult
 *   * finishMult
 *
 * - BASE_PLN: koszt przygotowania / obsługi zamówienia custom
 * - volumeCm3: objętość modelu (przybliżona)
 * - material: PLA najtańszy, PETG średni, ABS droższy (temperatura / komora)
 * - infill: więcej wypełnienia -> więcej filamentu i czasu
 * - quality: drobniejsza warstwa -> dłuższy druk
 * - finish: surowy / szlif / primer+lakier
 * - complexity: tylko informacja dla admina (nie wchodzi do ceny)
 *
 * Wynik zaokrąglany do 2 miejsc po przecinku (PLN).
 * To wycena orientacyjna - admin może skorygować przy akceptacji/odrzuceniu.
 */

export const COMPLEXITY_OPTIONS = [1, 2, 3, 4, 5] as const;
export type Complexity = (typeof COMPLEXITY_OPTIONS)[number];

/** Opcje UI dla klienta (zapis w customPayload, bez wpływu na cenę). */
export const COMPLEXITY_CLIENT_OPTIONS = [1, 2, 3, 5] as const;

export const MATERIAL_OPTIONS = ["PLA", "PETG", "ABS"] as const;
export type Material = (typeof MATERIAL_OPTIONS)[number];

export const INFILL_OPTIONS = [15, 20, 30, 50, 80] as const;
export type Infill = (typeof INFILL_OPTIONS)[number];

export const QUALITY_OPTIONS = ["draft", "standard", "fine"] as const;
export type Quality = (typeof QUALITY_OPTIONS)[number];

export const FINISH_OPTIONS = ["raw", "sanded", "painted"] as const;
export type Finish = (typeof FINISH_OPTIONS)[number];

export type CustomQuoteInput = {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  description: string;
  complexity: Complexity;
  material: Material;
  volumeCm3: number;
  infill: Infill;
  quality: Quality;
  finish: Finish;
};

export type CustomQuoteResult = {
  estimatedPrice: number;
  breakdown: {
    basePln: number;
    volumeCost: number;
    materialMult: number;
    infillMult: number;
    qualityMult: number;
    finishMult: number;
  };
};

const BASE_PLN = 80;
const PLN_PER_CM3 = 0.45;

const MATERIAL_MULT: Record<Material, number> = {
  PLA: 1,
  PETG: 1.15,
  ABS: 1.3,
};

const INFILL_MULT: Record<Infill, number> = {
  15: 0.9,
  20: 1,
  30: 1.15,
  50: 1.4,
  80: 1.75,
};

const QUALITY_MULT: Record<Quality, number> = {
  draft: 0.85,
  standard: 1,
  fine: 1.35,
};

const FINISH_MULT: Record<Finish, number> = {
  raw: 1,
  sanded: 1.2,
  painted: 1.55,
};

export const COMPLEXITY_LABELS: Record<Complexity, string> = {
  1: "Prosta",
  2: "Średnia",
  3: "Złożona",
  4: "Złożona+",
  5: "Bardzo złożona",
};

export const MATERIAL_LABELS: Record<Material, string> = {
  PLA: "PLA - uniwersalny",
  PETG: "PETG - odporniejszy",
  ABS: "ABS - do wyższych temperatur",
};

export const INFILL_LABELS: Record<Infill, string> = {
  15: "Lekka konstrukcja (15%)",
  20: "Standardowa (20%)",
  30: "Wytrzymała (30%)",
  50: "Bardzo wytrzymała (50%)",
  80: "Maksymalna wytrzymałość (80%)",
};

export const QUALITY_LABELS: Record<Quality, string> = {
  draft: "Szybka - mniej szczegółów",
  standard: "Standardowa",
  fine: "Precyzyjna - gładka powierzchnia",
};

export const FINISH_LABELS: Record<Finish, string> = {
  raw: "Surowy wydruk",
  sanded: "Wyszlifowany",
  painted: "Gotowy produkt (primer + lakier)",
};

export function calculateCustomQuote(
  input: Pick<
    CustomQuoteInput,
    "material" | "volumeCm3" | "infill" | "quality" | "finish"
  >,
): CustomQuoteResult {
  const volume = Math.max(1, Math.min(5000, input.volumeCm3));
  const materialMult = MATERIAL_MULT[input.material];
  const infillMult = INFILL_MULT[input.infill];
  const qualityMult = QUALITY_MULT[input.quality];
  const finishMult = FINISH_MULT[input.finish];

  const volumeCost =
    volume *
    PLN_PER_CM3 *
    materialMult *
    infillMult *
    qualityMult *
    finishMult;

  const estimatedPrice = Math.round((BASE_PLN + volumeCost) * 100) / 100;

  return {
    estimatedPrice,
    breakdown: {
      basePln: BASE_PLN,
      volumeCost: Math.round(volumeCost * 100) / 100,
      materialMult,
      infillMult,
      qualityMult,
      finishMult,
    },
  };
}
