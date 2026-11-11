import { cookies } from "next/headers";
import { cache } from "react";

import {
  LANG_COOKIE,
  parseLang,
  t,
  type Lang,
  type MessageId,
  type Params,
} from "./index";

// Reads the language of the current request (cookie, default English).
export const getLang = cache(async (): Promise<Lang> => {
  const store = await cookies();
  return parseLang(store.get(LANG_COOKIE)?.value);
});

// Server-side translator for the current request.
export async function getT(): Promise<
  (id: MessageId, params?: Params) => string
> {
  const lang = await getLang();
  return (id, params) => t(lang, id, params);
}
