import { test, expect } from "@playwright/test";

test("adds dated notes and lists them when the date is selected", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Yapılacak İşler" }).click();

  await page.getByLabel("Not tarihi").fill("2030-03-15");
  await page.getByLabel("Yeni not").fill("Teklif için müşteriyi ara");
  await page.getByRole("button", { name: "Notu kaydet" }).click();
  await expect(page.getByText("Teklif için müşteriyi ara")).toBeVisible();

  await page.getByLabel("Not tarihi").fill("2030-03-16");
  await expect(page.getByText("Bu tarih için kayıtlı not yok.")).toBeVisible();
  await page.getByLabel("Not tarihi").fill("2030-03-15");
  await expect(page.getByText("Teklif için müşteriyi ara")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Yapılacak İşler" }).click();
  await page.getByLabel("Not tarihi").fill("2030-03-15");
  await expect(page.getByText("Teklif için müşteriyi ara")).toBeVisible();
});
