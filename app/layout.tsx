import type { Metadata } from "next";
import localFont from "next/font/local";

import { getLang } from "@/lib/i18n/server";
import { indexingEnabled } from "@/lib/public/site";

import "./globals.css";

// Self-hosted so builds need no network access (Space Grotesk 2.000, SIL OFL 1.1,
// see app/fonts/SpaceGrotesk-OFL.txt). Variable weight axis 300–700.
const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-Variable.woff2",
  display: "swap",
  weight: "300 700",
  variable: "--font-space-grotesk",
});

// Pages that render per request read the switch at runtime; a page built
// statically keeps the value of the build (closed when it was unset).
export function generateMetadata(): Metadata {
  return {
    title: "DISKOE",
    description: "DISKOE B2C Alpha",
    ...(indexingEnabled() ? {} : { robots: { index: false, follow: false } }),
  };
}

// The document language follows the language choice (cookie `lang`, default
// English). Every page already renders per request, so reading the cookie here
// costs no caching.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className={spaceGrotesk.variable}>{children}</body>
    </html>
  );
}
