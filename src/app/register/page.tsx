import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { registerAction } from "@/lib/actions";
import { safeCallbackUrl } from "@/lib/safe-callback";

type RegisterPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl, "");

  return (
    <section>
      <h1>Rejestracja</h1>
      <p className="lead">Nowe konto otrzymuje rolę USER.</p>
      <div className="panel">
        <AuthForm
          mode="register"
          action={registerAction}
          callbackUrl={callbackUrl || undefined}
        />
        <p className="muted" style={{ marginTop: "1rem" }}>
          Masz już konto?{" "}
          <Link
            href={
              callbackUrl
                ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/login"
            }
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </section>
  );
}
