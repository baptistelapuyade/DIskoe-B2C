import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AreaCard, ProfileCard } from "../../components/home/profile-card";
import type { ProfileHomeData } from "../../components/home/profile-card";

// Renders the start page card for each state of Figma ORG-103a to g and checks
// what the owner reads and where the actions lead. The state mapping itself is
// covered in home-state.test.ts; the database path by the Playwright specs.

const view = (over: Record<string, unknown>) =>
  ({
    profile: { id: "p1", slug: "kollektiv-nord" },
    revision: { name: "Kollektiv Nord" },
    gaps: [],
    status: "ready",
    live: false,
    question: null,
    ...over,
  }) as never;

const event = (published: boolean) => [
  { id: "e1", title: "Opening", published },
];

function data(
  over: Record<string, unknown>,
  events: ProfileHomeData["events"],
  firstEvent: ProfileHomeData["firstEvent"],
): ProfileHomeData {
  return { view: view(over), events, firstEvent };
}

const card = (d: ProfileHomeData, lang: "de" | "en" = "de") =>
  renderToStaticMarkup(<ProfileCard lang={lang} data={d} />);
const area = (d: ProfileHomeData) =>
  renderToStaticMarkup(<AreaCard lang="de" data={d} eventsHref="#events" />);

const hrefs = (html: string) =>
  [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);

describe("ProfileCard", () => {
  it("103a: names the gaps and leads to the profile editor", () => {
    const html = card(
      data(
        {
          status: "incomplete",
          gaps: ["short_intro", "link_or_contact", "profile_image"],
        },
        [],
        "none",
      ),
    );
    expect(html).toContain("Kollektiv Nord");
    expect(html).toContain("Dir fehlen noch Angaben:");
    expect(html).toContain("Kurzvorstellung");
    expect(html).toContain("Profilbild");
    expect(html).toContain("Entwurf · privat");
    expect(html).toContain("Angaben ergänzen");
    expect(hrefs(html)).toContain("/organizer/profiles/p1/edit");
  });

  it("103b: asks for the first event, with the profile preview as second action", () => {
    const html = card(data({}, [], "none"));
    expect(html).toContain("Dein Profil ist fertig.");
    expect(html).toContain("Erstes Event anlegen");
    expect(hrefs(html)).toContain("/organizer/events/new?profile=p1");
    expect(hrefs(html)).toContain("/organizer/profiles/p1/preview");
  });

  it("103b: an incomplete first event leads back to its editor", () => {
    const html = card(data({}, event(false), "incomplete"));
    expect(hrefs(html)).toContain("/organizer/events/e1/edit");
    expect(hrefs(html)).not.toContain("/organizer/events/new?profile=p1");
  });

  it("103c: preview and submit, with Dein Bereich below", () => {
    const d = data({}, event(false), "ready");
    const html = card(d);
    expect(html).toContain("Vorschau ansehen und einreichen");
    expect(hrefs(html)).toContain("/organizer/profiles/p1/submit");
    expect(area(d)).toContain("Dein Bereich");
    expect(area(d)).not.toContain("Profil bearbeiten");
  });

  it("103d: in review, nothing to do, only a look at what was submitted", () => {
    const html = card(data({ status: "in_review" }, event(false), "none"));
    expect(html).toContain("In Prüfung · noch nicht öffentlich");
    expect(html).toContain("Du musst nichts tun.");
    expect(html).toContain("Eingereichtes ansehen");
    expect(hrefs(html)).toContain("/organizer/profiles/p1/status");
  });

  it("103e: shows the founder's question, with a fallback when it is missing", () => {
    const asked = card(
      data(
        {
          status: "question",
          question: { message: "Ist der Link aktuell?", createdAt: "" },
        },
        event(false),
        "none",
      ),
    );
    expect(asked).toContain("Rückfrage · noch nicht öffentlich");
    expect(asked).toContain("Ist der Link aktuell?");
    expect(asked).toContain("Angabe korrigieren");

    const bare = card(data({ status: "question" }, event(false), "none"));
    expect(bare).toContain("DISKOE hat eine Frage zu deinem Stand.");
  });

  it("103f: live with a published event, share and second event", () => {
    const d = data({ status: "published", live: true }, event(true), "none");
    const html = card(d);
    expect(html).toContain("Dein Profil und dein erstes Event sind live.");
    expect(html).toContain("dein Programm");
    expect(html).toContain("Live");
    expect(html).not.toContain("Änderungen noch nicht öffentlich");
    expect(html).toContain("Weiteres Event anlegen");
    expect(hrefs(html)).toContain("/kollektiv-nord");
    expect(area(d)).toContain("Profil bearbeiten");
  });

  it("103f: live without a published event says so", () => {
    const html = card(data({ status: "published", live: true }, [], "none"));
    expect(html).toContain("Dein Profil ist live.");
    expect(html).not.toContain("erstes Event sind live");
  });

  it("103g: changes that are not public yet, with publish as main action", () => {
    const html = card(
      data({ status: "update_ready", live: true }, event(true), "none"),
    );
    expect(html).toContain(
      "Du hast Änderungen, die noch nicht öffentlich sind.",
    );
    expect(html).toContain("Änderungen noch nicht öffentlich");
    expect(html).toContain("Vorschau ansehen und veröffentlichen");
    expect(hrefs(html)).toContain("/organizer/profiles/p1/preview");
  });

  it("live with an incomplete new version asks for the missing details", () => {
    const html = card(
      data(
        { status: "incomplete", live: true, gaps: ["name"] },
        event(true),
        "none",
      ),
    );
    expect(html).toContain("Deine neue Fassung ist noch nicht vollständig.");
    expect(html).toContain("Angaben ergänzen");
  });

  it("English: the same card in the second language", () => {
    const html = card(data({}, event(false), "ready"), "en");
    expect(html).toContain("Look at the preview and submit both.");
    expect(html).toContain("View preview and submit");
    expect(html).not.toContain("Vorschau");
  });

  it("never shows a Profil anlegen action (profiles come from the founder)", () => {
    for (const d of [
      data({ status: "incomplete", gaps: ["name"] }, [], "none"),
      data({}, [], "none"),
      data({ status: "published", live: true }, event(true), "none"),
    ]) {
      expect(card(d)).not.toMatch(/Profil anlegen/);
    }
  });
});
