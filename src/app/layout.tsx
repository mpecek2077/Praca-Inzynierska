import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLYDES Platform",
  description:
    "Kanał zamówień B2B FLYDES: konfiguracja części z katalogu i wycena własnych modeli (MVP pracy inżynierskiej).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <CartProvider>
          <SiteHeader />
          <main className="shell">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
