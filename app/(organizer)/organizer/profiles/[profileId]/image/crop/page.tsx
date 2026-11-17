import { redirect } from "next/navigation";

import { CropPanel } from "@/components/profile/crop-panel";
import { StepShell } from "@/components/profile/step-shell";
import { readCrop } from "@/lib/domain/profile-publication";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Crop of the profile picture (Figma ORG-05e and ORG-05g).
export default async function ProfileCropPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const lang = await getLang();
  const view = await loadOwnerProfileView(
    profileId,
    `/organizer/profiles/${profileId}/image/crop`,
  );
  const base = `/organizer/profiles/${profileId}`;

  if (!view.image?.signedUrl) {
    redirect(`${base}/image`);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("media_uses")
    .select("crop")
    .eq("id", view.image.useId)
    .maybeSingle();

  return (
    <StepShell
      lang={lang}
      backHref={`${base}/image`}
      eyebrow={t(lang, "Z23.image.eyebrow")}
      title={t(lang, "Z23.crop.title")}
      lead={t(lang, "Z23.crop.lead")}
    >
      <CropPanel
        lang={lang}
        profileId={profileId}
        url={view.image.signedUrl}
        initial={readCrop(data?.crop)}
        imageHref={`${base}/image`}
      />
    </StepShell>
  );
}
