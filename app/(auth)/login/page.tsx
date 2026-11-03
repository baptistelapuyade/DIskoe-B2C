import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/auth/guards";
import { getAccess } from "@/lib/auth/server";

import { LegalFooter } from "@/components/public/parts";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Anmelden – DISKOE",
  robots: { index: false, follow: false },
};

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

  if ((await getAccess()).kind !== "anonymous") {
    redirect(next);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="text-muted-foreground mb-4 text-sm font-medium tracking-[0.16em] uppercase">
        DISKOE
      </p>
      <h1 className="text-3xl font-bold tracking-tight">Anmelden</h1>
      <p className="text-muted-foreground mt-3">
        Wir senden dir einen Code per E-Mail. Ein Passwort brauchst du nicht.
      </p>
      <LoginForm next={next} linkError={first(params.error) === "link"} />
      <div className="mt-12">
        <LegalFooter />
      </div>
    </main>
  );
}
