import { SiteBar, Band, LegalFooter } from "./parts";
import type { LegalDocument } from "@/lib/legal/texts";

export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <SiteBar back={{ href: "/", label: "Startseite" }} />
      <Band>
        <h1 className="text-4xl leading-tight font-bold tracking-tight">{doc.title}</h1>
        <div className="mt-6 flex max-w-2xl flex-col gap-4 text-lg leading-8">
          {doc.blocks.map((block, i) =>
            block.kind === "h2" ? (
              <h2 key={i} className="mt-4 text-2xl font-bold">{block.text}</h2>
            ) : (
              <p key={i}>{block.text}</p>
            ),
          )}
        </div>
      </Band>
      <LegalFooter />
    </main>
  );
}
