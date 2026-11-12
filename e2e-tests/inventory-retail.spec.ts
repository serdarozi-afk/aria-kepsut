import { expect, test } from "@playwright/test";

test("ürün kataloğu satış ve depo akışlarının ortak kaynağıdır", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ürünler" }).click();
  await page.getByRole("button", { name: "Ürün ekle" }).click();
  await page.getByLabel("Yeni ürün adı").fill("Test Ürünü");
  await page.getByLabel("Yeni ürün fiyatı").fill("1000");
  await page.getByRole("button", { name: "Ürünü listeye ekle" }).click();

  await page.getByRole("button", { name: "Depo" }).click();
  await page.getByRole("button", { name: "Depoya stok ekle" }).click();
  await page.getByLabel("Stok eklenecek ürün").selectOption({ label: "Test Ürünü · Mevcut stok: 0" });
  await page.getByLabel("Eklenecek stok adedi").fill("8");
  await page.getByRole("button", { name: "Depo stoğunu güncelle" }).click();
  await expect(page.getByText("8 adet")).toBeVisible();

  await page.getByRole("button", { name: "Perakende satış" }).click();
  await page.getByLabel("Perakende ürün").selectOption({ label: "Test Ürünü · Stok: 8" });
  await page.getByLabel("Perakende satış adedi").fill("3");
  await page.getByLabel("Perakende birim fiyatı").fill("900");
  await page.getByRole("button", { name: "Satışı tamamla" }).click();
  await expect(page.getByText("5 adet")).toBeVisible();

  await page.getByRole("button", { name: "Raporlar" }).click();
  await expect(page.getByText("Aylık perakende satış")).toBeVisible();
  await expect(page.getByText("₺2.700,00").first()).toBeVisible();
});
