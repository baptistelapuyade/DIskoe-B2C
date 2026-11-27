import Link from "next/link";

import { LinkButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t, type Lang, type MessageId } from "@/lib/i18n";

// DISKOE / Vorschau-Kopf (Figma VOR-01a/b): the frame around the real public
// page. Back button and the two tabs (one page each, so a navigation with
// aria-current, not a tab widget), below it the notice that this is private.
// The page below runs on as PUB-06a / PUB-01a.
export type PreviewTab = "profile" | "event";

export function PreviewFrame({
  lang,
  active,
  backHref,
  backLabel,
  notice,
  profileHref,
  eventHref,
  children,
}: {
  lang: Lang;
  active: PreviewTab;
  backHref: string;
  backLabel: MessageId;
  notice: MessageId;
  profileHref: string;
  // null: there is no event to show, the tab is left out.
  eventHref: string | null;
  children: React.ReactNode;
}) {
  const tabs: { key: PreviewTab; href: string; label: MessageId }[] = [
    { key: "profile", href: profileHref, label: "Z35.tab.profile" },
    ...(eventHref
      ? [
          {
            key: "event" as const,
            href: eventHref,
            label: "Z35.tab.event" as const,
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="bg-neutral-100 px-4 py-6 lg:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <LinkButton href={backHref} variant="ghostLg" className="w-fit">
            {t(lang, backLabel)}
          </LinkButton>
          {tabs.length > 1 ? (
            <nav aria-label={t(lang, "Z35.nav.label")} className="w-fit">
              <ul className="bg-accent flex gap-1 rounded-lg p-1">
                {tabs.map((tab) => (
                  <li key={tab.key}>
                    <Link
                      href={tab.href}
                      aria-current={tab.key === active ? "page" : undefined}
                      className={`focus-visible:outline-ring inline-flex min-h-11 items-center rounded-md px-4 text-sm leading-5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        tab.key === active
                          ? "bg-background text-foreground shadow-sm"
                          : "text-foreground"
                      }`}
                    >
                      {t(lang, tab.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
        <div className="mt-4">
          <Notice tone="info" title={t(lang, "Z35.notice.title")}>
            {t(lang, notice)}
          </Notice>
        </div>
      </div>
      {children}
    </>
  );
}
