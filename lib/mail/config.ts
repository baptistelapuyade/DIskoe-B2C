// SMTP settings for system mails. Only the variable names are documented; the
// values live in the environment (Amplify, .env.local) and never in Git.

export type MailConfig = {
  host: string;
  port: number;
  user: string | null;
  password: string | null;
  from: string;
  // A local mail catcher (Inbucket/Mailpit in the Supabase stack) takes mails
  // without TLS and without a login. Anything else needs both.
  local: boolean;
};

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const FROM_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

type Env = Record<string, string | undefined>;

export function readMailConfig(env: Env = process.env): MailConfig | null {
  const host = env.MAIL_SMTP_HOST?.trim();
  const from = env.MAIL_FROM?.trim();
  if (!host || !from || !FROM_PATTERN.test(from)) {
    return null;
  }

  const rawPort = env.MAIL_SMTP_PORT?.trim();
  const port = rawPort ? Number(rawPort) : 587;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }

  const local = LOCAL_HOSTS.has(host);
  const user = env.MAIL_SMTP_USER?.trim() || null;
  const password = env.MAIL_SMTP_PASSWORD || null;

  // A remote server without credentials would send unauthenticated; treat that
  // as "not configured" instead of trying.
  if (!local && (!user || !password)) {
    return null;
  }

  return { host, port, user, password, from, local };
}
