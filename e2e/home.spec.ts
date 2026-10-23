import { expect, test } from "@playwright/test";

test("start page loads", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Das technische Grundgerüst steht." }),
  ).toBeVisible();
});
