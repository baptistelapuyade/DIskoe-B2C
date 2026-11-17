import Link from "next/link";

import { ProfileHeadPreview } from "@/components/profile/head-preview";
import { StepShell } from "@/components/profile/step-shell";
import { LinkButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { readCrop, type GapCode } from "@/lib/domain/profile-publication";
import { t, type MessageId } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { PublishForm, RetryImageForm } from "@/components/profile/forms";
import { GapList, ProfileNav, stateLabel } from "@/components/profile/status";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { publishProfile, retryImagePublish } from "../actions";

export const dynamic = "force-dynamic";

const GAP_IDS: Record<GapCode, MessageId> = {
  name: "Z22.gap.name",
  short_intro: "Z22.gap.shortIntro",
  link_or_contact: "Z22.gap.linkOrContact",
  profile_image: "Z22.gap.profileImage",
  revision_missing: "Z22.gap.revisionMissing",
};

export default async function PreviewProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const view = await loadOwnerProfileView(
    profileId,
    `/organizer/profiles/${profileId}/preview`,
  );
  const { revision, image } = view;

  // Before the first submission the preview is step 3 of the profile (Figma
  // ORG-06). Later states (in review, question, changes to a live profile)
  // keep the older screen until their own slices are built.
  if (view.status === "incomplete" || view.status === "ready") {
    const lang = await getLang();
    const base = `/organizer/profiles/${profileId}`;
    const supabase = await createClient();
    const { data: use } = image
      ? await supabase.from("media_uses").select("crop").eq("id", image.useId).maybeSingle()
      : { data: null };
    const firstGap = view.gaps[0];

    return (
      <StepShell
        lang={lang}
        backHref={`${base}/image`}
        eyebrow={t(lang, "Z23.preview.eyebrow")}
        title={t(lang, "Z23.preview.title")}
        lead={t(lang, "Z23.preview.lead")}
        wide
      >
        <div className="max-w-[1032px]">
          {/* The large hint of ORG-06: blue brand surface, larger title. */}
          <div role="status" className="bg-brand-blue text-foreground flex items-start gap-3 rounded-xl p-4">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="mt-1 size-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 7.25v3.5M8 5.25h.01" />
            </svg>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-[22px] leading-7 font-medium md:text-xl md:leading-6">{t(lang, "Z23.preview.notice.title")}</p>
              <p className="text-base leading-6 md:text-sm md:leading-5">{t(lang, "Z23.preview.notice.line")}</p>
            </div>
          </div>
        </div>
        <ProfileHeadPreview
          lang={lang}
          name={revision?.name ?? ""}
          shortIntro={revision?.shortIntro ?? ""}
          imageUrl={image?.signedUrl ?? null}
          crop={readCrop(use?.crop)}
        />
        {view.gaps.length > 0 ? (
          <div className="flex flex-col gap-6">
            <Notice
              tone="warning"
              title={t(lang, "Z23.preview.gaps", {
                gaps: view.gaps.map((gap) => t(lang, GAP_IDS[gap])).join(", "),
              })}
            />
            <div>
              <LinkButton
                href={firstGap === "profile_image" ? `${base}/image` : `${base}/edit`}
                variant="primaryLg"
              >
                {t(lang, "Z22.a.action")}
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/organizer/events/new" variant="primaryLg">
              {t(lang, "Z23.preview.next")}
            </LinkButton>
            <LinkButton href={`${base}/submit`} variant="ghostLg">
              {t(lang, "Z23.preview.submit")}
            </LinkButton>
          </div>
        )}
      </StepShell>
    );
  }

  const canPublish = view.status === "update_ready";
  const imageMissingPublicly =
    view.profile.publishedRevisionId !== null &&
    view.publishedImagePublic === false;

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <Link href="/organizer" className="text-muted-foreground text-sm">
          ← Deine Profile
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Vorschau</h1>
        <p className="text-muted-foreground">
          {stateLabel(view.status, view.live)} · Private Vorschau. Nur du und
          DISKOE können sie sehen.
        </p>
        <ProfileNav profileId={profileId} active="preview" />
      </header>

      <GapList gaps={view.gaps} />

      <article className="border-border space-y-4 rounded-lg border p-6">
        {image?.signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.signedUrl}
            alt={image.altText ?? ""}
            className="max-h-64 rounded-md"
          />
        ) : null}
        <h2 className="text-2xl font-bold">
          {revision?.name || "Name fehlt noch"}
        </h2>
        <p className="leading-7 whitespace-pre-line">
          {revision?.shortIntro || "Kurzvorstellung fehlt noch."}
        </p>
        <ul className="text-sm">
          {revision?.officialUrl ? <li>Link: {revision.officialUrl}</li> : null}
          {revision?.publicContact ? (
            <li>Kontakt: {revision.publicContact}</li>
          ) : null}
        </ul>
      </article>

      {canPublish ? (
        <section aria-labelledby="publish-heading" className="space-y-4">
          <h2 id="publish-heading" className="text-xl font-semibold">
            Änderungen veröffentlichen
          </h2>
          <p className="text-muted-foreground">
            Bis du veröffentlichst, bleibt der bisherige öffentliche Stand
            sichtbar.
          </p>
          <PublishForm
            action={publishProfile.bind(null, profileId)}
            update
          />
        </section>
      ) : view.status === "published" && !imageMissingPublicly ? (
        <p role="status">Dein Profil ist veröffentlicht.</p>
      ) : view.status === "in_review" ? (
        <p role="status">
          Eingereicht. DISKOE prüft dein Profil. Mit der Freigabe wird es
          öffentlich.
        </p>
      ) : view.status === "question" ? (
        <p role="status">
          DISKOE hat eine Frage zu diesem Stand:{" "}
          <Link href={`/organizer/profiles/${profileId}/status`} className="underline">
            Frage ansehen
          </Link>
        </p>
      ) : null}

      {imageMissingPublicly ? (
        <section aria-labelledby="retry-heading" className="space-y-3">
          <h2 id="retry-heading" className="text-xl font-semibold">
            Bild noch nicht öffentlich
          </h2>
          <RetryImageForm action={retryImagePublish.bind(null, profileId)} />
        </section>
      ) : null}
    </main>
  );
}
