import { SiteBar, Band, LegalFooter } from "./parts";
import { getLang } from "@/lib/i18n/server";
import type { LegalDocument } from "@/lib/legal/texts";

export async function LegalPage({ doc }: { doc: LegalDocument }) {
  const lang = await getLang();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <SiteBar lang={lang} back={{ href: "/", label: "Startseite" }} />
      <Band>
        <h1 className="text-4xl leading-tight font-bold tracking-tight">
          {doc.title}
        </h1>
        <div className="mt-6 flex max-w-2xl flex-col gap-4 text-lg leading-8">
          {doc.blocks.map((block, i) =>
            block.kind === "h2" ? (
              <h2 key={i} className="mt-4 text-2xl font-bold">
                {block.text}
              </h2>
            ) : (
              <p key={i}>{block.text}</p>
            ),
          )}
        </div>
      </Band>
      <LegalFooter lang={lang} />
    </main>
  );
}
