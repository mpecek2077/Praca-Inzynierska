"use client";

import { useActionState } from "react";
import {
  approveCustomOrderAction,
  rejectCustomOrderAction,
  type AdminCustomState,
} from "@/lib/admin-custom-actions";
import { formatPricePln } from "@/lib/catalog-types";
import {
  COMPLEXITY_LABELS,
  FINISH_LABELS,
  MATERIAL_LABELS,
  QUALITY_LABELS,
  type Complexity,
  type Finish,
  type Material,
  type Quality,
} from "@/lib/pricing";

export type CustomPayloadView = {
  brandName?: string;
  modelName?: string;
  description?: string;
  complexity?: number;
  material?: string;
  volumeCm3?: number;
  infill?: number;
  quality?: string;
  finish?: string;
  estimatedPrice?: number;
  modelFileName?: string;
  modelFilePath?: string;
  modelFileSize?: number;
};

function formatBytes(size?: number): string {
  if (!size || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

type AdminCustomReviewProps = {
  orderId: string;
  payload: CustomPayloadView;
  totalPln: number;
};

const initial: AdminCustomState = {};

export function AdminCustomReview({
  orderId,
  payload,
  totalPln,
}: AdminCustomReviewProps) {
  const [approveState, approveAction, approving] = useActionState(
    approveCustomOrderAction,
    initial,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectCustomOrderAction,
    initial,
  );

  return (
    <div className="admin-custom-review">
      <h3>Parametry custom</h3>
      <dl className="custom-payload-dl">
        <div>
          <dt>Pojazd</dt>
          <dd>
            {payload.brandName} {payload.modelName}
          </dd>
        </div>
        <div>
          <dt>Opis</dt>
          <dd>{payload.description}</dd>
        </div>
        <div>
          <dt>Materiał / infill / jakość</dt>
          <dd>
            {MATERIAL_LABELS[(payload.material as Material) ?? "PLA"] ??
              payload.material}{" "}
            · {payload.infill}% ·{" "}
            {QUALITY_LABELS[(payload.quality as Quality) ?? "standard"] ??
              payload.quality}
          </dd>
        </div>
        <div>
          <dt>Objętość / geometria / finish</dt>
          <dd>
            {payload.volumeCm3} cm³ · geometria{" "}
            {COMPLEXITY_LABELS[(payload.complexity as Complexity) ?? 2] ??
              payload.complexity}{" "}
            (info, bez wpływu na cenę) ·{" "}
            {FINISH_LABELS[(payload.finish as Finish) ?? "raw"] ??
              payload.finish}
          </dd>
        </div>
        <div>
          <dt>Plik modelu</dt>
          <dd>
            {payload.modelFilePath ? (
              <>
                <a href={payload.modelFilePath} target="_blank" rel="noreferrer">
                  {payload.modelFileName ?? payload.modelFilePath}
                </a>
                {payload.modelFileSize
                  ? ` (${formatBytes(payload.modelFileSize)})`
                  : null}
              </>
            ) : (
              <span className="muted">Brak pliku</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Szacunek klienta</dt>
          <dd>
            {formatPricePln(
              payload.estimatedPrice ?? totalPln,
            )}
          </dd>
        </div>
      </dl>

      {(approveState.error || rejectState.error) && (
        <div className="alert alert-error">
          {approveState.error || rejectState.error}
        </div>
      )}
      {(approveState.success || rejectState.success) && (
        <div className="alert alert-ok">
          {approveState.success || rejectState.success}
        </div>
      )}

      <div className="admin-custom-actions grid-2">
        <form action={approveAction} className="form admin-form">
          <input type="hidden" name="id" value={orderId} />
          <h4>Zatwierdź</h4>
          <label>
            Korekta ceny (opcjonalnie)
            <input
              name="adjustedPrice"
              type="number"
              min={0.01}
              step="0.01"
              placeholder={String(totalPln)}
            />
          </label>
          <label>
            Notatka (opcjonalnie)
            <textarea name="adminNote" rows={2} />
          </label>
          <button className="btn" type="submit" disabled={approving}>
            {approving ? "…" : "Zatwierdź → W realizacji"}
          </button>
        </form>

        <form action={rejectAction} className="form admin-form">
          <input type="hidden" name="id" value={orderId} />
          <h4>Odrzuć</h4>
          <label>
            Notatka dla klienta (wymagana)
            <textarea name="adminNote" rows={3} required minLength={5} />
          </label>
          <label>
            Korekta ceny (opcjonalnie)
            <input name="adjustedPrice" type="number" min={0.01} step="0.01" />
          </label>
          <button className="btn btn-danger" type="submit" disabled={rejecting}>
            {rejecting ? "…" : "Odrzuć"}
          </button>
        </form>
      </div>
    </div>
  );
}
