import type { Metadata } from "next";

import { LegalPage } from "@/components/public/legal-page";
import { DATENSCHUTZ, legalRobots } from "@/lib/legal/texts";

export const metadata: Metadata = {
  title: "Datenschutz – DISKOE",
  robots: legalRobots(DATENSCHUTZ),
};

export default function Page() {
  return <LegalPage doc={DATENSCHUTZ} />;
}
