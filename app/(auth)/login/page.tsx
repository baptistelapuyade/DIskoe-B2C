import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/layout/auth-shell";
import { safeNextPath } from "@/lib/auth/guards";
import { getAccess } from "@/lib/auth/server";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

import { SignInFlow } from "./sign-in-flow";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: `${t(lang, "Z21.email.eyebrow")} – DISKOE`,
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeNextPath(first(params.next));
  const lang = await getLang();

  if ((await getAccess()).kind !== "anonymous") {
    redirect(next);
  }

  return (
    <AuthShell lang={lang} step={1}>
      <SignInFlow
        lang={lang}
        next={next}
        linkExpired={first(params.error) === "link"}
      />
    </AuthShell>
  );
}
