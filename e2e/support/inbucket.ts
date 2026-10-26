// Reads sign-in e-mails from the local mail catcher of the Supabase stack. No
// real mail is sent anywhere. Older CLI versions ship Inbucket, newer ones
// Mailpit on the same port; both are supported.

const BASE = process.env.INBUCKET_URL ?? "http://127.0.0.1:54324";

type Flavor = "inbucket" | "mailpit";

let detected: Flavor | undefined;

async function flavor(): Promise<Flavor> {
  if (detected) {
    return detected;
  }

  try {
    const response = await fetch(`${BASE}/api/v1/info`);
    detected = response.ok ? "mailpit" : "inbucket";
  } catch {
    detected = "inbucket";
  }

  return detected;
}

function mailboxName(email: string): string {
  return email.split("@")[0];
}

export async function clearMailbox(email: string): Promise<void> {
  if ((await flavor()) === "mailpit") {
    await fetch(
      `${BASE}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
      { method: "DELETE" },
    );
    return;
  }

  await fetch(`${BASE}/api/v1/mailbox/${mailboxName(email)}`, {
    method: "DELETE",
  });
}

async function fetchLatestBody(email: string): Promise<string | undefined> {
  if ((await flavor()) === "mailpit") {
    const list = await fetch(
      `${BASE}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
    );
    if (!list.ok) return undefined;

    const { messages } = (await list.json()) as { messages?: { ID: string }[] };
    if (!messages || messages.length === 0) return undefined;

    const message = await fetch(`${BASE}/api/v1/message/${messages[0].ID}`);
    const json = (await message.json()) as { HTML?: string; Text?: string };
    return `${json.HTML ?? ""}\n${json.Text ?? ""}`;
  }

  const name = mailboxName(email);
  const list = await fetch(`${BASE}/api/v1/mailbox/${name}`);
  if (!list.ok) return undefined;

  const headers = (await list.json()) as { id: string }[];
  if (headers.length === 0) return undefined;

  const last = headers[headers.length - 1];
  const message = await fetch(`${BASE}/api/v1/mailbox/${name}/${last.id}`);
  const json = (await message.json()) as {
    body: { html?: string; text?: string };
  };
  return `${json.body.html ?? ""}\n${json.body.text ?? ""}`;
}

async function latestMessageBody(email: string): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const body = await fetchLatestBody(email);

    if (body) {
      return body;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("No sign-in e-mail arrived in time");
}

export async function waitForCode(email: string): Promise<string> {
  const body = await latestMessageBody(email);
  const match = body.match(/>\s*(\d{6})\s*</) ?? body.match(/\b(\d{6})\b/);

  if (!match) {
    throw new Error("Sign-in e-mail contains no code");
  }

  return match[1];
}

export async function waitForLink(email: string): Promise<string> {
  const body = await latestMessageBody(email);
  const match = body.match(/href="([^"]*\/auth\/v1\/verify[^"]*)"/);

  if (!match) {
    throw new Error("Sign-in e-mail contains no link");
  }

  return match[1].replace(/&amp;/g, "&");
}
