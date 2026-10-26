import { execFileSync } from "node:child_process";

// Seeding goes through the real founder path: the founder role is set directly
// (there is no client path for it by design) and organizer profiles are created
// by calling provision_profile_owner as the founder. Sign-in itself creates no
// profile and no role, which the tests rely on.

const DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

export function sql(statement: string): string {
  return execFileSync(
    "psql",
    [DATABASE_URL, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", statement],
    { encoding: "utf8" },
  ).trim();
}

export function userIdByEmail(email: string): string {
  const id = sql(
    `select id from auth.users where email = '${email.replace(/'/g, "''")}'`,
  );

  if (!id) {
    throw new Error("User does not exist yet; sign in first");
  }

  return id;
}

export function makeFounder(userId: string): void {
  sql(
    `insert into public.app_roles (user_id, is_founder) values ('${userId}', true) on conflict (user_id) do update set is_founder = true`,
  );
}

// Calls provision_profile_owner with the founder's JWT claims, exactly as the
// authenticated API role would.
export function provisionAs(
  founderId: string,
  ownerId: string,
  slug: string,
  name: string,
): string {
  const claims = JSON.stringify({ sub: founderId, role: "authenticated" });
  const out = execFileSync(
    "psql",
    [DATABASE_URL, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1"],
    {
      encoding: "utf8",
      input: `begin;
select set_config('request.jwt.claims', '${claims}', true);
set local role authenticated;
select public.provision_profile_owner('${ownerId}', '${slug}', '${name}');
commit;
`,
    },
  );

  // Output has the set_config value and the profile id; the id is the last uuid.
  const ids = out.match(/[0-9a-f]{8}-[0-9a-f-]{27}/g);

  if (!ids || ids.length === 0) {
    throw new Error("Provisioning returned no profile id");
  }

  return ids[ids.length - 1];
}
