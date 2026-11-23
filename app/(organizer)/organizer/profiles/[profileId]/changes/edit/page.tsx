import { redirect } from "next/navigation";

import { LiveEditScreen } from "@/components/profile/live-edit-screen";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { saveLiveChanges } from "../actions";

export const dynamic = "force-dynamic";

// Change a live profile (Figma LPA-01a to 01c, with 01d when something typed
// is not saved). Changes go into the private draft; the public page stays as
// it is until the owner publishes.
export default async function EditLiveProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const view = await loadOwnerProfileView(profileId, `${base}/changes/edit`);

  // Before the first publication the profile steps apply.
  if (!view.live) redirect(`${base}/edit`);

  const { revision } = view;

  return (
    <LiveEditScreen
      lang={lang}
      homeHref="/organizer"
      action={saveLiveChanges.bind(null, profileId)}
      initial={{
        name: revision?.name ?? "",
        shortIntro: revision?.shortIntro ?? "",
        slug: view.profile.slug,
        officialUrl: revision?.officialUrl ?? "",
        instagram: revision?.instagramHandle
          ? `@${revision.instagramHandle}`
          : "",
        extraLinks: revision?.extraLinks ?? [],
        publicContact: revision?.publicContact ?? "",
      }}
    />
  );
}
