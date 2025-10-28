// ...existing code...
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/api";
import SidebarFilters from "../components/sidebarFilter";
import ProductCard from "../components/ProductCard";


const baht = (n) => `฿${Number(n ?? 0).toLocaleString("th-TH")}`;
const stars = (value = 0) => `${Number(value ?? 0).toFixed(1)}`;

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

function ProductsHeader({ count, view, setView, sort, setSort }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-extrabold">สินค้าทั้งหมด</h2>
        <p className="text-slate-600 text-sm mt-1">พบ {count} รายการ</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={sort}
            onChange={(e)=>setSort(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm"
          >
            <option value="newest">สินค้าใหม่ล่าสุด</option>
            <option value="price_asc">ราคาต่ำไปสูง</option>
            <option value="price_desc">ราคาสูงไปต่ำ</option>
            {/* <option value="rating">เรตติ้งสูงสุด</option>  // ใช้ได้ถ้ามีคอลัมน์ rating */}
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

// ✅ แปลง row จาก API → รูปแบบที่ UI เดิมใช้อยู่
function adaptProduct(row) {
  return {
    id: row.product_id,
    name: row.product_name,
    description: row.description,
    price: Number(row.price),
    stock: row.stock,
    image: row.image_url,
    createdAt: row.created_at,
    category: { id: row.category_id, name: row.category_name },
    audience: { id: row.audience_id, name: row.audience_name },
    rating: 0,
    reviews: 0,
    colors: [],
    compareAt: null,
  };
}

export default function ProductsPage() {
  // ✅ hooks ทั้งหมดต้องอยู่ "ใน" component
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const token = getToken();
  const API_BASE = import.meta.env.VITE_API_BASE || window.__API_BASE__ || "http://localhost:3000";

  // ✅ useEffect เวอร์ชันเดียวพอ และเรียก /api ตรง ๆ
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams();
        if (sort) params.set("sort", sort);

        // ✅ เรียกแบบนี้ได้เลย เพราะเราตั้ง proxy ไว้ใน vite.config.js
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const rows = await res.json();
        const data = Array.isArray(rows) ? rows.map(adaptProduct) : [];
        if (alive) setItems(data);
      } catch (e) {
        console.error(e);
        if (alive) setErr("โหลดสินค้าล้มเหลว กรุณาลองใหม่");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [sort]);

  // เพิ่มสินค้าเข้าตะกร้าและไปหน้า cart
  const handleAddToCart = async (product) => {
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/cart/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: product.id, quantity: 1 }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          navigate("/cart");
        } else {
          alert(data.error || "เพิ่มสินค้าไม่สำเร็จ");
        }
      } catch (e) {
        alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    } else {
      // guest: localStorage
      const LS_KEY = "cart_items";
      let cart = [];
      try {
        const raw = localStorage.getItem(LS_KEY);
        cart = raw ? JSON.parse(raw) : [];
      } catch { cart = []; }
      const found = cart.find((it) => it.id === product.id);
      if (found) {
        cart = cart.map((it) => (it.id === product.id ? { ...it, qty: it.qty + 1 } : it));
      } else {
        cart = [...cart, { ...product, qty: 1 }];
      }
      localStorage.setItem(LS_KEY, JSON.stringify(cart));
      navigate("/cart");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-6">
      <ProductsHeader count={items.length} view={view} setView={setView} sort={sort} setSort={setSort} />

      <div className="mt-6 flex gap-6">
        <SidebarFilters />

        <div className="flex-1">
          {loading && <div className="p-6">กำลังโหลดสินค้า…</div>}
          {!loading && err && <div className="p-6 text-red-600">{err}</div>}

          {!loading && !err && (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {items.map((p) => (
                  <ProductCard key={p.id} p={p} onAdd={handleAddToCart} />
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
                        {(p.colors || []).map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" style={{ background: c }} />
                        ))}
                      </div>
                      <button onClick={()=>handleAddToCart(p)} className="mt-3 px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold hover:bg-slate-50">เพิ่มลงตะกร้า</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
