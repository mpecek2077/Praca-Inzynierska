import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { SiteNav } from "@/components/site-nav";

export async function SiteHeader() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        FLY<span>DES</span> Platform
      </Link>
      <div className="header-end">
        <SiteNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
        {session?.user ? (
          <div className="header-auth">
            <span className="nav-user">{session.user.email}</span>
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
    </header>
  );
}
