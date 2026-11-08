import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { HeaderMenu } from "@/components/header-menu";

export async function SiteHeader() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        FLY<span>DES</span> Platform
      </Link>
      <HeaderMenu
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userEmail={session?.user?.email}
        logoutAction={logoutAction}
      />
    </header>
  );
}
