import { test, expect } from "@playwright/test";

test("adds a customer with identity and contact details", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Toplam satışlar", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Toplam tahsilat", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Toplam alacak", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Yeni müşteri" }).click();
  await page.getByLabel("İsim").fill("Deniz");
  await page.getByLabel("Soyisim").fill("Aksoy");
  await page.getByLabel("Adres").fill("Kepsut, Balıkesir");
  await page.getByLabel("TCKN").fill("12345678901");
  await page.getByLabel("Cep telefon").fill("05551234567");
  await page.getByRole("button", { name: "Müşteriyi ekle" }).click();

  await expect(page.getByRole("button", { name: "Deniz Aksoy" })).toBeVisible();
  const newCustomerRow = page.getByRole("row").filter({ hasText: "Deniz Aksoy" });
  await expect(newCustomerRow.getByRole("cell", { name: "₺0,00" })).toBeVisible();
});

test("exports all customer balances as a PDF", async ({ page }) => {
  await page.goto("/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tüm Bakiyeler" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("tum-bakiyeler.pdf");
});
