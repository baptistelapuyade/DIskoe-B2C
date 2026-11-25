import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileView } from "@/components/public/profile-view";
import { getLang } from "@/lib/i18n/server";
import { profileMetadata } from "@/lib/public/metadata";
import { getPublicProfileBySlug, listUpcomingEvents } from "@/lib/public/queries";

// The public page of an organizer. Fixed routes (/e, /organizer, /login, ...)
// win over this one, and the database keeps those words out of profile slugs.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ profileSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profileSlug } = await params;
  const profile = await getPublicProfileBySlug(profileSlug);

  return profile ? profileMetadata(profile) : { title: "Nicht gefunden" };
}

export default async function ProfilePage({ params }: Props) {
  const { profileSlug } = await params;
  const profile = await getPublicProfileBySlug(profileSlug);

  if (!profile) {
    notFound();
  }

  const events = await listUpcomingEvents(await getLang(), profile);

  return <ProfileView profile={profile} events={events} />;
}
