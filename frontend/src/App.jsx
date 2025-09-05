import { useMemo, useState } from "react";

/**
 * Minimal Fashion — React (Vite) + TailwindCSS (JavaScript)
 * เพิ่มหน้า All Products พร้อมแถบกรองด้านซ้าย, ตัวเลือกเรียง, และปุ่มสลับมุมมอง Grid/List
 * 
 * ตั้งค่า Tailwind ตามคอมเมนต์ส่วนหัวก่อนหน้านี้
 */

// -------------------- Mock Data --------------------
const CATEGORIES = [
  { id: "home", label: "หน้าแรก" },
  { id: "women", label: "เสื้อผ้าผู้หญิง" },
  { id: "men", label: "เสื้อผ้าผู้ชาย" },
  { id: "acc", label: "อุปกรณ์เสริม" },
  { id: "sale", label: "ลดราคา" },
];

const PRODUCTS = [
  {
    id: "p1",
    name: "เสื้อเชิ้ตคอตตอน",
    category: "men",
    price: 1290,
    compareAt: 1590,
    rating: 4.6,
    reviews: 89,
    colors: ["#e5e7eb", "#111827", "#f3f4f6"],
    isNew: false,
    isSale: true,
    image:
      "https://images.unsplash.com/photo-1520975954732-35dd221bb62a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p2",
    name: "กางเกงขายาวผ้าลินิน",
    category: "men",
    price: 1890,
    rating: 4.6,
    reviews: 89,
    colors: ["#e2e8f0", "#f7fee7", "#f1f5f9"],
    isNew: true,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1618354691438-c7eac9745f07?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p3",
    name: "เดรสแขนยาว",
    category: "women",
    price: 2290,
    rating: 4.7,
    reviews: 120,
    colors: ["#0f172a", "#e2e8f0"],
    isNew: false,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p4",
    name: "เสื้อยืดพรีเมียม",
    category: "men",
    price: 890,
    rating: 4.4,
    reviews: 67,
    colors: ["#111827", "#e5e7eb", "#94a3b8"],
    isNew: false,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p5",
    name: "รองเท้าผ้าใบขาว",
    category: "acc",
    price: 2590,
    compareAt: 2990,
    rating: 4.6,
    reviews: 134,
    colors: ["#f8fafc", "#e2e8f0"],
    isNew: false,
    isSale: true,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p6",
    name: "กระเป๋าสะพายนังแท้",
    category: "acc",
    price: 3290,
    rating: 4.8,
    reviews: 67,
    colors: ["#111827", "#e5e7eb", "#b45309"],
    isNew: false,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1525966222134-7b74d18c3426?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p7",
    name: "กางเกงยีนส์ขายาว",
    category: "men",
    price: 2190,
    rating: 4.4,
    reviews: 92,
    colors: ["#1e3a8a", "#0f172a"],
    isNew: true,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p8",
    name: "เสื้อสายเดี่ยวผ้าซาติน",
    category: "women",
    price: 1190,
    rating: 4.5,
    reviews: 58,
    colors: ["#f1f5f9", "#fde68a", "#fef9c3"],
    isNew: true,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
  },
];

// -------------------- Small helpers --------------------
const baht = (n) => `฿${n.toLocaleString("th-TH")}`;
const stars = (value = 0) => `${value.toFixed(1)}`;

// -------------------- Icons (Heroicons แบบ inline SVG) --------------------
const Icon = {
  Search: (props) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  User: (props) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
      <path d="M4 20a8 8 0 0 1 16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Heart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
      <path d="M12 21s-7-4.4-9-8.6C1.7 9.3 3.3 6 6.6 6c1.9 0 3.1 1 3.9 2 0.8-1 2-2 3.9-2 3.3 0 4.9 3.3 3.6 6.4-2 4.2-9 8.6-9 8.6z" />
    </svg>
  ),
  Bag: (props) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7a3 3 0 1 1 6 0" />
    </svg>
  ),
  Grid: (props) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  List: (props) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  ChevronDown: (props) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
};

