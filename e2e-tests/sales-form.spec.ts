import { test, expect } from "@playwright/test";

test("creates a sale using an existing customer and catalog product", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Satışlar" }).click();

  await page.getByLabel("Müşteri adı").selectOption({ label: "Selin Yılmaz" });
  await page.getByLabel("Ürün adı").selectOption({ label: "Danışmanlık Paketi" });
  await page.getByLabel("Adet").fill("2");

  await expect(page.getByText("₺25.000,00")).toBeVisible();
  await page.getByRole("button", { name: "Satışı kaydet" }).click();

  await expect(page.getByText("Selin Yılmaz", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Danışmanlık Paketi", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("₺25.000,00", { exact: true }).last()).toBeVisible();
});

test("adds a product to the catalog", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ürünler" }).click();
  await page.getByRole("button", { name: "Ürün ekle" }).click();
  await page.getByLabel("Yeni ürün adı").fill("Test ürünü");
  await page.getByLabel("Yeni ürün fiyatı").fill("1500");
  await page.getByRole("button", { name: "Ürünü listeye ekle" }).click();
  await expect(page.getByText("Test ürünü", { exact: true })).toBeVisible();
});
