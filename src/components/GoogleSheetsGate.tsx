import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";
import { CircleAlert, Cloud, LoaderCircle, RefreshCw, Sheet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import firebaseAuth from "@/lib/firebase";
import { emptySheetRows, findOrCreateSpreadsheet, readLegacyRows, readSpreadsheet, writeSheetTable, type SheetRows, type SheetTable } from "@/lib/googleSheets";

type GoogleSheetsContextValue = { data: SheetRows; saveTable: (table: SheetTable, rows: Record<string, unknown>[]) => void };
const GoogleSheetsContext = createContext<GoogleSheetsContextValue | null>(null);
export const useGoogleSheets = () => {
  const value = useContext(GoogleSheetsContext);
  if (!value) throw new Error("useGoogleSheets must be used inside GoogleSheetsGate");
  return value;
};

type Props = { user: User; signOutUser: () => Promise<void>; children: ReactNode };
type CachedToken = { token: string; expiresAt: number };
const tokenKey = (uid: string) => `aria-google-token-${uid}`;
const tokenStorage = (uid: string): CachedToken | null => {
  try {
    const raw = sessionStorage.getItem(tokenKey(uid));
    return raw ? JSON.parse(raw) as CachedToken : null;
  } catch {
    return null;
  }
};

const GoogleSheetsGate = ({ user, signOutUser, children }: Props) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [data, setData] = useState<SheetRows>(emptySheetRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queues = useRef<Partial<Record<SheetTable, Promise<void>>>>({});

  const applyConnection = useCallback(async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const id = await findOrCreateSpreadsheet(token);
      const rows = await readSpreadsheet(token, id);
      const legacy = readLegacyRows(user.uid);
      const imported: SheetTable[] = [];
      (Object.keys(rows) as SheetTable[]).forEach(table => {
        if (!rows[table].length && legacy[table]?.length) {
          rows[table] = legacy[table]!;
          imported.push(table);
        }
      });
      sessionStorage.setItem(tokenKey(user.uid), JSON.stringify({ token, expiresAt: Date.now() + 55 * 60 * 1000 }));
      setSpreadsheetId(id);
      setAccessToken(token);
      setData(rows);
      for (const table of imported) await writeSheetTable(token, id, table, rows[table]);
    } catch (cause) {
      setAccessToken(null);
      setError(cause instanceof Error ? cause.message : "Google E-Tablolar bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    const cached = tokenStorage(user.uid);
    if (!cached || cached.expiresAt <= Date.now()) return;
    void applyConnection(cached.token);
  }, [applyConnection, user.uid]);

  const connect = async () => {
    if (!firebaseAuth) return;
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/drive.file");
      provider.addScope("https://www.googleapis.com/auth/spreadsheets");
      provider.setCustomParameters({ login_hint: user.email || "" });
      const result = await signInWithPopup(firebaseAuth, provider);
      if (result.user.uid !== user.uid) throw new Error("Drive bağlantısı için uygulamaya giriş yaptığınız Google hesabını seçin.");
      const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
      if (!token) throw new Error("Google Drive erişim izni alınamadı. Tekrar deneyip izin ekranını onaylayın.");
      await applyConnection(token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google Drive bağlantısı kurulamadı.");
      setLoading(false);
    }
  };

  const saveTable = useCallback((table: SheetTable, rows: Record<string, unknown>[]) => {
    if (!accessToken || !spreadsheetId) return;
    setData(current => ({ ...current, [table]: rows }));
    const prior = queues.current[table] || Promise.resolve();
    const pending = prior.catch(() => undefined).then(() => writeSheetTable(accessToken, spreadsheetId, table, rows));
    queues.current[table] = pending;
    void pending.catch(cause => setError(cause instanceof Error ? cause.message : "Google E-Tablolar kaydı başarısız oldu."));
  }, [accessToken, spreadsheetId]);

  if (!spreadsheetId || !accessToken) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-5 py-10 text-[#263a35]"><section className="w-full max-w-[560px] rounded-[28px] border border-white bg-white p-7 shadow-[0_24px_70px_-40px_rgba(37,69,58,.32)] sm:p-10"><div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3f1] text-[#247b78]"><Sheet size={24}/></div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#83938d]">GOOGLE DRIVE VERİTABANI</p><h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight">E-Tablolarınızı bağlayın</h1><p className="mt-2 text-sm leading-6 text-[#788780]">ARIA KEPSUT, sizin Drive hesabınızda <strong>ARIA KEPSUT Veri Tabanı</strong> adlı bir E-Tablolar dosyası oluşturacak. Müşteri, depo, satış, tahsilat, plan notları ve sohbet kayıtları bu dosyada saklanacak.</p><div className="my-6 flex items-start gap-3 rounded-xl bg-[#f6faf8] p-4 text-xs leading-5 text-[#5c7068]"><ShieldCheck className="mt-0.5 shrink-0 text-[#247b78]" size={17}/><span>Yalnızca giriş yaptığınız Google hesabına bağlanılır. Dosyanın oluşturulması ve verilerin yazılması için Google Drive ve E-Tablolar erişim izni gereklidir.</span></div>{error&&<p role="alert" className="mb-4 flex gap-2 rounded-xl bg-[#fff2ef] px-3.5 py-3 text-xs leading-5 text-[#a4483a]"><CircleAlert size={16} className="mt-0.5 shrink-0"/>{error}</p>}<Button disabled={loading} onClick={() => void connect()} className="h-12 w-full rounded-xl bg-[#247b78] text-sm font-semibold hover:bg-[#1c6966]">{loading?<LoaderCircle size={17} className="mr-2 animate-spin"/>:<Cloud size={17} className="mr-2"/>}{loading?"Drive bağlanıyor…":"Google Drive’ı bağla"}</Button><button onClick={() => void signOutUser()} className="mt-4 w-full text-center text-xs font-medium text-[#83918b] hover:text-[#384f47]">{user.email} · Hesap değiştir / çıkış yap</button><p className="mt-5 text-center text-[10px] leading-5 text-[#9aa6a1]">Google Drive API ve Google Sheets API, Firebase projenizin Google Cloud projesinde etkin olmalıdır.</p></section></main>;

  return <GoogleSheetsContext.Provider value={{ data, saveTable }}><div>{error&&<div role="status" className="fixed bottom-4 right-4 z-50 flex max-w-[min(92vw,460px)] items-start gap-2 rounded-xl border border-[#eed8d2] bg-white px-4 py-3 text-xs leading-5 text-[#9a4d40] shadow-lg"><CircleAlert size={15} className="mt-0.5 shrink-0"/><span>{error}</span><button onClick={() => void connect()} aria-label="Google Drive bağlantısını yenile" className="ml-1 shrink-0 rounded-lg p-1 hover:bg-[#fff2ef]"><RefreshCw size={14}/></button></div>}{children}</div></GoogleSheetsContext.Provider>;
};

export default GoogleSheetsGate;
