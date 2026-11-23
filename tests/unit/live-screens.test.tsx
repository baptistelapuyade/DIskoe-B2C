import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ChangesDiscardedScreen,
  ChangesPublishedScreen,
  ChangesReviewScreen,
  ChangesSavedScreen,
  DiscardChangesScreen,
  NoChangesScreen,
  PublishChangesScreen,
} from "../../components/profile/live-screens";
import {
  diffRevisions,
  type RevisionContent,
} from "../../lib/domain/profile-changes";
import { unchangedText } from "../../lib/profile/changes-text";

// The screens after the editor of a live profile (Figma LPA-02 to 06b): what
// the owner reads and where the buttons lead. The database path (publish,
// discard) is covered by the RLS tests and the Playwright specs.

const BASE = "/organizer/profiles/p1";

const content: RevisionContent = {
  name: "Nebenraum Kollektiv",
  shortIntro: "Unabhängige Nächte zwischen Dub Techno und Elektronik.",
  officialUrl: "https://nebenraum.example",
  instagramHandle: null,
  extraLinks: [],
  publicContact: null,
};

const hrefs = (html: string) =>
  [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);

const review = (
  draft: Partial<RevisionContent>,
  lang: "de" | "en" = "de",
  stale = false,
) =>
  renderToStaticMarkup(
    <ChangesReviewScreen
      lang={lang}
      base={BASE}
      changes={diffRevisions(content, { ...content, ...draft })}
      draftId="d1"
      stale={stale}
    />,
  );

describe("LPA-03a review of the changes", () => {
  it("shows one card per changed field and names only the unchanged rest", () => {
    const html = review({
      shortIntro: "Neu: Dub Techno, Ambient und Elektronik in Berlin.",
      instagramHandle: "nebenraum",
    });

    expect(html).toContain("Das ändert sich");
    expect(html).toContain(
      "Das ist neu gegenüber deiner öffentlichen Seite. Alles andere bleibt, wie es ist.",
    );
    expect(html).toContain("Kurzvorstellung");
    expect(html).toContain("Links und Kontakt");
    expect(html).toContain("nebenraum.example · @nebenraum");
    expect(html).toContain("Unverändert: Name, Profiladresse und Profilbild.");
    expect(html).not.toContain("Dein Entwurf hat sich geändert.");
  });

  it("a changed name gets its own card and leaves the unchanged list", () => {
    const html = review({ name: "Nebenraum" });

    expect(html).toContain(">Name<");
    expect(html).toContain(
      "Unverändert: Kurzvorstellung, Links und Kontakt, Profiladresse und Profilbild.",
    );
  });

  it("says Nothing entered before and Removed after for empty values", () => {
    const added = renderToStaticMarkup(
      <ChangesReviewScreen
        lang="de"
        base={BASE}
        changes={diffRevisions(
          { ...content, publicContact: null, officialUrl: null },
          {
            ...content,
            publicContact: "hallo@nebenraum.example",
            officialUrl: null,
          },
        )}
        draftId="d1"
        stale={false}
      />,
    );
    const removed = review({ officialUrl: null });

    expect(added).toContain("Nichts angegeben");
    expect(removed).toContain("Entfernt");
  });

  it("leads to the editor, the publish and the discard screen with the reviewed draft", () => {
    const links = hrefs(review({ name: "Nebenraum" }));

    expect(links).toContain(`${BASE}/changes/edit#name`);
    expect(links).toContain(`${BASE}/changes/publish?d=d1`);
    expect(links).toContain(`${BASE}/changes/discard?d=d1`);
    expect(links).toContain(`${BASE}/changes/edit`);
    expect(links).toContain("/organizer");
  });

  it("LPA-03c: the same screen with a hint when the draft changed elsewhere", () => {
    const html = review({ name: "Nebenraum" }, "de", true);

    expect(html).toContain("Dein Entwurf hat sich geändert.");
    expect(html).toContain("Prüfe ihn noch einmal.");
  });

  it("English: the same screen in the second language", () => {
    const html = review({ name: "Nebenraum" }, "en");

    expect(html).toContain("What changes");
    expect(html).toContain("Public so far");
    expect(html).toContain(
      "Unchanged: short introduction, links and contact, profile address and profile image.",
    );
    expect(html).not.toContain("Das ändert sich");
  });
});

describe("unchangedText", () => {
  it("joins with und / and", () => {
    expect(unchangedText("de", ["name", "slug", "image"])).toBe(
      "Unverändert: Name, Profiladresse und Profilbild.",
    );
    expect(unchangedText("en", ["name", "slug", "image"])).toBe(
      "Unchanged: name, profile address and profile image.",
    );
  });

  it("is null without fields", () => {
    expect(unchangedText("de", [])).toBeNull();
  });
});

describe("the other screens", () => {
  it("LPA-03b: nothing to publish", () => {
    const html = renderToStaticMarkup(
      <NoChangesScreen lang="de" base={BASE} />,
    );

    expect(html).toContain("Du hast nichts geändert");
    expect(html).toContain("Keine Änderungen vorhanden.");
    expect(hrefs(html)).toContain(`${BASE}/changes/edit`);
    expect(html).not.toContain("Änderungen veröffentlichen</a>");
  });

  it("LPA-02: saved, still private", () => {
    const html = renderToStaticMarkup(
      <ChangesSavedScreen lang="de" base={BASE} />,
    );

    expect(html).toContain("Änderungen gespeichert");
    expect(html).toContain("Öffentlich ist weiter der bisherige Stand.");
    expect(hrefs(html)).toContain(`${BASE}/changes`);
  });

  it("LPA-04a: two ticks, both unticked, publish only after both", () => {
    const html = renderToStaticMarkup(
      <PublishChangesScreen
        lang="de"
        base={BASE}
        action={async () => ({ status: "idle" })}
      />,
    );

    expect(html).toContain("Änderungen veröffentlichen?");
    expect(html).toContain(
      "Ich habe die Angaben geprüft und bin berechtigt, für dieses Projekt zu veröffentlichen.",
    );
    expect(html).toContain(
      "Ich habe die nötigen Rechte an den Texten und Bildern, die öffentlich erscheinen.",
    );
    expect(html).toContain("Jetzt veröffentlichen");
    expect(hrefs(html)).toContain(`${BASE}/changes`);
  });

  it("LPA-05: live, the address stays", () => {
    const html = renderToStaticMarkup(
      <ChangesPublishedScreen lang="de" slug="nebenraum" />,
    );

    expect(html).toContain("Deine Änderungen sind live");
    expect(html).toContain(
      "Link und Adresse deiner Seite sind gleich geblieben.",
    );
    expect(hrefs(html)).toContain("/nebenraum");
  });

  it("LPA-06a: discard asks first and keeping is the main action", () => {
    const html = renderToStaticMarkup(
      <DiscardChangesScreen lang="de" base={BASE} action={async () => {}} />,
    );

    expect(html).toContain("Dein privater Entwurf wird gelöscht.");
    expect(html).toContain("Das lässt sich nicht rückgängig machen.");
    expect(html).toContain("Ja, verwerfen");
    expect(html).toContain("Nein, behalten");
    expect(hrefs(html)).toContain(`${BASE}/changes`);
  });

  it("LPA-06b: discarded", () => {
    const html = renderToStaticMarkup(<ChangesDiscardedScreen lang="en" />);

    expect(html).toContain("Draft discarded");
    expect(html).toContain("Nothing changed on the public page.");
  });
});
