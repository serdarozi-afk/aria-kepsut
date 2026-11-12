import { Fragment, useState } from "react";
import { ChevronDown, FileDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Collection, Customer, Sale } from "@/pages/Index";

type Props = { customer: Customer; sales: Sale[]; collections: Collection[]; onDownload: () => void };
const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(value);

const AccountSummary = ({ customer, sales, collections, onDownload }: Props) => {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const salesTotal = sales.reduce((sum, sale) => sum + sale.total, 0);
  const collectionsTotal = collections.reduce((sum, item) => sum + item.amount, 0);
  const whatsappMessage = `Aria Kepsut Yem Hesap Özeti\nMüşteri: ${customer.name}\nToplam satış: ${money(salesTotal)}\nToplam tahsilat: ${money(collectionsTotal)}\nBakiye: ${money(salesTotal - collectionsTotal)}`;
  const phoneDigits = customer.phone.replace(/\D/g, "");
  const whatsappPhone = phoneDigits.startsWith("90") ? phoneDigits : phoneDigits.startsWith("0") ? `90${phoneDigits.slice(1)}` : `90${phoneDigits}`;
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;
  const salesByDate = Object.entries(sales.reduce<Record<string, Sale[]>>((groups, sale) => {
    (groups[sale.date] ??= []).push(sale);
    return groups;
  }, {}));
  const summaryCards = [
    { label: "Toplam satış", value: salesTotal, tone: "text-[#247b78]", background: "bg-[#eaf3f1]" },
    { label: "Toplam tahsilat", value: collectionsTotal, tone: "text-[#7657a1]", background: "bg-[#f1ecfa]" },
    { label: "Bakiye", value: salesTotal - collectionsTotal, tone: "text-[#a66a12]", background: "bg-[#fff3e3]" },
  ];

  const toggleDate = (date: string) => setExpandedDates(current => current.includes(date) ? current.filter(item => item !== date) : [...current, date]);

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">{summaryCards.map(card => <article key={card.label} className={`rounded-xl border border-[#edf0ee] p-4 ${card.background}`}><p className="text-xs font-semibold text-[#687874]">{card.label}</p><p className={`mt-3 font-serif text-xl font-semibold ${card.tone}`}>{money(card.value)}</p></article>)}</div>
    <div className="grid gap-3 rounded-xl bg-[#f6faf8] p-4 text-xs sm:grid-cols-2"><p><span className="text-[#82918c]">Adres: </span>{customer.address}</p><p><span className="text-[#82918c]">TCKN: </span>{customer.tckn}</p><p><span className="text-[#82918c]">Cep tel: </span>{customer.phone}</p></div>
    <section><h3 className="mb-2 text-sm font-semibold">Satışlar</h3>{sales.length === 0 ? <p className="rounded-lg bg-[#fafbfa] p-3 text-xs text-[#8b9a95]">Bu müşteri için kayıtlı satış yok.</p> : <div className="overflow-hidden rounded-xl border border-[#edf0ee]"><div className="max-h-52 overflow-auto"><table className="w-full min-w-[460px] text-left text-xs"><thead className="sticky top-0 z-[1] bg-[#fafbfa] text-[#83918c]"><tr><th className="p-2.5">Tarih / detay</th><th className="p-2.5">Satış adedi</th><th className="p-2.5 text-right">Toplam</th></tr></thead><tbody>{salesByDate.map(([date, dateSales]) => {
      const expanded = expandedDates.includes(date);
      const dateTotal = dateSales.reduce((sum, sale) => sum + sale.total, 0);
      return <Fragment key={date}>
        <tr key={`group-${date}`} className="border-t border-[#f0f2f1] bg-white hover:bg-[#f8faf9]"><td colSpan={3} className="p-0"><button type="button" onClick={() => toggleDate(date)} aria-expanded={expanded} className="flex w-full items-center justify-between gap-3 px-2.5 py-3 text-left"><span className="flex items-center gap-2 font-semibold text-[#344842]"><ChevronDown size={14} className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}/>{date}</span><span className="text-[#82918c]">{dateSales.length} satış</span><span className="font-semibold text-[#247b78]">{money(dateTotal)}</span></button></td></tr>
        {expanded && dateSales.map(sale => <tr key={sale.id} className="border-t border-[#f0f2f1] bg-[#fbfcfb]"><td className="p-2.5 pl-8 text-[#566861]">{sale.product}</td><td className="p-2.5">{sale.quantity} adet · {money(sale.unitPrice)} / adet</td><td className="p-2.5 text-right font-medium">{money(sale.total)}</td></tr>)}
      </Fragment>;
    })}</tbody></table></div></div>}</section>
    <section><h3 className="mb-2 text-sm font-semibold">Tahsilatlar</h3>{collections.length === 0 ? <p className="rounded-lg bg-[#fafbfa] p-3 text-xs text-[#8b9a95]">Bu müşteri için kayıtlı tahsilat yok.</p> : <div className="max-h-52 overflow-auto rounded-xl border border-[#edf0ee]"><table className="w-full min-w-[360px] text-left text-xs"><thead className="sticky top-0 bg-[#fafbfa] text-[#83918c]"><tr><th className="p-2.5">Tarih</th><th className="p-2.5">Ödeme türü</th><th className="p-2.5">Tutar</th></tr></thead><tbody>{collections.map(item => <tr key={item.id} className="border-t border-[#f0f2f1]"><td className="p-2.5">{item.date}</td><td className="p-2.5">{item.method}</td><td className="p-2.5 font-medium">{money(item.amount)}</td></tr>)}</tbody></table></div>}</section>
    <div className="grid gap-2 sm:grid-cols-2"><Button asChild className="w-full rounded-xl bg-[#20a65a] hover:bg-[#168a49]"><a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} className="mr-2"/>WhatsApp’tan hesap özeti gönder</a></Button><Button onClick={onDownload} className="w-full rounded-xl bg-[#247b78] hover:bg-[#1c6966]"><FileDown size={16} className="mr-2"/>PDF oluştur</Button></div>
  </div>;
};

export default AccountSummary;
