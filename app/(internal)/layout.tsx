import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intern – DISKOE",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function InternalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen">{children}</div>;
}
