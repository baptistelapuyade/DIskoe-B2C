import { DEFAULT_FILTER, type EventFilter } from "@/lib/domain/event-list";

export const EVENT_LIST_PATH = "/organizer/events";

// The URL of the list for a search, filter and page. Defaults are left out so
// that "reset filter" and the plain link are the same address.
export function listHref(options: {
  query?: string;
  filter?: EventFilter;
  page?: number;
}): string {
  const params = new URLSearchParams();
  const query = (options.query ?? "").trim();

  if (query !== "") params.set("q", query);
  if (options.filter && options.filter !== DEFAULT_FILTER) {
    params.set("state", options.filter);
  }
  if (options.page && options.page > 1)
    params.set("page", String(options.page));

  const text = params.toString();

  return text === "" ? EVENT_LIST_PATH : `${EVENT_LIST_PATH}?${text}`;
}
