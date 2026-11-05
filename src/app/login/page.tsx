import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/lib/actions";
import { safeCallbackUrl } from "@/lib/safe-callback";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl, "");

  return (
    <section>
      <h1>Logowanie</h1>
      <p className="lead">
        {callbackUrl === "/koszyk"
          ? "Zaloguj się, aby złożyć zamówienie - wrócisz do koszyka."
          : "Zaloguj się, aby złożyć zamówienie lub wejść do panelu."}
      </p>
      <div className="panel">
        <AuthForm
          mode="login"
          action={loginAction}
          callbackUrl={callbackUrl || undefined}
        />
        <p className="muted" style={{ marginTop: "1rem" }}>
          Nie masz konta?{" "}
          <Link
            href={
              callbackUrl
                ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/register"
            }
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </section>
  );
}
