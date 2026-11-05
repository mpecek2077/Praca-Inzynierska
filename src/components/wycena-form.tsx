"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPricePln } from "@/lib/catalog-types";
import { submitCustomQuoteAction } from "@/lib/custom-order-actions";
import {
  CUSTOM_MODEL_EXTENSIONS,
  CUSTOM_MODEL_MAX_BYTES,
} from "@/lib/custom-model-constants";
import {
  calculateCustomQuote,
  COMPLEXITY_CLIENT_OPTIONS,
  COMPLEXITY_LABELS,
  FINISH_LABELS,
  FINISH_OPTIONS,
  INFILL_LABELS,
  INFILL_OPTIONS,
  MATERIAL_LABELS,
  MATERIAL_OPTIONS,
  QUALITY_LABELS,
  QUALITY_OPTIONS,
  type Complexity,
  type Finish,
  type Infill,
  type Material,
  type Quality,
} from "@/lib/pricing";

export type WycenaBrandOption = {
  id: string;
  name: string;
  models: { id: string; name: string }[];
};

type WycenaFormProps = {
  brands: WycenaBrandOption[];
  isLoggedIn: boolean;
};

const ACCEPT_MODEL = CUSTOM_MODEL_EXTENSIONS.join(",");
const MAX_MODEL_MB = Math.round(CUSTOM_MODEL_MAX_BYTES / (1024 * 1024));

export function WycenaForm({ brands, isLoggedIn }: WycenaFormProps) {
  const router = useRouter();
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [modelId, setModelId] = useState(brands[0]?.models[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [complexity, setComplexity] = useState<Complexity>(2);
  const [material, setMaterial] = useState<Material>("PLA");
  const [volumeCm3, setVolumeCm3] = useState(120);
  const [infill, setInfill] = useState<Infill>(20);
  const [quality, setQuality] = useState<Quality>("standard");
  const [finish, setFinish] = useState<Finish>("raw");
  const [modelFileName, setModelFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const models = useMemo(
    () => brands.find((brand) => brand.id === brandId)?.models ?? [],
    [brands, brandId],
  );

  const quote = useMemo(
    () =>
      calculateCustomQuote({
        material,
        volumeCm3,
        infill,
        quality,
        finish,
      }),
    [material, volumeCm3, infill, quality, finish],
  );

  function onBrandChange(nextBrandId: string) {
    setBrandId(nextBrandId);
    const nextModels =
      brands.find((brand) => brand.id === nextBrandId)?.models ?? [];
    setModelId(nextModels[0]?.id ?? "");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/wycena");
      return;
    }

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("modelFile");
    if (fileInput instanceof HTMLInputElement && fileInput.files?.[0]) {
      const file = fileInput.files[0];
      if (file.size > CUSTOM_MODEL_MAX_BYTES) {
        setError(`Plik modelu jest za duży (max ${MAX_MODEL_MB} MB).`);
        return;
      }
    }

    const formData = new FormData(form);
    startTransition(async () => {
      const result = await submitCustomQuoteAction(formData);
      if (result.error || !result.orderId) {
        setError(result.error ?? "Nie udało się wysłać wyceny.");
        return;
      }
      router.push(`/zamowienie/${result.orderId}`);
      router.refresh();
    });
  }

  if (brands.length === 0) {
    return (
      <div className="panel">
        <p className="muted">Brak marek w bazie - uruchom seed.</p>
      </div>
    );
  }

  return (
    <form
      className="panel wycena-form"
      onSubmit={handleSubmit}
      encType="multipart/form-data"
    >
      <div className="wycena-grid">
        <label>
          Marka pojazdu
          <select
            name="brandId"
            value={brandId}
            onChange={(event) => onBrandChange(event.target.value)}
            required
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Model
          <select
            name="modelId"
            value={modelId}
            onChange={(event) => setModelId(event.target.value)}
            required
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </label>

        <label className="wycena-full">
          Opis części
          <textarea
            name="description"
            required
            minLength={10}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Np. lotka dachowa z kanałami pod światła..."
          />
        </label>

        <label className="wycena-full">
          Plik modelu (opcjonalnie)
          <input
            name="modelFile"
            type="file"
            accept={ACCEPT_MODEL}
            onChange={(event) =>
              setModelFileName(event.target.files?.[0]?.name ?? null)
            }
          />
          <span className="field-hint">
            STL, OBJ lub 3MF, max {MAX_MODEL_MB} MB
            {modelFileName ? `. Wybrano: ${modelFileName}` : ""}.
          </span>
        </label>

        <label>
          Trudność geometrii
          <select
            name="complexity"
            value={complexity}
            onChange={(event) =>
              setComplexity(Number(event.target.value) as Complexity)
            }
          >
            {COMPLEXITY_CLIENT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {COMPLEXITY_LABELS[value]}
              </option>
            ))}
          </select>
          <span className="field-hint">
            Informacja dla warsztatu - nie zmienia szacunkowej ceny.
          </span>
        </label>

        <label>
          Materiał
          <select
            name="material"
            value={material}
            onChange={(event) => setMaterial(event.target.value as Material)}
          >
            {MATERIAL_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {MATERIAL_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Przybliżona objętość (cm³)
          <input
            name="volumeCm3"
            type="number"
            min={1}
            max={5000}
            step={1}
            value={volumeCm3}
            onChange={(event) => setVolumeCm3(Number(event.target.value) || 1)}
            required
          />
          <span className="field-hint">
            Jeśli nie wiesz, zostaw domyślną lub opisz w polu części.
          </span>
        </label>

        <label>
          Wypełnienie
          <select
            name="infill"
            value={infill}
            onChange={(event) =>
              setInfill(Number(event.target.value) as Infill)
            }
          >
            {INFILL_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {INFILL_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Jakość powierzchni
          <select
            name="quality"
            value={quality}
            onChange={(event) => setQuality(event.target.value as Quality)}
          >
            {QUALITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {QUALITY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Wykończenie
          <select
            name="finish"
            value={finish}
            onChange={(event) => setFinish(event.target.value as Finish)}
          >
            {FINISH_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {FINISH_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="wycena-result">
        <div className="wycena-result-price">
          <p className="muted">Szacunkowa cena</p>
          <p className="part-price wycena-price">
            {formatPricePln(quote.estimatedPrice)}
          </p>
          <p className="field-hint">
            Orientacyjnie - po wysłaniu doprecyzujemy szczegóły.
          </p>
        </div>
        <div className="wycena-result-cta actions">
          {isLoggedIn ? (
            <button type="submit" className="btn" disabled={pending}>
              {pending ? "Wysyłanie…" : "Wyślij do wyceny"}
            </button>
          ) : (
            <Link href="/login?callbackUrl=/wycena" className="btn">
              Zaloguj i wyślij
            </Link>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
    </form>
  );
}
