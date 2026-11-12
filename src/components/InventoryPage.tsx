import { useState } from "react";
import { Package, Plus, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Product, RetailSale } from "@/pages/Index";

type InventoryPageProps = { products: Product[]; retailSales: RetailSale[]; onAddProduct: (name: string, price: number, stock: number) => void; onRetailSale: (productId: number, quantity: number, date: string) => void };
const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(value);
const todayIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const InventoryPage = ({ products, retailSales, onAddProduct, onRetailSale }: InventoryPageProps) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showRetail, setShowRetail] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [saleDate, setSaleDate] = useState(todayIso);
  const product = products.find(item => String(item.id) === selectedProduct);
  const qty = Number(quantity);
  const total = (product?.price ?? 0) * (Number.isFinite(qty) ? qty : 0);

  const addProduct = () => {
    const price = Number(productPrice);
    const stock = Number(productStock);
    if (!productName.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return;
    onAddProduct(productName.trim(), price, stock);
    setProductName(""); setProductPrice(""); setProductStock(""); setShowAdd(false);
  };

  const sell = () => {
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > product.stock) return;
    onRetailSale(product.id, qty, saleDate);
    setSelectedProduct(""); setQuantity("1"); setSaleDate(todayIso()); setShowRetail(false);
  };

  return <div className="mx-auto max-w-[1200px]">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.15em] text-[#8b9b95]">STOK YÖNETİMİ</p><h1 className="font-serif text-[32px] font-semibold tracking-tight text-[#263a35]">Depo</h1><p className="mt-1.5 text-[13px] text-[#82918c]">Ürün stoklarını izleyin ve perakende satış yapın.</p></div><div className="flex gap-2"><Dialog open={showAdd} onOpenChange={setShowAdd}><DialogTrigger asChild><Button variant="outline" className="rounded-xl border-[#dfe9e4] text-[#4c6960]"><Plus size={15} className="mr-1.5"/>Ürün ekle</Button></DialogTrigger><DialogContent className="rounded-2xl sm:max-w-[430px]"><DialogHeader><DialogTitle className="font-serif text-xl">Depoya ürün ekle</DialogTitle></DialogHeader><div className="space-y-4 pt-2"><label className="block text-xs font-semibold text-[#50615c]">Ürün adı<Input aria-label="Depo ürün adı" value={productName} onChange={event=>setProductName(event.target.value)} placeholder="Ürün adı" className="mt-1.5 rounded-xl"/></label><label className="block text-xs font-semibold text-[#50615c]">Birim fiyat (₺)<Input aria-label="Depo ürün fiyatı" type="number" min="0" step="0.01" value={productPrice} onChange={event=>setProductPrice(event.target.value)} placeholder="0" className="mt-1.5 rounded-xl"/></label><label className="block text-xs font-semibold text-[#50615c]">Depo adedi<Input aria-label="Depo ürün adedi" type="number" min="0" step="1" value={productStock} onChange={event=>setProductStock(event.target.value)} placeholder="0" className="mt-1.5 rounded-xl"/></label><Button onClick={addProduct} className="w-full rounded-xl bg-[#247b78] hover:bg-[#1c6966]">Ürünü depoya ekle</Button></div></DialogContent></Dialog><Dialog open={showRetail} onOpenChange={setShowRetail}><DialogTrigger asChild><Button className="rounded-xl bg-[#247b78] hover:bg-[#1c6966]"><ShoppingBag size={15} className="mr-1.5"/>Perakende satış</Button></DialogTrigger><DialogContent className="rounded-2xl sm:max-w-[460px]"><DialogHeader><DialogTitle className="font-serif text-xl">Perakende satış</DialogTitle></DialogHeader><div className="space-y-4 pt-2"><label className="block text-xs font-semibold text-[#50615c]">Ürün<select aria-label="Perakende ürün" value={selectedProduct} onChange={event=>setSelectedProduct(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-[#e4ebe7] bg-white px-3 text-[13px] outline-none focus:border-[#76aaa0]"><option value="">Depodan ürün seçin</option>{products.filter(item=>item.stock>0).map(item=><option key={item.id} value={item.id}>{item.name} · Stok: {item.stock}</option>)}</select></label><label className="block text-xs font-semibold text-[#50615c]">Adet<Input aria-label="Perakende satış adedi" type="number" min="1" step="1" max={product?.stock} value={quantity} onChange={event=>setQuantity(event.target.value)} className="mt-1.5 rounded-xl"/></label><label className="block text-xs font-semibold text-[#50615c]">Satış tarihi<Input aria-label="Perakende satış tarihi" type="date" lang="tr" value={saleDate} onChange={event=>setSaleDate(event.target.value)} className="mt-1.5 rounded-xl"/></label><div className="rounded-xl bg-[#f6faf8] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-[#82928c]">TOPLAM SATIŞ</span><p className="mt-1 font-serif text-xl font-semibold text-[#247b78]">{money(total)}</p>{product&&<p className="mt-1 text-[10px] text-[#8b9a95]">Birim fiyat {money(product.price)} · Mevcut stok {product.stock}</p>}</div><Button onClick={sell} disabled={!product||!Number.isInteger(qty)||qty<1||qty>(product?.stock??0)} className="w-full rounded-xl bg-[#247b78] hover:bg-[#1c6966]"><Check size={15} className="mr-2"/>Satışı tamamla</Button></div></DialogContent></Dialog></div></div>
    <section className="overflow-hidden rounded-2xl border border-[#e7ece9] bg-white"><div className="border-b border-[#edf0ee] px-5 py-4"><h2 className="font-serif text-lg font-semibold">Depo ürünleri</h2><p className="mt-1 text-[11px] text-[#8b9a95]">Stok miktarları perakende satışlarda otomatik güncellenir.</p></div>{products.length===0?<p className="px-5 py-12 text-center text-xs text-[#8b9a95]">Depoda henüz ürün yok.</p>:<div className="divide-y divide-[#f0f2f1]">{products.map(item=><div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3f1] text-[#247b78]"><Package size={18}/></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#344842]">{item.name}</p><p className="mt-1 text-[11px] text-[#8b9a95]">Birim fiyat {money(item.price)}</p></div></div><div className="text-right"><p className={`text-sm font-bold ${item.stock===0?"text-[#c56552]":"text-[#247b78]"}`}>{item.stock} adet</p><p className="mt-1 text-[10px] text-[#9aa6a1]">Depo stoku</p></div></div>)}</div>}</section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#e7ece9] bg-white"><div className="border-b border-[#edf0ee] px-5 py-4"><h2 className="font-serif text-lg font-semibold">Son perakende satışlar</h2></div>{retailSales.length===0?<p className="px-5 py-10 text-center text-xs text-[#8b9a95]">Henüz perakende satış yok.</p>:<div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="bg-[#fafbfa] text-[9px] font-bold uppercase tracking-wider text-[#9aa6a2]"><tr><th className="px-5 py-3">Tarih</th><th className="px-4 py-3">Ürün</th><th className="px-4 py-3">Adet</th><th className="px-5 py-3">Toplam</th></tr></thead><tbody>{retailSales.slice().reverse().map(sale=><tr key={sale.id} className="border-t border-[#f0f2f1] text-xs"><td className="px-5 py-3.5">{sale.date}</td><td className="px-4 py-3.5 font-medium">{sale.product}</td><td className="px-4 py-3.5">{sale.quantity}</td><td className="px-5 py-3.5 font-semibold text-[#247b78]">{money(sale.total)}</td></tr>)}</tbody></table></div>}</section>
  </div>;
};

export default InventoryPage;
