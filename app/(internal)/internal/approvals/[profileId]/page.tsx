import Link from "next/link";
import { notFound } from "next/navigation";

import { ApproveForm } from "@/components/profile/approve-form";
import { GapList } from "@/components/profile/status";
import { requireFounder } from "@/lib/auth/server";
import { loadFounderProfileView } from "@/lib/profile/founder";
import { createClient } from "@/lib/supabase/server";

import { approveFirst } from "../actions";

export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  await requireFounder(`/internal/approvals/${profileId}`);

  if (!UUID.test(profileId)) {
    notFound();
  }

  const supabase = await createClient();
  const view = await loadFounderProfileView(supabase, profileId);

  if (!view) {
    notFound();
  }

  const { revision, image } = view;
  const canApprove =
    revision !== null &&
    view.submittedAt !== null &&
    !view.alreadyApproved &&
    view.gaps.length === 0;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <header className="space-y-2">
        <Link href="/internal/approvals" className="text-muted-foreground text-sm">
          ← Zur Liste
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Erstprüfung</h1>
        <p className="text-muted-foreground">
          /{view.profile.slug} ·{" "}
          {view.alreadyApproved
            ? "bereits freigegeben"
            : view.submittedAt
              ? "eingereicht"
              : "nicht eingereicht"}
        </p>
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
        <h2 className="text-2xl font-bold">{revision?.name || "Name fehlt"}</h2>
        <p className="leading-7 whitespace-pre-line">
          {revision?.shortIntro || "Kurzvorstellung fehlt."}
        </p>
        <ul className="text-sm">
          {revision?.officialUrl ? <li>Link: {revision.officialUrl}</li> : null}
          {revision?.publicContact ? (
            <li>Kontakt: {revision.publicContact}</li>
          ) : null}
          {image?.altText ? <li>Bildbeschreibung: {image.altText}</li> : null}
        </ul>
      </article>

      {canApprove && revision ? (
        <ApproveForm
          action={approveFirst}
          profileId={profileId}
          revisionId={revision.id}
        />
      ) : (
        <p role="note">
          {view.alreadyApproved
            ? "Dieses Profil ist bereits freigegeben."
            : "Dieser Stand kann nicht freigegeben werden."}
        </p>
      )}
    </main>
  );
}
