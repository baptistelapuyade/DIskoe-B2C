import type { Browser, BrowserContext } from "@playwright/test";

// The platform copy is English by default (cookie `lang` absent). The specs
// written before the text catalog check German texts, so their contexts start
// with the German choice. Specs of the language switch itself use plain
// contexts.
const BASE_URL = "http://127.0.0.1:3000";

export const GERMAN_COOKIE = {
  name: "lang",
  value: "de",
  domain: "127.0.0.1",
  path: "/",
  expires: -1,
  httpOnly: false,
  secure: false,
  sameSite: "Lax" as const,
};

type ContextOptions = Parameters<Browser["newContext"]>[0];

export async function germanContext(
  browser: Browser,
  options: ContextOptions = {},
): Promise<BrowserContext> {
  const context = await browser.newContext({ baseURL: BASE_URL, ...options });
  await context.addCookies([GERMAN_COOKIE]);
  return context;
}
