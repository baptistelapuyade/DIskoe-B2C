"use server";

import { cookies } from "next/headers";

import { LANG_COOKIE, LANGS, parseLang } from "./index";

// Stores the language choice. The cookie holds no personal data. Next.js
// re-renders the current page after a server action that sets a cookie, so
// the switch works with and without client JavaScript.
export async function setLang(formData: FormData): Promise<void> {
  const raw = formData.get("lang");
  if (typeof raw !== "string" || !(LANGS as readonly string[]).includes(raw)) {
    return;
  }
  const store = await cookies();
  store.set(LANG_COOKIE, parseLang(raw), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
