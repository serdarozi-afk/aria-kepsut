import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirebaseUser } from "@/components/FirebaseAuthGate";
import { useGoogleSheets } from "@/components/GoogleSheetsGate";

type ChatMessage = { id: number; sender: string; text: string; date: string; time: string };
const dateKey = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10).split("-").reverse().join("/");

const TeamChat = () => {
  const { data, saveTable } = useGoogleSheets();
  const { user } = useFirebaseUser();
  const [messages, setMessages] = useState<ChatMessage[]>(() => data.ChatMessages as unknown as ChatMessage[]);
  const [draft, setDraft] = useState("");

  useEffect(() => { saveTable("ChatMessages", messages); }, [messages, saveTable]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    setMessages(current => [...current, { id: Date.now(), sender: user?.displayName || user?.email || "Google kullanıcısı", text, date: dateKey(now), time: now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) }]);
    setDraft("");
  };

  return <div className="mx-auto max-w-[1000px]">
    <div className="mb-7"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.15em] text-[#8b9b95]">EKİP İLETİŞİMİ</p><h1 className="font-serif text-[32px] font-semibold tracking-tight text-[#263a35]">Sohbet</h1><p className="mt-1.5 text-[13px] text-[#82918c]">Ekip alanındaki mesajlarınızı burada paylaşın.</p></div>
    <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-[#e7ece9] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#edf0ee] px-5 py-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3f1] text-[#247b78]"><MessageCircle size={19}/></span><div><h2 className="font-serif text-lg font-semibold text-[#344842]">Ekip sohbeti</h2><p className="text-[11px] text-[#8b9a95]">Mesajlar Google E-Tablolar dosyanızda saklanır.</p></div><span className="ml-auto flex items-center gap-1.5 rounded-full bg-[#edf6f1] px-2.5 py-1 text-[10px] font-semibold text-[#43816e]"><i className="h-1.5 w-1.5 rounded-full bg-[#52a486]"/>Drive senkronu</span></div>
      <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-[#fbfcfb] p-4 md:p-6">{messages.length===0 ? <div className="flex h-full min-h-[350px] flex-col items-center justify-center text-center"><span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3f1] text-[#247b78]"><MessageCircle size={24}/></span><p className="text-sm font-semibold text-[#52635d]">Sohbet henüz başlamadı</p><p className="mt-1 text-xs text-[#94a19c]">Ekibin için ilk mesajı yaz.</p></div> : messages.map(message => <article key={message.id} className="flex max-w-[85%] items-start gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e7d9cd] text-[9px] font-bold text-[#765d4a]">{message.sender.slice(0, 2).toUpperCase()}</span><div className="min-w-0 rounded-2xl rounded-tl-md border border-[#edf0ee] bg-white px-3.5 py-2.5 shadow-sm"><div className="mb-1 flex items-center gap-2"><span className="text-[11px] font-semibold text-[#3f554d]">{message.sender}</span><span className="text-[9px] text-[#9aa6a1]">{message.date} · {message.time}</span></div><p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#53645e]">{message.text}</p></div></article>)}</div>
      <form onSubmit={event => { event.preventDefault(); sendMessage(); }} className="border-t border-[#edf0ee] bg-white p-4 md:p-5"><label className="sr-only" htmlFor="team-chat-message">Mesajınız</label><div className="flex items-end gap-2"><textarea id="team-chat-message" aria-label="Mesajınız" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} rows={2} placeholder="Mesajınızı yazın..." className="min-h-[48px] flex-1 resize-none rounded-xl border border-[#e4ebe7] bg-[#fbfcfb] px-3.5 py-3 text-[13px] outline-none placeholder:text-[#a5b0ac] focus:border-[#76aaa0]"/><Button type="submit" disabled={!draft.trim()} aria-label="Mesajı gönder" className="h-11 w-11 shrink-0 rounded-xl bg-[#247b78] p-0 hover:bg-[#1c6966]"><Send size={17}/></Button></div><p className="mt-2 text-[10px] text-[#9aa6a1]">Enter ile gönder · Shift + Enter ile yeni satır</p></form>
    </section>
  </div>;
};

export default TeamChat;
