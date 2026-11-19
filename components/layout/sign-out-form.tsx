"use client";

import { buttonClass } from "@/components/ui/button";
import { clearAllRetained } from "@/components/event/retained";
import { t, type Lang } from "@/lib/i18n";

// "Sign out" also forgets what this browser kept for an unsaved event step.
export function SignOutForm({ lang }: { lang: Lang }) {
  return (
    <form
      action="/auth/signout"
      method="post"
      onSubmit={() => clearAllRetained()}
    >
      <button type="submit" className={buttonClass("ghostLg")}>
        {t(lang, "Z20.nav.signOut")}
      </button>
    </form>
  );
}
