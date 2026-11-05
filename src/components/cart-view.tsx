"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatPricePln } from "@/lib/catalog-types";
import { placeOrderAction } from "@/lib/order-actions";
import { useCart } from "@/components/cart-provider";
import { PartThumb } from "@/components/part-thumb";

type CartViewProps = {
  isLoggedIn: boolean;
};

export function CartView({ isLoggedIn }: CartViewProps) {
  const router = useRouter();
  const { items, ready, totalPln, setQuantity, removeItem, clearCart } =
    useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitOrder() {
    setError(null);

    if (items.length === 0) {
      setError("Koszyk jest pusty.");
      return;
    }

    startTransition(async () => {
      const result = await placeOrderAction({
        items: items.map((item) => ({
          partId: item.partId,
          quantity: item.quantity,
        })),
      });

      if (result.error || !result.orderId) {
        setError(result.error ?? "Nie udało się złożyć zamówienia.");
        return;
      }

      clearCart();
      router.push(`/zamowienie/${result.orderId}`);
      router.refresh();
    });
  }

  if (!ready) {
    return (
      <div className="panel">
        <p className="muted">Ładowanie koszyka…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel">
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Koszyk jest pusty.
        </p>
        <div className="actions">
          <Link href="/konfigurator" className="btn">
            Przejdź do konfiguratora
          </Link>
          {isLoggedIn && (
            <Link href="/zamowienia" className="btn btn-secondary">
              Moje zamówienia
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="panel cart-list">
        <ul className="cart-items">
          {items.map((item) => (
            <li key={item.partId} className="cart-item">
              <div className="cart-item-main">
                <PartThumb
                  src={item.imageUrl}
                  alt={item.name}
                  className="part-thumb-sm"
                />
                <div>
                  <h3>{item.name}</h3>
                  <p className="muted">
                    {item.brandName} {item.modelName} / {item.generationName}
                  </p>
                  <p className="part-price">
                    {formatPricePln(item.pricePln)} × {item.quantity} ={" "}
                    {formatPricePln(item.pricePln * item.quantity)}
                  </p>
                </div>
              </div>
              <div className="cart-item-controls">
                <label>
                  Ilość
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(event) =>
                      setQuantity(item.partId, Number(event.target.value) || 1)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => removeItem(item.partId)}
                >
                  Usuń
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel cart-summary">
        <div className="cart-total">
          <span>Suma</span>
          <strong>{formatPricePln(totalPln)}</strong>
        </div>

        <div className="checkout-cta" data-testid="checkout-cta">
          {isLoggedIn ? (
            <button
              type="button"
              className="btn btn-checkout"
              onClick={submitOrder}
              disabled={pending}
              data-testid="checkout-submit"
            >
              {pending ? "Składanie zamówienia…" : "Złóż zamówienie"}
            </button>
          ) : (
            <Link
              href="/login?callbackUrl=/koszyk"
              className="btn btn-checkout"
              data-testid="checkout-login"
            >
              Zaloguj się, aby zamówić
            </Link>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>
            {error}
          </div>
        )}

        <div className="actions cart-secondary-actions">
          <Link href="/konfigurator" className="btn btn-secondary">
            Konfigurator
          </Link>
          <button type="button" className="btn-ghost" onClick={clearCart}>
            Wyczyść
          </button>
        </div>
      </div>
    </div>
  );
}