// -------------------- UI --------------------
function Nav({ active, onSelect, cartCount, go }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Left: Brand */}
        <button onClick={() => go("home")} className="flex items-center gap-2 font-extrabold tracking-wide text-slate-900">
          <span className="w-4 h-4 rounded-full bg-teal-800 inline-block" />
          <span>MINIMAL</span>
        </button>

        {/* Center: Menu (ตรงกลางเป๊ะตามภาพ) */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6">
          {CATEGORIES.map((c) => (
            <a
              key={c.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelect(c.id);
                if (c.id !== "home") go("products");
                else go("home");
              }}
              className={`text-[15px] py-2 transition-colors ${
                active === c.id
                  ? "font-semibold text-teal-800"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {c.label}
            </a>
          ))}
        </nav>

        {/* Right: Icons 3 ตัว + ถุงช้อปปิ้ง */}
        <div className="flex items-center gap-4 text-slate-700">
          <button className="p-2 hover:text-slate-900" title="ค้นหา">
            <Icon.Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:text-slate-900" title="บัญชีผู้ใช้">
            <Icon.User className="w-5 h-5" />
          </button>
          <button className="p-2 hover:text-slate-900" title="รายการที่ชอบ">
            <Icon.Heart className="w-5 h-5" />
          </button>
          <button className="relative p-2 hover:text-slate-900" title="ตะกร้า">
            <Icon.Bag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 text-[11px] leading-none px-1.5 py-0.5 rounded-full bg-orange-500 text-white font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[520px] grid place-items-center text-center text-slate-900">
      <div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
        aria-hidden
      />
      <div className="absolute inset-0 bg-white/50" aria-hidden />
      <div className="relative px-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
          แฟชั่นมินิมอล
          <br />
          สำหรับคุณ
        </h1>
        <p className="mt-3 text-lg text-slate-700">
          ค้นพบคอลเลกชันเสื้อผ้าคุณภาพสูง ดีไซน์เรียบง่าย เหมาะสำหรับทุกโอกาส
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-orange-300 border border-orange-300 font-bold text-slate-900">
            เลือกซื้อเลย
          </button>
          <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900">
            ดูคอลเลกชัน
          </button>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ p, onAdd }) {
  return (
    <article className="rounded-2xl overflow-hidden border border-slate-200 bg-[#f0fbfb]">
      <div className="relative">
        {p.isNew && (
          <span className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-teal-700 text-white font-bold">
            ใหม่
          </span>
        )}
        {p.isSale && (
          <span className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-orange-500 text-white font-bold">
            ลดราคา
          </span>
        )}
        <img
          src={p.image}
          alt={p.name}
          className="w-full h-72 object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4 bg-[#e8fbfb]">
        <div className="font-bold">{p.name}</div>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
          <span>⭐ {stars(p.rating)}</span>
          <span>({p.reviews})</span>
        </div>
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
        <button
          onClick={() => onAdd(p)}
          className="mt-3 w-full px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold hover:bg-slate-50"
        >
          เพิ่มลงตะกร้า
        </button>
      </div>
    </article>
  );
}

function SidebarFilters() {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="rounded-2xl border bg-[#e9f9f8] p-5">
        <h3 className="font-bold text-lg">ตัวกรองสินค้า</h3>
        <div className="mt-4 space-y-6">
          <div>
            <p className="font-semibold">หมวดหมู่</p>
            <ul className="mt-2 space-y-2 text-slate-700">
              <li className="flex items-center gap-2"><input type="checkbox" className="accent-teal-700"/> เสื้อผ้าผู้หญิง</li>
              <li className="flex items-center gap-2"><input type="checkbox" className="accent-teal-700"/> เสื้อผ้าผู้ชาย</li>
              <li className="flex items-center gap-2"><input type="checkbox" className="accent-teal-700"/> อุปกรณ์เสริม</li>
            </ul>
          </div>
          <hr className="border-slate-200"/>
          <div>
            <p className="font-semibold">ช่วงราคา</p>
            <ul className="mt-2 space-y-2 text-slate-700">
              {[
                "ต่ำกว่า ฿1,000",
                "฿1,000 - ฿2,000",
                "฿2,000 - ฿3,000",
                "มากกว่า ฿3,000",
              ].map((t,i)=> (
                <li key={i} className="flex items-center gap-2"><input type="checkbox" className="accent-teal-700"/> {t}</li>
              ))}
            </ul>
          </div>
          <hr className="border-slate-200"/>
          <div>
            <p className="font-semibold">สี</p>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {["#ffffff","#111827","#6b7280","#eab308","#93c5fd","#38bdf8","#f1f5f9","#fde68a","#d1fae5","#fecdd3","#a3a3a3","#e2e8f0"].map((c,i)=> (
                <span key={i} className="w-5 h-5 rounded-full border border-slate-300" style={{background:c}} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

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

function ProductsPage({ onAdd }) {
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

function Footer() {
  return (
    <footer className="mt-10 border-top">
      <div className="max-w-6xl mx-auto px-6 py-8 text-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 font-extrabold text-slate-900 mb-2">
              <span className="w-4 h-4 rounded-full bg-teal-800 inline-block" />
              <span>MINIMAL</span>
            </div>
            <p>แฟชั่นมินิมอลคุณภาพสูง เพื่อการแต่งกายที่สมบูรณ์แบบ</p>
          </div>
          <div>
            <b>ลิงก์ด่วน</b>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>เกี่ยวกับเรา</li>
              <li>ติดต่อเรา</li>
              <li>คู่มือขนาด</li>
              <li>วิธีดูแลเสื้อผ้า</li>
            </ul>
          </div>
          <div>
            <b>บริการลูกค้า</b>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>การจัดส่ง</li>
              <li>การคืนสินค้า</li>
              <li>คำถามที่พบบ่อย</li>
              <li>ศูนย์ช่วยเหลือ</li>
            </ul>
          </div>
          <div>
            <b>ติดต่อเรา</b>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>โทร: 02-xxx-xxxx</li>
              <li>อีเมล: info@minimal.co.th</li>
              <li>จันทร์–ศุกร์ 9:00-18:00</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-slate-500">© 2025 MINIMAL. สงวนลิขสิทธิ์</p>
      </div>
    </footer>
  );
}

export default function App() {
  const [activeCat, setActiveCat] = useState("home");
  const [cart, setCart] = useState([]);
  const [route, setRoute] = useState("home"); // "home" | "products"

  const filtered = useMemo(() => {
    if (activeCat === "home") return PRODUCTS;
    if (activeCat === "sale") return PRODUCTS.filter((p) => p.isSale);
    if (activeCat === "acc") return PRODUCTS.filter((p) => p.category === 'acc');
    return PRODUCTS.filter((p) => p.category === activeCat);
  }, [activeCat]);

  return (
    <div className="text-slate-900 bg-white">
      <Nav active={activeCat} onSelect={setActiveCat} cartCount={cart.length} go={setRoute} />

      {route === 'home' && (
        <>
          <Hero />
          <main className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-extrabold mt-8 mb-3">สินค้าแนะนำ</h2>
            {filtered.length === 0 ? (
              <p className="text-slate-500">ยังไม่มีสินค้าในหมวดนี้</p>
            ) : (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} p={p} onAdd={(item) => setCart((c) => [...c, item])} />
                ))}
              </section>
            )}

            <div className="flex justify-center my-7">
              <button onClick={()=>setRoute('products')} className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold">ดูสินค้าทั้งหมด</button>
            </div>
          </main>
        </>
      )}

      {route === 'products' && (
        <ProductsPage onAdd={(item)=> setCart((c)=>[...c,item])} />
      )}

      <Footer />
    </div>
  );
}
