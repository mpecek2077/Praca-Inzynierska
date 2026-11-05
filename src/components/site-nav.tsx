"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartBadge } from "@/components/cart-badge";

type SiteNavProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
};

function navClass(pathname: string, href: string, extra = "") {
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  return ["nav-link", extra, active ? "is-active" : ""]
    .filter(Boolean)
    .join(" ");
}

export function SiteNav({ isLoggedIn, isAdmin }: SiteNavProps) {
  const pathname = usePathname() || "/";

  return (
    <nav className="nav" aria-label="Główne">
      <Link href="/konfigurator" className={navClass(pathname, "/konfigurator")}>
        Konfigurator
      </Link>
      <Link href="/wycena" className={navClass(pathname, "/wycena")}>
        Wycena
      </Link>
      <Link
        href="/koszyk"
        className={navClass(pathname, "/koszyk", "nav-cart-link")}
      >
        Koszyk
        <CartBadge />
      </Link>
      {isLoggedIn && (
        <Link
          href="/zamowienia"
          className={navClass(pathname, "/zamowienia")}
        >
          Moje zamówienia
        </Link>
      )}
      {isAdmin && (
        <Link href="/admin" className={navClass(pathname, "/admin")}>
          Admin
        </Link>
      )}
    </nav>
  );
}
