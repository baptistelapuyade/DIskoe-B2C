import type { Metadata } from "next";

// The private preview of the owner (VOR-01a/b): the real public page inside a
// frame, without the app header and footer. Never indexed, never cached; the
// pages check the owner themselves (loaders in lib/public/preview-load.ts).
export const metadata: Metadata = {
  title: "Organizer – DISKOE",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function OrganizerPreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
