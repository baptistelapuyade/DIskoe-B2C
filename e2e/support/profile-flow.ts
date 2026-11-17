import { deflateSync } from "node:zlib";

import { expect, type Page } from "@playwright/test";

// Helpers for the organizer's profile steps (details, image, preview, hand-in).
// German texts: the specs run in German contexts (see ./language.ts).

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, crc]);
}

// A valid, solid-colour PNG. The profile image needs at least 400 x 400 pixels
// (checked in the browser and again on the server), so the old 1 x 1 test
// image no longer works.
export function solidPng(width: number, height: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: RGB

  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 0x66)]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

export const PROFILE_PNG = solidPng(400, 400);

// Step 1: fills the details. At least a link or a contact is needed.
export async function saveDetails(
  page: Page,
  values: { intro?: string; website?: string; instagram?: string },
  intent: "next" | "later" = "next",
) {
  if (values.intro !== undefined) {
    await page.getByLabel("Kurzvorstellung").fill(values.intro);
  }
  if (values.website !== undefined) {
    await page.getByLabel("Website", { exact: true }).fill(values.website);
  }
  if (values.instagram !== undefined) {
    await page.getByLabel("Instagram", { exact: true }).fill(values.instagram);
  }

  await page
    .getByRole("button", {
      name: intent === "next" ? "Weiter zum Profilbild" : "Später weitermachen",
    })
    .click();
}

// Step 2: picks the file; the upload starts at once and ends with the image
// shown in the block. The hidden file input is the only file input on the page.
export async function chooseProfileImage(
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer } = {
    name: "stage.png",
    mimeType: "image/png",
    buffer: PROFILE_PNG,
  },
) {
  await page.locator('input[type="file"]').setInputFiles(file);
}

// Hand-in without an event (interim page until the submit screens EIN-01/02).
export async function submitProfileWithoutEvent(page: Page, profileId: string) {
  await page.goto(`/organizer/profiles/${profileId}/submit`);
  await page.getByLabel(/Angaben geprüft und bin berechtigt/).check();
  await page.getByLabel(/öffentlich wird/).check();
  await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();
  await expect(
    page.getByText("Eingereicht. DISKOE prüft dein Profil.").first(),
  ).toBeVisible();
}
