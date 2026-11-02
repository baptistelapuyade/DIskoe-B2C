import { describe, expect, it } from "vitest";

import { readMailConfig } from "../../lib/mail/config";
import {
  profileLiveMail,
  profileQuestionMail,
} from "../../lib/mail/templates";

const remote = {
  MAIL_SMTP_HOST: "smtp.example.test",
  MAIL_SMTP_PORT: "587",
  MAIL_SMTP_USER: "user",
  MAIL_SMTP_PASSWORD: "pw",
  MAIL_FROM: "hello@example.test",
};

describe("readMailConfig", () => {
  it("reads a complete remote configuration", () => {
    expect(readMailConfig(remote)).toEqual({
      host: "smtp.example.test",
      port: 587,
      user: "user",
      password: "pw",
      from: "hello@example.test",
      local: false,
    });
  });

  it("is not configured without host or sender", () => {
    expect(readMailConfig({})).toBeNull();
    expect(readMailConfig({ ...remote, MAIL_SMTP_HOST: "" })).toBeNull();
    expect(readMailConfig({ ...remote, MAIL_FROM: undefined })).toBeNull();
  });

  it("rejects a sender that is not a plain address", () => {
    expect(readMailConfig({ ...remote, MAIL_FROM: "not an address" })).toBeNull();
    expect(
      readMailConfig({ ...remote, MAIL_FROM: "DISKOE <hello@example.test>" }),
    ).toBeNull();
  });

  it("refuses a remote server without credentials", () => {
    expect(readMailConfig({ ...remote, MAIL_SMTP_USER: "" })).toBeNull();
    expect(readMailConfig({ ...remote, MAIL_SMTP_PASSWORD: "" })).toBeNull();
  });

  it("accepts a local mail catcher without credentials", () => {
    const config = readMailConfig({
      MAIL_SMTP_HOST: "127.0.0.1",
      MAIL_SMTP_PORT: "54325",
      MAIL_FROM: "hello@example.test",
    });

    expect(config).toMatchObject({ local: true, user: null, password: null });
  });

  it("defaults to port 587 and rejects invalid ports", () => {
    expect(readMailConfig({ ...remote, MAIL_SMTP_PORT: undefined })?.port).toBe(
      587,
    );
    expect(readMailConfig({ ...remote, MAIL_SMTP_PORT: "abc" })).toBeNull();
    expect(readMailConfig({ ...remote, MAIL_SMTP_PORT: "70000" })).toBeNull();
  });
});

describe("mail templates", () => {
  const url =
    "https://app.example.test/organizer/profiles/00000000-0000-4000-8000-000000000001/status";

  it("names the profile and links only to the profile page", () => {
    const mail = profileLiveMail({ name: "Alpha Events", url });

    expect(mail.subject).toBe("Dein Profil „Alpha Events“ ist jetzt live");
    expect(mail.text).toContain(url);
    expect(mail.html).toContain(`href="${url}"`);
    expect(mail.text.match(/https?:\/\//g)).toHaveLength(1);
  });

  it("does not promise anything the product does not do", () => {
    const text = profileQuestionMail({ name: "Alpha Events", url }).text;

    expect(text).toContain("keine Absage");
    expect(text).not.toMatch(/Newsletter|Angebot|Rabatt/i);
  });

  it("escapes the profile name in HTML", () => {
    const mail = profileLiveMail({ name: '<img src=x onerror="a()">', url });

    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("&lt;img");
  });

  it("keeps line breaks out of the subject", () => {
    const mail = profileQuestionMail({ name: "A\r\nBcc: x@example.test", url });

    expect(mail.subject).not.toMatch(/[\r\n]/);
  });

  it("falls back when the name is missing", () => {
    expect(profileLiveMail({ name: null, url }).subject).toBe(
      "Dein Profil „ohne Namen“ ist jetzt live",
    );
  });

  it("names the first event and links to its management page", () => {
    const mail = profileLiveMail({
      name: "Nebenraum Kollektiv",
      url,
      eventTitle: "Zwischen den Boxen",
      eventUrl: "https://app.example.test/organizer/events/e1/manage",
    });

    expect(mail.text).toContain("Zwischen den Boxen");
    expect(mail.text).toContain("Event verwalten");
    expect(mail.html).toContain('href="https://app.example.test/organizer/events/e1/manage"');
    expect(mail.text.match(/https?:\/\//g)).toHaveLength(2);
  });

  it("escapes the event title in HTML", () => {
    const mail = profileLiveMail({
      name: "A",
      url,
      eventTitle: "<script>x()</script>",
      eventUrl: "https://app.example.test/e",
    });

    expect(mail.html).not.toContain("<script>");
  });

  it("uses the Du-form subject of the question mail without the profile name", () => {
    expect(profileQuestionMail({ name: "Alpha Events", url }).subject).toBe(
      "Rückfrage zu deiner Einreichung",
    );
  });
});
