import Link from "next/link";

import { t, type Lang } from "@/lib/i18n";

// DISKOE / Footer (Figma 2978:1861). Imprint and privacy as 44 px targets.
// `divider` adds the line on top (Divider = On).
export function Footer({
  lang,
  divider = false,
}: {
  lang: Lang;
  divider?: boolean;
}) {
  return (
    <footer className={divider ? "border-border border-t" : undefined}>
      <nav
        aria-label={t(lang, "Z20.legal.nav")}
        className="flex gap-6 px-6 pt-1 pb-6 md:gap-8 md:px-12"
      >
        {(
          [
            ["/impressum", "Z20.legal.imprint"],
            ["/datenschutz", "Z20.legal.privacy"],
          ] as const
        ).map(([href, id]) => (
          <Link
            key={href}
            href={href}
            className="text-muted-foreground focus-visible:outline-ring flex min-h-11 items-center text-sm leading-5 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t(lang, id)}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
