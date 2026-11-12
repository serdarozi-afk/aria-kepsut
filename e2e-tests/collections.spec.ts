import { test, expect } from "@playwright/test";

test("records a collection for a registered customer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tahsilatlar" }).click();

  await page.getByLabel("Tahsilat müşteri adı").selectOption({ label: "Selin Yılmaz" });
  await page.getByLabel("Ödeme türü").selectOption("Havale");
  await page.getByLabel("Tahsilat tutarı").fill("3250");
  await page.getByRole("button", { name: "Tahsilatı kaydet" }).click();

  await expect(page.getByRole("cell", { name: "Selin Yılmaz" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Havale" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "₺3.250,00" })).toBeVisible();
});
