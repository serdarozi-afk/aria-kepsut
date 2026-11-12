export const tableFields = {
  Customers: ["id", "name", "company", "address", "tckn", "email", "phone", "status", "value", "date", "initials", "color"],
  Products: ["id", "name", "price", "stock"],
  Sales: ["id", "customer", "product", "quantity", "unitPrice", "total", "date"],
  RetailSales: ["id", "product", "quantity", "unitPrice", "total", "date", "month"],
  Collections: ["id", "customer", "method", "amount", "date"],
  PlannerNotes: ["id", "date", "text"],
  ChatMessages: ["id", "sender", "text", "date", "time"],
} as const;

export type SheetTable = keyof typeof tableFields;
export type SheetRows = Record<SheetTable, Record<string, unknown>[]>;
export const tableTitles: Record<SheetTable, string> = {
  Customers: "Müşteriler",
  Products: "Depo",
  Sales: "Satışlar",
  RetailSales: "Perakende Satışlar",
  Collections: "Tahsilatlar",
  PlannerNotes: "Yapılacak İşler",
  ChatMessages: "Ekip Sohbeti",
};

const numericFields = new Set(["id", "price", "stock", "quantity", "unitPrice", "total", "amount"]);
const apiRequest = async (url: string, token: string, init: RequestInit = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || `Google API isteği başarısız oldu (${response.status}).`);
  }
  return response.json();
};

const sheetRange = (name: string) => `'${name.replaceAll("'", "''")}'!A:Z`;
const spreadsheetUrl = (id: string) => `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}`;

const createSpreadsheet = async (token: string) => {
  const result = await apiRequest("https://sheets.googleapis.com/v4/spreadsheets", token, {
    method: "POST",
    body: JSON.stringify({
      properties: { title: "ARIA KEPSUT Veri Tabanı" },
      sheets: Object.values(tableTitles).map(title => ({ properties: { title } })),
    }),
  });
  const id = result.spreadsheetId as string;
  const headerUpdates = Object.entries(tableTitles).map(([table, title]) => ({
    range: `'${title}'!A1`,
    values: [[...tableFields[table as SheetTable]]],
  }));
  await apiRequest(`${spreadsheetUrl(id)}/values:batchUpdate`, token, {
    method: "POST",
    body: JSON.stringify({ valueInputOption: "RAW", data: headerUpdates }),
  });
  return id;
};

const ensureSheets = async (token: string, id: string) => {
  const result = await apiRequest(`${spreadsheetUrl(id)}?fields=sheets.properties.title`, token);
  const existing = new Set<string>((result.sheets || []).map((sheet: { properties: { title: string } }) => sheet.properties.title));
  const missing = Object.values(tableTitles).filter(title => !existing.has(title));
  if (missing.length) {
    await apiRequest(`${spreadsheetUrl(id)}:batchUpdate`, token, {
      method: "POST",
      body: JSON.stringify({ requests: missing.map(title => ({ addSheet: { properties: { title } } })) }),
    });
  }
  const headers = Object.entries(tableTitles).map(([table, title]) => ({
    range: `'${title}'!A1`,
    values: [[...tableFields[table as SheetTable]]],
  }));
  await apiRequest(`${spreadsheetUrl(id)}/values:batchUpdate`, token, {
    method: "POST",
    body: JSON.stringify({ valueInputOption: "RAW", data: headers }),
  });
};

export const findOrCreateSpreadsheet = async (token: string) => {
  const query = encodeURIComponent("name='ARIA KEPSUT Veri Tabanı' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const found = await apiRequest(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=100`, token);
  const id = found.files?.[0]?.id ? String(found.files[0].id) : await createSpreadsheet(token);
  await ensureSheets(token, id);
  return id;
};

export const readSpreadsheet = async (token: string, id: string): Promise<SheetRows> => {
  const ranges = Object.values(tableTitles).map(title => `ranges=${encodeURIComponent(sheetRange(title))}`).join("&");
  const result = await apiRequest(`${spreadsheetUrl(id)}/values:batchGet?${ranges}`, token);
  const rows: Partial<SheetRows> = {};
  Object.entries(tableTitles).forEach(([table, title], index) => {
    const fields = tableFields[table as SheetTable] as readonly string[];
    const values = result.valueRanges?.[index]?.values || [];
    rows[table as SheetTable] = values.slice(1).filter((row: unknown[]) => row.some(value => value !== "")).map((row: unknown[]) =>
      Object.fromEntries(fields.map((field, fieldIndex) => {
        const value = row[fieldIndex] ?? "";
        return [field, numericFields.has(field) && value !== "" ? Number(value) : value];
      })),
    );
  });
  return rows as SheetRows;
};

export const writeSheetTable = async (token: string, id: string, table: SheetTable, rows: Record<string, unknown>[]) => {
  const title = tableTitles[table];
  await apiRequest(`${spreadsheetUrl(id)}/values:batchClear`, token, {
    method: "POST",
    body: JSON.stringify({ ranges: [`'${title}'!A2:Z`] }),
  });
  if (!rows.length) return;
  const fields = tableFields[table] as readonly string[];
  const values = rows.map(row => fields.map(field => row[field] ?? ""));
  await apiRequest(`${spreadsheetUrl(id)}/values:batchUpdate`, token, {
    method: "POST",
    body: JSON.stringify({ valueInputOption: "RAW", data: [{ range: `'${title}'!A2`, values }] }),
  });
};

export const emptySheetRows = (): SheetRows => ({
  Customers: [], Products: [], Sales: [], RetailSales: [], Collections: [], PlannerNotes: [], ChatMessages: [],
});

export const readLegacyRows = (uid: string): Partial<SheetRows> => {
  const owner = localStorage.getItem("aria-google-legacy-owner");
  if (owner && owner !== uid) return {};
  const legacy: Partial<SheetRows> = {
    Products: JSON.parse(localStorage.getItem("aria-depot-products") || "[]") as Record<string, unknown>[],
    RetailSales: JSON.parse(localStorage.getItem("aria-retail-sales") || "[]") as Record<string, unknown>[],
    PlannerNotes: JSON.parse(localStorage.getItem("aria-kepsut-planner-notes") || "[]") as Record<string, unknown>[],
    ChatMessages: JSON.parse(localStorage.getItem("aria-kepsut-team-chat") || "[]") as Record<string, unknown>[],
  };
  if (!owner && Object.values(legacy).some(rows => rows?.length)) localStorage.setItem("aria-google-legacy-owner", uid);
  return legacy;
};
