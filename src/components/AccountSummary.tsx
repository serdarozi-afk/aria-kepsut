import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import type { Collection, Customer, Sale } from "@/pages/Index";

type Props = { customer: Customer; sales: Sale[]; collections: Collection[]; onDownload: () => void };
const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(value);

const AccountSummary = ({ customer, sales, collections, onDownload }: Props) => {
  const salesTotal = sales.reduce((sum, sale) => sum + sale.total, 0);
  const collectionsTotal = collections.reduce((sum, item) => sum + item.amount, 0);
  const summaryCards = [
    { label: "Toplam satış", value: salesTotal, tone: "text-[#247b78]", background: "bg-[#eaf3f1]" },
    { label: "Toplam tahsilat", value: collectionsTotal, tone: "text-[#7657a1]", background: "bg-[#f1ecfa]" },
    { label: "Bakiye", value: salesTotal - collectionsTotal, tone: "text-[#a66a12]", background: "bg-[#fff3e3]" },
  ];

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">{summaryCards.map(card => <article key={card.label} className={`rounded-xl border border-[#edf0ee] p-4 ${card.background}`}><p className="text-xs font-semibold text-[#687874]">{card.label}</p><p className={`mt-3 font-serif text-xl font-semibold ${card.tone}`}>{money(card.value)}</p></article>)}</div>
    <div className="grid gap-3 rounded-xl bg-[#f6faf8] p-4 text-xs sm:grid-cols-2"><p><span className="text-[#82918c]">Adres: </span>{customer.address}</p><p><span className="text-[#82918c]">TCKN: </span>{customer.tckn}</p><p><span className="text-[#82918c]">Cep tel: </span>{customer.phone}</p></div>
    <section><h3 className="mb-2 text-sm font-semibold">Satışlar</h3>{sales.length === 0 ? <p className="rounded-lg bg-[#fafbfa] p-3 text-xs text-[#8b9a95]">Bu müşteri için kayıtlı satış yok.</p> : <div className="max-h-52 overflow-auto rounded-xl border border-[#edf0ee]"><table className="w-full min-w-[460px] text-left text-xs"><thead className="sticky top-0 bg-[#fafbfa] text-[#83918c]"><tr><th className="p-2.5">Tarih</th><th className="p-2.5">Ürün</th><th className="p-2.5">Adet</th><th className="p-2.5">Birim fiyat</th><th className="p-2.5">Toplam</th></tr></thead><tbody>{sales.map(sale => <tr key={sale.id} className="border-t border-[#f0f2f1]"><td className="p-2.5">{sale.date}</td><td className="p-2.5">{sale.product}</td><td className="p-2.5">{sale.quantity}</td><td className="p-2.5">{money(sale.unitPrice)}</td><td className="p-2.5 font-medium">{money(sale.total)}</td></tr>)}</tbody></table></div>}</section>
    <section><h3 className="mb-2 text-sm font-semibold">Tahsilatlar</h3>{collections.length === 0 ? <p className="rounded-lg bg-[#fafbfa] p-3 text-xs text-[#8b9a95]">Bu müşteri için kayıtlı tahsilat yok.</p> : <div className="max-h-52 overflow-auto rounded-xl border border-[#edf0ee]"><table className="w-full min-w-[360px] text-left text-xs"><thead className="sticky top-0 bg-[#fafbfa] text-[#83918c]"><tr><th className="p-2.5">Tarih</th><th className="p-2.5">Ödeme türü</th><th className="p-2.5">Tutar</th></tr></thead><tbody>{collections.map(item => <tr key={item.id} className="border-t border-[#f0f2f1]"><td className="p-2.5">{item.date}</td><td className="p-2.5">{item.method}</td><td className="p-2.5 font-medium">{money(item.amount)}</td></tr>)}</tbody></table></div>}</section>
    <Button onClick={onDownload} className="w-full rounded-xl bg-[#247b78] hover:bg-[#1c6966]"><FileDown size={16} className="mr-2"/>PDF oluştur</Button>
  </div>;
};

export default AccountSummary;
