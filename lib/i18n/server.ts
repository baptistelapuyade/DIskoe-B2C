import { cookies, headers } from "next/headers";
import { cache } from "react";

import {
  LANG_COOKIE,
  langFromAcceptLanguage,
  t,
  type Lang,
  type MessageId,
  type Params,
} from "./index";

// Reads the language of the current request: the stored choice (cookie), else
// the language the browser asks for (German or English), else English
// (founder, 26.11.2026). Link previews and crawlers send no cookie, so they
// get the language of their request header, English as a rule.
export const getLang = cache(async (): Promise<Lang> => {
  const stored = (await cookies()).get(LANG_COOKIE)?.value;

  if (stored === "de" || stored === "en") return stored;

  return langFromAcceptLanguage((await headers()).get("accept-language"));
});

// Server-side translator for the current request.
export async function getT(): Promise<
  (id: MessageId, params?: Params) => string
> {
  const lang = await getLang();
  return (id, params) => t(lang, id, params);
}
