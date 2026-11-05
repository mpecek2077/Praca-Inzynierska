"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  formatGenerationYears,
  formatPricePln,
  type CatalogBrand,
} from "@/lib/catalog-types";
import { brandAccentColor, brandInitials } from "@/lib/brand-initials";
import { useCart } from "@/components/cart-provider";
import { PartModelViewer } from "@/components/part-model-viewer";
import { PartThumb } from "@/components/part-thumb";

type ConfiguratorProps = {
  brands: CatalogBrand[];
};

type AddedToast = {
  partName: string;
};

export function Configurator({ brands }: ConfiguratorProps) {
  const { addItem } = useCart();
  const [brandId, setBrandId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState<AddedToast | null>(null);

  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === brandId) ?? null,
    [brands, brandId],
  );
  const selectedModel = useMemo(
    () => selectedBrand?.models.find((model) => model.id === modelId) ?? null,
    [selectedBrand, modelId],
  );
  const selectedGeneration = useMemo(
    () =>
      selectedModel?.generations.find(
        (generation) => generation.id === generationId,
      ) ?? null,
    [selectedModel, generationId],
  );
  const selectedPart = useMemo(() => {
    if (!selectedGeneration) return null;
    if (selectedPartId) {
      return (
        selectedGeneration.parts.find((part) => part.id === selectedPartId) ??
        selectedGeneration.parts[0] ??
        null
      );
    }
    return selectedGeneration.parts[0] ?? null;
  }, [selectedGeneration, selectedPartId]);

  useEffect(() => {
    if (!addedToast) return;
    const timer = window.setTimeout(() => setAddedToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [addedToast]);

  function resetFlow() {
    setBrandId(null);
    setModelId(null);
    setGenerationId(null);
    setSelectedPartId(null);
  }

  function selectBrand(id: string) {
    setBrandId(id);
    setModelId(null);
    setGenerationId(null);
    setSelectedPartId(null);
    setAddedToast(null);
  }

  function selectModel(id: string) {
    setModelId(id);
    setGenerationId(null);
    setSelectedPartId(null);
    setAddedToast(null);
  }

  function selectGeneration(id: string) {
    setGenerationId(id);
    setSelectedPartId(null);
    setAddedToast(null);
  }

  function handleAddPart(partId: string) {
    if (!selectedBrand || !selectedModel || !selectedGeneration) {
      return;
    }
    const part = selectedGeneration.parts.find((entry) => entry.id === partId);
    if (!part) {
      return;
    }
    addItem({
      partId: part.id,
      name: part.name,
      pricePln: part.pricePln,
      brandName: selectedBrand.name,
      modelName: selectedModel.name,
      generationName: selectedGeneration.name,
      imageUrl: part.imageUrl,
    });
    setAddedToast({ partName: part.name });
    resetFlow();
  }

  if (brands.length === 0) {
    return (
      <div className="panel">
        <p className="muted">
          Brak danych katalogu. Uruchom seed: <code>npm run db:seed</code>
        </p>
      </div>
    );
  }

  return (
    <div className="configurator">
      {addedToast && (
        <div className="added-banner" role="status">
          Dodano {addedToast.partName} -{" "}
          <Link href="/koszyk">zobacz koszyk</Link>
        </div>
      )}

      <ol className="config-steps" aria-label="Kroki konfiguracji">
        <li className={brandId ? "done" : "active"}>1. Marka</li>
        <li className={modelId ? "done" : brandId ? "active" : ""}>2. Model</li>
        <li className={generationId ? "done" : modelId ? "active" : ""}>
          3. Generacja
        </li>
        <li className={generationId ? "active" : ""}>4. Część</li>
      </ol>

      <div className="panel config-panel">
        <h2>Marka</h2>
        <p className="muted catalog-disclaimer">
          Karty marek to inicjały i kolor UI — bez oficjalnych logo ani znaków
          towarowych OEM. Grafiki modeli i części są poglądowe.
        </p>
        <div className="catalog-card-grid">
          {brands.map((brand) => {
            const initials = brandInitials(brand.name, brand.slug);
            const accent = brandAccentColor(brand.slug, brand.name);
            return (
              <button
                key={brand.id}
                type="button"
                className={`catalog-card catalog-card-brand ${brandId === brand.id ? "selected" : ""}`}
                onClick={() => selectBrand(brand.id)}
              >
                <span
                  className="brand-initials"
                  style={{ "--brand-accent": accent } as CSSProperties}
                  aria-hidden
                >
                  {initials}
                </span>
                <span className="catalog-card-label">{brand.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedBrand && (
        <div className="panel config-panel">
          <h2>Model - {selectedBrand.name}</h2>
          {selectedBrand.models.length === 0 ? (
            <p className="muted">Brak modeli dla tej marki.</p>
          ) : (
            <div className="catalog-card-grid">
              {selectedBrand.models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={`catalog-card ${modelId === model.id ? "selected" : ""}`}
                  onClick={() => selectModel(model.id)}
                >
                  <PartThumb
                    src={model.imageUrl || "/parts/part-generic.svg"}
                    alt={model.name}
                  />
                  <span className="catalog-card-label">{model.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedModel && (
        <div className="panel config-panel">
          <h2>
            Generacja - {selectedBrand?.name} {selectedModel.name}
          </h2>
          {selectedModel.generations.length === 0 ? (
            <p className="muted">Brak generacji dla tego modelu.</p>
          ) : (
            <div className="choice-grid">
              {selectedModel.generations.map((generation) => {
                const years = formatGenerationYears(
                  generation.yearFrom,
                  generation.yearTo,
                );
                return (
                  <button
                    key={generation.id}
                    type="button"
                    className={`choice-chip ${generationId === generation.id ? "selected" : ""}`}
                    onClick={() => selectGeneration(generation.id)}
                  >
                    <span>{generation.name}</span>
                    {years && <small>{years}</small>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedGeneration && (
        <div className="panel config-panel">
          <h2>Części</h2>

          {selectedGeneration.parts.length === 0 ? (
            <p className="muted">Brak części dla tej generacji.</p>
          ) : (
            <div className="parts-split">
              <div className="parts-hero">
                {selectedPart && (
                  <>
                    {selectedPart.modelUrl ? (
                      <PartModelViewer
                        src={selectedPart.modelUrl}
                        alt={selectedPart.name}
                        poster={selectedPart.imageUrl}
                        className="parts-hero-viewer"
                      />
                    ) : (
                      <PartThumb
                        src={selectedPart.imageUrl}
                        alt={selectedPart.name}
                        className="parts-hero-thumb"
                      />
                    )}
                    <div className="part-mini-summary">
                      <h3>{selectedPart.name}</h3>
                      <dl className="part-summary-dl">
                        <div>
                          <dt>Marka</dt>
                          <dd>{selectedBrand?.name}</dd>
                        </div>
                        <div>
                          <dt>Model</dt>
                          <dd>{selectedModel?.name}</dd>
                        </div>
                        <div>
                          <dt>Generacja</dt>
                          <dd>{selectedGeneration.name}</dd>
                        </div>
                        <div>
                          <dt>Cena</dt>
                          <dd className="part-price">
                            {formatPricePln(selectedPart.pricePln)}
                          </dd>
                        </div>
                      </dl>
                      {selectedPart.description && (
                        <p className="muted part-summary-desc">
                          {selectedPart.description}
                        </p>
                      )}
                    </div>
                    <div className="part-actions">
                      <button
                        type="button"
                        className="btn btn-add-cart"
                        onClick={() => handleAddPart(selectedPart.id)}
                      >
                        Dodaj do koszyka
                      </button>
                    </div>
                  </>
                )}
              </div>
              <ul className="parts-variant-list">
                {selectedGeneration.parts.map((part) => (
                  <li key={part.id}>
                    <button
                      type="button"
                      className={`variant-row ${selectedPart?.id === part.id ? "selected" : ""}`}
                      onClick={() => setSelectedPartId(part.id)}
                    >
                      <PartThumb
                        src={part.imageUrl}
                        alt={part.name}
                        className="part-thumb-xs"
                      />
                      <span className="variant-meta">
                        <strong>{part.name}</strong>
                        <span className="part-price">
                          {formatPricePln(part.pricePln)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
