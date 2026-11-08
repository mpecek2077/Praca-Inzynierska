"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/site-nav";

type HeaderMenuProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail?: string | null;
  logoutAction: () => void | Promise<void>;
};

export function HeaderMenu({
  isLoggedIn,
  isAdmin,
  userEmail,
  logoutAction,
}: HeaderMenuProps) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="header-controls" ref={rootRef}>
      <div className="header-desktop">
        <SiteNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
        {isLoggedIn ? (
          <div className="header-auth">
            {userEmail ? <span className="nav-user">{userEmail}</span> : null}
            <form action={logoutAction}>
              <button type="submit" className="btn-ghost">
                Wyloguj
              </button>
            </form>
          </div>
        ) : (
          <div className="header-auth">
            <Link href="/login" className="nav-link">
              Logowanie
            </Link>
            <Link href="/register" className="btn">
              Rejestracja
            </Link>
          </div>
        )}
      </div>

      <div className="header-mobile">
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
        {open ? (
          <div id={panelId} className="header-menu-panel" role="navigation">
            <SiteNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
            {isLoggedIn ? (
              <div className="header-auth header-auth-stack">
                {userEmail ? (
                  <span className="nav-user">{userEmail}</span>
                ) : null}
                <form action={logoutAction}>
                  <button type="submit" className="btn-ghost">
                    Wyloguj
                  </button>
                </form>
              </div>
            ) : (
              <div className="header-auth header-auth-stack">
                <Link href="/login" className="nav-link">
                  Logowanie
                </Link>
                <Link href="/register" className="btn">
                  Rejestracja
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
