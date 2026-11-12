import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart3, ShoppingBag, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Collection, RetailSale, Sale } from "@/pages/Index";

type ReportsPageProps = { sales: Sale[]; collections: Collection[]; retailSales: RetailSale[] };
const money = (value: number) => `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} TL`;
const currentMonth = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 7);

const ReportsPage = ({ sales, collections, retailSales }: ReportsPageProps) => {
  const [month, setMonth] = useState(currentMonth);
  const retailTotal = retailSales.filter(sale => sale.month === month).reduce((sum, sale) => sum + sale.total, 0);
  const customerSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCollections = collections.reduce((sum, item) => sum + item.amount, 0);
  const reportCards = [
    { title: "Toplam satışlar", value: money(customerSales + retailSales.reduce((sum, sale) => sum + sale.total, 0)), icon: ArrowUpRight, color: "bg-[#eaf3f1] text-[#247b78]" },
    { title: "Toplam tahsilatlar", value: money(totalCollections), icon: Wallet, color: "bg-[#f1ecfa] text-[#7657a1]" },
    { title: "Toplam alacaklar", value: money(customerSales - totalCollections), icon: ArrowDownRight, color: "bg-[#fff3e3] text-[#a66a12]" },
    { title: "Aylık perakende satış", value: money(retailTotal), icon: ShoppingBag, color: "bg-[#eaf0fb] text-[#4968a3]" },
  ];
  return <div className="mx-auto max-w-[1200px]"><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.15em] text-[#8b9b95]">İŞLETME ÖZETİ</p><h1 className="font-serif text-[32px] font-semibold tracking-tight text-[#263a35]">Raporlar</h1><p className="mt-1.5 text-[13px] text-[#82918c]">Satış, tahsilat ve alacak durumunu takip edin.</p></div><label className="text-xs font-semibold text-[#53645e]">Rapor ayı<Input aria-label="Rapor ayı" type="month" lang="tr" value={month} onChange={event=>setMonth(event.target.value)} className="mt-1.5 h-10 rounded-xl sm:w-[190px]"/></label></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{reportCards.map(card=><article key={card.title} className="rounded-2xl border border-[#e7ece9] bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#82918c]">{card.title}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}><card.icon size={17}/></span></div><p className="mt-5 font-serif text-[25px] font-semibold tracking-tight text-[#344842]">{card.value}</p>{card.title==="Aylık perakende satış"&&<p className="mt-2 text-[10px] text-[#8b9a95]">Seçilen aya ait depo satışları</p>}</article>)}</div><section className="mt-5 rounded-2xl border border-[#e7ece9] bg-white p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf0fb] text-[#4968a3]"><BarChart3 size={19}/></span><div><h2 className="font-serif text-lg font-semibold">Aylık perakende satış özeti</h2><p className="mt-1 text-xs text-[#8b9a95]">{retailSales.filter(sale=>sale.month===month).length} satış kaydı · {new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`))}</p></div></div><p className="mt-5 border-t border-[#edf0ee] pt-5 font-serif text-2xl font-semibold text-[#247b78]">{money(retailTotal)}</p></section></div>;
};

export default ReportsPage;
