"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_FILTERS, type EventFilter } from "@/lib/domain/event-list";
import { EVENT_LIST_PATH, listHref } from "@/lib/event/list-href";
import { useHydrated } from "@/lib/hooks/use-hydrated";

// Search and state filter of the event list (Figma EVL-01a). Both change the
// address, so the list is a normal server page: shareable, back button works.
// The search box is read-only until the page is hydrated: text typed earlier
// is thrown away when the fields are hydrated. (This also means it does not
// work without scripts.)
export function ListFilters({
  query,
  filter,
  labels,
}: {
  query: string;
  filter: EventFilter;
  labels: {
    search: string;
    placeholder: string;
    filter: string;
    options: Record<EventFilter, string>;
  };
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [text, setText] = useState(query);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selected, setSelected] = useState<EventFilter>(filter);

  // "Reset filter" and the back button change the address from outside.
  useEffect(() => {
    setText(query);
    setSelected(filter);
  }, [query, filter]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function search(next: string) {
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.replace(listHref({ query: next, filter: selected }));
    }, 300);
  }

  function choose(next: string) {
    const value = next as EventFilter;

    setSelected(value);
    router.replace(listHref({ query: text, filter: value }));
  }

  return (
    <form
      method="get"
      action={EVENT_LIST_PATH}
      role="search"
      className="flex flex-col gap-4 md:flex-row md:items-end"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label htmlFor="event-search" className="text-sm leading-5 font-medium">
          {labels.search}
        </label>
        <Input
          id="event-search"
          name="q"
          type="search"
          value={text}
          placeholder={labels.placeholder}
          autoComplete="off"
          readOnly={!hydrated}
          onChange={(event) => search(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 md:w-[220px]">
        <label
          id="event-filter-label"
          className="text-sm leading-5 font-medium"
        >
          {labels.filter}
        </label>
        <Select name="state" value={selected} onValueChange={choose}>
          <SelectTrigger aria-labelledby="event-filter-label">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_FILTERS.map((option) => (
              <SelectItem key={option} value={option}>
                {labels.options[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}
