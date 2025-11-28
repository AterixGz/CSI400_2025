import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getToken } from "../utils/api";
import SidebarFilters from "../components/sidebarFilter";
import ProductCard from "../components/ProductCard";

const baht = (n) => `฿${Number(n ?? 0).toLocaleString("th-TH")}`;
const stars = (value = 0) => `${Number(value ?? 0).toFixed(1)}`;

function ProductsHeader({ count, view, setView, sort, setSort }) {
  const Icon = {
    ChevronDown: ({ className = "" }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    ),
    Grid: ({ className = "" }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="8" height="8" />
        <rect x="13" y="3" width="8" height="8" />
        <rect x="3" y="13" width="8" height="8" />
        <rect x="13" y="13" width="8" height="8" />
      </svg>
    ),
    List: ({ className = "" }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
      </svg>
    ),
  };
  // ฟังก์ชันนี้ใช้สำหรับ icon เท่านั้น (ถ้าไม่ได้ใช้ render ให้ลบ return/null ออก)
}

export default function ProductsPage({ onAdd, favorites = [], onFavorite }) {
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const token = getToken();
  const API_BASE = "https://csi400-2025-1.onrender.com/api";
  const [filters, setFilters] = useState({
    categories: [],
    prices: [],
    colors: [],
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams();
        if (sort) params.set("sort", sort);
        if (filters.categories.length > 0)
          params.set("audience", filters.categories.join(","));
        const res = await fetch(`/api/products?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const rows = await res.json();
        if (alive) setItems(Array.isArray(rows) ? rows.map(adaptProduct) : []);
      } catch (e) {
        console.error(e);
        if (alive) setErr("โหลดสินค้าล้มเหลว กรุณาลองใหม่");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [sort, filters, token]);

  // map isFavorite จาก favorites prop ที่มาจาก App.jsx
  const filteredItems = items
    .filter((p) => !p.is_hidden)
    .map((p) => ({ ...p, isFavorite: favorites.some((f) => f.id === p.id) }))
    .filter((p) => {
      const catMatch =
        !filters.categories.length ||
        filters.categories.includes(p.audience.name);
      const priceMatch =
        !filters.prices.length ||
        filters.prices.some((pr) => {
          if (pr === "ต่ำกว่า ฿1,000") return p.price < 1000;
          if (pr === "฿1,000 - ฿2,000")
            return p.price >= 1000 && p.price <= 2000;
          if (pr === "฿2,000 - ฿3,000")
            return p.price > 2000 && p.price <= 3000;
          if (pr === "มากกว่า ฿3,000") return p.price > 3000;
          return false;
        });
      const colorMatch =
        !filters.colors.length ||
        p.colors.some((c) => filters.colors.includes(c));
      return catMatch && priceMatch && colorMatch;
    });

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
          toast.success("เพิ่มสินค้าลงตะกร้าสำเร็จ");
          window.dispatchEvent(new Event("cart:updated"));
          navigate("/cart");
        } else {
          toast.error(data.error || "เพิ่มสินค้าไม่สำเร็จ");
        }
      } catch (e) {
        toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    } else {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
      navigate("/login");
    }
  };


  // ใช้ onFavorite ที่มาจาก App.jsx

  // แปลงข้อมูลจาก backend (row) ให้เป็นโครงสร้างที่ frontend ใช้
  function adaptProduct(row) {
    return {
      id: row.product_id,
      name: row.product_name || row.name,
      description: row.description,
      price: Number(row.price),
      compareAt: row.compare_at ? Number(row.compare_at) : null,
      stock: row.stock,
      image: row.image_url,
      createdAt: row.created_at,
      category: { id: row.category_id, name: row.category_name },
      audience: { id: row.audience_id, name: row.audience_name },
      rating: row.rating || 0,
      reviews: row.reviews || 0,
      colors: row.colors || [],
      is_hidden: Boolean(row.is_hidden),
    };
  }
  return (
    <section className="max-w-6xl mx-auto px-6 py-6">
      <ProductsHeader
        count={filteredItems.length}
        view={view}
        setView={setView}
        sort={sort}
        setSort={setSort}
      />

      <div className="mt-6 flex gap-6">
        <SidebarFilters filters={filters} setFilters={setFilters} />

        <div className="flex-1">
          {loading && <div className="p-6">กำลังโหลดสินค้า…</div>}
          {!loading && err && <div className="p-6 text-red-600">{err}</div>}

          {!loading &&
            !err &&
            (view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredItems.map((p) => (
                  <div
                    key={p.id}
                    className="relative border rounded-2xl overflow-hidden hover:shadow-md bg-white group"
                  >
                    {/* ปุ่มหัวใจ */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onFavorite(p);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full hover:scale-110 transition-all text-xl text-red-500 bg-transparent favorite-btn"
                      aria-label={
                        p.isFavorite
                          ? "ลบออกจากรายการโปรด"
                          : "เพิ่มในรายการโปรด"
                      }
                    >
                      {p.isFavorite ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="#ff4b4bff"
                          stroke="#ff4b4bff"
                          strokeWidth="2.2"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#000"
                          strokeWidth="2.2"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      )}
                    </button>

                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-60 object-cover cursor-pointer"
                      onClick={() => navigate(`/products/${p.id}`)}
                    />
                    <div className="p-4">
                      <div
                        className="font-bold text-lg cursor-pointer hover:underline"
                        onClick={() => navigate(`/products/${p.id}`)}
                      >
                        {p.name}
                      </div>
                      <div className="text-slate-500 mt-1">{baht(p.price)}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${p.id}`);
                        }}
                        className="mt-3 w-full px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 hover:bg-slate-50"
                      >
                        รายละเอียดสินค้า
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-4 border rounded-2xl overflow-hidden group"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-60 h-44 object-cover cursor-pointer"
                      onClick={() => navigate(`/productsDetail/${p.id}`)}
                    />
                    <div className="flex-1 p-4 bg-[#e8fbfb] relative">
                      <div
                        className="font-bold text-lg cursor-pointer hover:underline"
                        onClick={() => navigate(`/productsDetail/${p.id}`)}
                      >
                        {p.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        ⭐ {stars(p.rating)} ({p.reviews})
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <div className="text-2xl font-extrabold">
                          {baht(p.price)}
                        </div>
                        {p.compareAt && (
                          <del className="text-slate-500">
                            {baht(p.compareAt)}
                          </del>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-slate-600 text-sm">สี:</span>
                        {(p.colors || []).map((c, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        className="mt-3 px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 hover:bg-slate-50"
                      >
                        เพิ่มลงตะกร้า
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
