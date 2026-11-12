import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import firebaseAuth, { isFirebaseConfigured } from "@/lib/firebase";
import GoogleSheetsGate from "@/components/GoogleSheetsGate";

type AuthContextValue = { user: User | null; signOutUser: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export const useFirebaseUser = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useFirebaseUser must be used inside FirebaseAuthGate");
  return value;
};

const GoogleMark = () => <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[18px] w-[18px]"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.92c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.4 37.93 46.98 31.8 46.98 24.55Z"/><path fill="#FBBC05" d="M10.54 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>;

const FirebaseAuthGate = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState("");

  useEffect(() => {
    if (!firebaseAuth) { setLoading(false); return; }
    return onAuthStateChanged(firebaseAuth, nextUser => { setUser(nextUser); setLoading(false); });
  }, []);

  const signOutUser = async () => {
    if (firebaseAuth) await signOut(firebaseAuth);
  };
  const signInWithGoogle = async () => {
    if (!firebaseAuth) return;
    setSignInError("");
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
    } catch (error) {
      const code = (error as { code?: string }).code;
      setSignInError(code === "auth/popup-closed-by-user" ? "Giriş penceresi kapatıldı. Yeniden deneyebilirsiniz." : code === "auth/unauthorized-domain" ? "Bu uygulama adresi Firebase yetkili alan adlarına eklenmeli." : "Google ile giriş tamamlanamadı. Firebase Google sağlayıcısını ve proje ayarlarını kontrol edin.");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f6f8f6] text-[#247b78]"><LoaderCircle className="animate-spin" size={28}/><span className="ml-3 text-sm font-medium">Oturum kontrol ediliyor…</span></div>;

  if (!user) return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7f4] px-5 py-12 text-[#263a35]"><div className="pointer-events-none absolute -left-28 -top-32 h-[380px] w-[380px] rounded-full bg-[#dcebe5]/60 blur-3xl"/><div className="pointer-events-none absolute -bottom-36 -right-24 h-[420px] w-[420px] rounded-full bg-[#efe4d8]/70 blur-3xl"/><section className="relative grid w-full max-w-[980px] overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_28px_80px_-38px_rgba(37,69,58,.28)] md:grid-cols-[1.05fr_.95fr]"><div className="flex min-h-[300px] flex-col justify-between bg-[#234b45] p-8 text-[#f7f8f4] md:p-11"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1f5ef]/10 text-[#d8ebe3]"><CheckCircle2 size={23}/></span><div><p className="font-serif text-xl font-semibold tracking-wide">ARIA KEPSUT</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.2em] text-[#b7d0c6]">CRM WORKSPACE</p></div></div><div className="mt-10 max-w-sm"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#b7d0c6]">İŞİNİZ, TEK YERDE</p><h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-[38px]">İşletmenize güvenle giriş yapın.</h1><p className="mt-4 max-w-xs text-sm leading-6 text-[#d0dfd8]">Müşterilerinizi, depo stoklarınızı ve satışlarınızı yönetmeye devam edin.</p></div><div className="mt-10 flex items-center gap-2 text-[11px] text-[#c1d8ce]"><ShieldCheck size={15}/> Google hesabınızla güvenli kimlik doğrulama</div></div><div className="flex flex-col justify-center p-8 md:p-11"><div className="mb-8"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#80928a]">HOŞ GELDİNİZ</p><h2 className="mt-2 font-serif text-[27px] font-semibold tracking-tight">Hesabınıza giriş yapın</h2><p className="mt-2 text-sm leading-6 text-[#788780]">ARIA KEPSUT çalışma alanınıza devam etmek için Google hesabınızı kullanın.</p></div>{isFirebaseConfigured ? <><Button onClick={signInWithGoogle} className="h-12 w-full rounded-xl border border-[#e2e9e5] bg-white text-sm font-semibold text-[#344842] shadow-sm hover:bg-[#f8faf9]"><GoogleMark/> <span className="ml-3">Google ile devam et</span><ArrowRight size={16} className="ml-auto text-[#83928c]"/></Button>{signInError&&<p role="alert" className="mt-4 rounded-xl bg-[#fff2ef] px-3.5 py-3 text-xs leading-5 text-[#a4483a]">{signInError}</p>}<p className="mt-6 text-center text-[11px] leading-5 text-[#93a099]">Giriş yaparak çalışma alanına erişirsiniz. Yalnızca yetkili Google hesaplarını kullanın.</p></> : <div className="rounded-2xl border border-[#eee3ca] bg-[#fffbf0] p-4"><p className="text-sm font-semibold text-[#735f34]">Firebase yapılandırması gerekli</p><p className="mt-2 text-xs leading-5 text-[#81734f]">Google girişini etkinleştirmek için Firebase proje ayarlarından istemci yapılandırmasını uygulama ortamına ekleyin: <code className="font-semibold">VITE_FIREBASE_API_KEY</code>, <code className="font-semibold">VITE_FIREBASE_AUTH_DOMAIN</code>, <code className="font-semibold">VITE_FIREBASE_PROJECT_ID</code> ve <code className="font-semibold">VITE_FIREBASE_APP_ID</code>. Firebase Console’da Google sağlayıcısını açın ve uygulama alan adını yetkili alan adlarına ekleyin.</p></div>}<div className="mt-8 border-t border-[#edf0ee] pt-5 text-center text-[10px] text-[#9aa6a1]">ARIA KEPSUT · Güvenli çalışma alanı</div></div></section></main>;

  return <AuthContext.Provider value={{ user, signOutUser }}><GoogleSheetsGate user={user} signOutUser={signOutUser}>{children}</GoogleSheetsGate></AuthContext.Provider>;
};

export default FirebaseAuthGate;
