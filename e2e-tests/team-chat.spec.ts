import { test, expect } from "@playwright/test";

test("sends and persists a team chat message", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sohbet" }).click();
  await page.getByLabel("Mesajınız").fill("Toplantı saat 14:00'te.");
  await page.getByRole("button", { name: "Mesajı gönder" }).click();

  await expect(page.getByText("Toplantı saat 14:00'te.")).toBeVisible();
  await expect(page.getByRole("article").getByText("Ece Aydın", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Sohbet" }).click();
  await expect(page.getByText("Toplantı saat 14:00'te.")).toBeVisible();
});
