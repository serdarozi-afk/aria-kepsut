import { test, expect } from "@playwright/test";

test("shows a customer's sales and collections and downloads the account summary", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Satışlar" }).click();
  await page.getByLabel("Müşteri adı").selectOption({ label: "Selin Yılmaz" });
  await page.getByLabel("Ürün adı").selectOption({ label: "Danışmanlık Paketi" });
  await page.getByLabel("Satış tarihi").fill("2030-03-15");
  await page.getByRole("button", { name: "Satışı kaydet" }).click();

  await page.getByRole("button", { name: "Tahsilatlar" }).click();
  await page.getByLabel("Tahsilat müşteri adı").selectOption({ label: "Selin Yılmaz" });
  await page.getByLabel("Ödeme türü").selectOption("Nakit");
  await page.getByLabel("Tahsilat tarihi").fill("2030-03-16");
  await page.getByLabel("Tahsilat tutarı").fill("3000");
  await page.getByRole("button", { name: "Tahsilatı kaydet" }).click();

  await page.getByRole("button", { name: "Müşteriler" }).click();
  await page.getByRole("button", { name: "Selin Yılmaz" }).click();
  await expect(page.getByRole("heading", { name: "Hesap özeti · Selin Yılmaz" })).toBeVisible();
  await expect(page.getByText("Danışmanlık Paketi", { exact: true })).toBeVisible();
  await expect(page.getByText("Nakit", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "15/03/2030" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "16/03/2030" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PDF oluştur" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^hesap-ozeti-selin-yilmaz\.pdf$/);
});
