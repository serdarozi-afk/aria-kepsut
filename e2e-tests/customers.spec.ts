import { test, expect } from "@playwright/test";

test("adds a customer with identity and contact details", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Yeni müşteri" }).click();
  await page.getByLabel("İsim").fill("Deniz");
  await page.getByLabel("Soyisim").fill("Aksoy");
  await page.getByLabel("Adres").fill("Kepsut, Balıkesir");
  await page.getByLabel("TCKN").fill("12345678901");
  await page.getByLabel("Cep telefon").fill("05551234567");
  await page.getByRole("button", { name: "Müşteriyi ekle" }).click();

  await expect(page.getByText("Deniz Aksoy", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Kepsut, Balıkesir" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "12345678901" })).toBeVisible();
  await expect(page.getByRole("link", { name: "05551234567" })).toBeVisible();
});
