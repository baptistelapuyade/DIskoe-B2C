import { setLang } from "@/lib/i18n/actions";
import { LANGS, t, type Lang } from "@/lib/i18n";

// DISKOE / Tabs "Sprachumschalter (EN / DE)" (Figma 2453:620): two 44 px tabs in
// a tray, the active one white with a border. A form with a server action, so
// it also works without client JavaScript; the group role sits on the inner
// div because a form may not carry it.
export function LanguageSwitch({ lang }: { lang: Lang }) {
  return (
    <form action={setLang}>
      <div
        role="group"
        aria-label={t(lang, "Z20.lang.label")}
        className="bg-accent flex rounded-[10px] p-[3px]"
      >
        {LANGS.map((code) => {
          const active = code === lang;
          return (
            <button
              key={code}
              type="submit"
              name="lang"
              value={code}
              lang={code}
              aria-pressed={active}
              className={`focus-visible:outline-ring size-11 rounded-[10px] text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 ${
                active ? "bg-background border-border border" : "hover:bg-hover"
              } text-foreground`}
            >
              {code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </form>
  );
}
