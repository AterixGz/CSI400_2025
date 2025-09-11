// ...existing code...
import { useState } from "react";
import SidebarFilters from "../components/sidebarFilter";
import ProductCard from "../components/ProductCard";
import { PRODUCTS } from "../data/seed-list";

const baht = (n) => `฿${n.toLocaleString("th-TH")}`;
const stars = (value = 0) => `${value.toFixed(1)}`;

const Icon = {
  ChevronDown: ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Grid: ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  ),
  List: ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
    </svg>
  ),
};

function ProductsHeader({ count, view, setView }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-extrabold">สินค้าทั้งหมด</h2>
        <p className="text-slate-600 text-sm mt-1">พบ {count} รายการ</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <select className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm">
            <option>สินค้าใหม่ล่าสุด</option>
            <option>ราคาต่ำไปสูง</option>
            <option>ราคาสูงไปต่ำ</option>
            <option>เรตติ้งสูงสุด</option>
          </select>
          <Icon.ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
        </div>
        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
          <button onClick={()=>setView("grid")} className={`p-2 ${view==='grid'? 'bg-teal-700 text-white':'bg-white text-slate-700'}`} title="แบบกริด">
            <Icon.Grid className="w-5 h-5" />
          </button>
          <button onClick={()=>setView("list")} className={`p-2 ${view==='list'? 'bg-teal-700 text-white':'bg-white text-slate-700'}`} title="แบบลิสต์">
            <Icon.List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage({ onAdd }) {
  const [view, setView] = useState("grid");
  const items = PRODUCTS; // สามารถต่อยอดกรอง/เรียงจริงได้ภายหลัง

  return (
    <section className="max-w-6xl mx-auto px-6 py-6">
      <ProductsHeader count={items.length} view={view} setView={setView} />

      <div className="mt-6 flex gap-6">
        <SidebarFilters />

        <div className="flex-1">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {items.map((p) => (
                <ProductCard key={p.id} p={p} onAdd={onAdd} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((p)=> (
                <div key={p.id} className="flex gap-4 border rounded-2xl overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-60 h-44 object-cover" />
                  <div className="flex-1 p-4 bg-[#e8fbfb]">
                    <div className="font-bold text-lg">{p.name}</div>
                    <div className="mt-1 text-sm text-slate-600">⭐ {stars(p.rating)} ({p.reviews})</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <div className="text-2xl font-extrabold">{baht(p.price)}</div>
                      {p.compareAt && <del className="text-slate-500">{baht(p.compareAt)}</del>}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-slate-600 text-sm">สี:</span>
                      {p.colors?.map((c, i) => (
                        <span key={i} className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" style={{ background: c }} />
                      ))}
                    </div>
                    <button onClick={()=>onAdd(p)} className="mt-3 px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold hover:bg-slate-50">เพิ่มลงตะกร้า</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
// ...existing code...