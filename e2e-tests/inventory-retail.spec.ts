import { expect, test } from "@playwright/test";

test("depo ürünü perakende satışla azalır ve aylık rapora eklenir", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Depo" }).click();
  await page.getByRole("button", { name: "Ürün ekle" }).click();
  await page.getByLabel("Depo ürün adı").fill("Test Ürünü");
  await page.getByLabel("Depo ürün fiyatı").fill("1000");
  await page.getByLabel("Depo ürün adedi").fill("8");
  await page.getByRole("button", { name: "Ürünü depoya ekle" }).click();
  await expect(page.getByText("8 adet")).toBeVisible();

  await page.getByRole("button", { name: "Perakende satış" }).click();
  await page.getByLabel("Perakende ürün").selectOption({ label: "Test Ürünü · Stok: 8" });
  await page.getByLabel("Perakende satış adedi").fill("3");
  await page.getByRole("button", { name: "Satışı tamamla" }).click();
  await expect(page.getByText("5 adet")).toBeVisible();

  await page.getByRole("button", { name: "Raporlar" }).click();
  await expect(page.getByText("Aylık perakende satış")).toBeVisible();
  await expect(page.getByText("₺3.000,00").first()).toBeVisible();
});
