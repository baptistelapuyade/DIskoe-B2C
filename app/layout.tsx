import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

// Self-hosted so builds need no network access (Space Grotesk 2.000, SIL OFL 1.1,
// see app/fonts/SpaceGrotesk-OFL.txt). Variable weight axis 300–700.
const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-Variable.woff2",
  display: "swap",
  weight: "300 700",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "DISKOE",
  description: "DISKOE B2C Alpha",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={spaceGrotesk.variable}>{children}</body>
    </html>
  );
}
