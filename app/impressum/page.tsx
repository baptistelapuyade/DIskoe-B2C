import type { Metadata } from "next";

import { LegalPage } from "@/components/public/legal-page";
import { IMPRESSUM, legalRobots } from "@/lib/legal/texts";

export const metadata: Metadata = {
  title: "Impressum – DISKOE",
  robots: legalRobots(IMPRESSUM),
};

export default function Page() {
  return <LegalPage doc={IMPRESSUM} />;
}
