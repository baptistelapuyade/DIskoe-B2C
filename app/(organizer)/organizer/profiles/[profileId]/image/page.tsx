import { ImagePanel } from "@/components/profile/image-panel";
import { StepShell } from "@/components/profile/step-shell";
import { readCrop } from "@/lib/domain/profile-publication";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";
import { createClient } from "@/lib/supabase/server";

import { saveImageStep } from "../actions";

export const dynamic = "force-dynamic";

// Step 2 of the profile: profile picture (Figma ORG-05a to ORG-05d, 05f).
export default async function ProfileImagePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const lang = await getLang();
  const view = await loadOwnerProfileView(
    profileId,
    `/organizer/profiles/${profileId}/image`,
  );
  const base = `/organizer/profiles/${profileId}`;

  let crop = null;

  if (view.image) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("media_uses")
      .select("crop")
      .eq("id", view.image.useId)
      .maybeSingle();
    crop = readCrop(data?.crop);
  }

  return (
    <StepShell
      lang={lang}
      backHref={`${base}/edit`}
      eyebrow={t(lang, "Z23.image.eyebrow")}
      title={t(lang, "Z23.image.title")}
      lead={t(lang, "Z23.image.lead")}
    >
      <ImagePanel
        // A new picture or crop starts the panel afresh.
        key={`${view.image?.useId ?? "none"}-${JSON.stringify(crop)}`}
        lang={lang}
        profileId={profileId}
        image={
          view.image?.signedUrl
            ? { url: view.image.signedUrl, crop, altText: view.image.altText }
            : null
        }
        cropHref={`${base}/image/crop`}
        previewHref={`${base}/preview`}
        backHref={`${base}/edit`}
        saveAction={saveImageStep.bind(null, profileId)}
      />
    </StepShell>
  );
}
