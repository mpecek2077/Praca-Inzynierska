"use client";

import { useActionState, useState } from "react";
import type { AdminActionState } from "@/lib/admin-actions";
import type { GenerationOption } from "@/lib/admin-catalog";
import { PartThumb } from "@/components/part-thumb";

type AdminPartFormProps = {
  mode: "create" | "edit";
  action: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  generations: GenerationOption[];
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    pricePln: string;
    generationId: string;
    imageUrl: string;
    modelUrl: string;
  };
};

const initialState: AdminActionState = {};

export function AdminPartForm({
  mode,
  action,
  generations,
  initial,
}: AdminPartFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl ?? "");

  return (
    <form className="form admin-form" action={formAction}>
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {state.error && <div className="alert alert-error">{state.error}</div>}
      {state.success && <div className="alert alert-ok">{state.success}</div>}

      <label>
        Nazwa
        <input
          name="name"
          type="text"
          required
          minLength={2}
          defaultValue={initial?.name ?? ""}
        />
      </label>

      <label>
        Slug (opcjonalnie - z nazwy)
        <input
          name="slug"
          type="text"
          defaultValue={initial?.slug ?? ""}
          placeholder="np. lotka-dachowa-g80"
        />
      </label>

      <label>
        Generacja pojazdu
        <select
          name="generationId"
          required
          defaultValue={initial?.generationId ?? ""}
        >
          <option value="" disabled>
            Wybierz generację…
          </option>
          {generations.map((generation) => (
            <option key={generation.id} value={generation.id}>
              {generation.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Cena (PLN)
        <input
          name="pricePln"
          type="number"
          required
          min={0.01}
          step="0.01"
          defaultValue={initial?.pricePln ?? ""}
        />
      </label>

      <label>
        URL zdjęcia
        <input
          name="imageUrl"
          type="text"
          value={previewUrl}
          onChange={(event) => setPreviewUrl(event.target.value)}
          placeholder="/parts/lotka.svg lub https://…"
        />
      </label>
      <p className="muted" style={{ fontSize: "0.85rem" }}>
        Lokalnie: <code>/parts/lotka.svg</code>, <code>/parts/spoiler.svg</code>{" "}
        (PNG też w <code>/parts/</code>)
      </p>
      <div className="admin-image-preview">
        <PartThumb
          src={previewUrl.trim() || "/parts/part-generic.svg"}
          alt={initial?.name || "Podgląd"}
        />
      </div>

      <label>
        URL modelu 3D (opcjonalnie)
        <input
          name="modelUrl"
          type="text"
          defaultValue={initial?.modelUrl ?? ""}
          placeholder="/models/car_spoiler.glb"
        />
      </label>
      <p className="muted" style={{ fontSize: "0.85rem" }}>
        Gdy podany, konfigurator pokazuje podgląd 3D zamiast samego zdjęcia.
        Pliki: <code>/models/*.glb</code>
      </p>

      <label>
        Opis
        <textarea
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ""}
        />
      </label>

      <button className="btn" type="submit" disabled={pending}>
        {pending
          ? "Zapisywanie…"
          : mode === "create"
            ? "Dodaj część"
            : "Zapisz zmiany"}
      </button>
    </form>
  );
}
