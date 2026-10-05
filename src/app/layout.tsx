import type { Metadata } from "next";
import { Bricolage_Grotesque, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { getSession } from "@/lib/auth";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const source = Source_Sans_3({ subsets: ["latin"], variable: "--font-source" });

export const metadata: Metadata = {
  title: "Boutique Afi",
  description: "Commandez vos courses à la boutique du quartier",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="fr" className={`${bricolage.variable} ${source.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <Header user={session ? { name: session.name } : null} />
          <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-12">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
