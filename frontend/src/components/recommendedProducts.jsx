// frontend/src/components/recommendedProducts.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import ProductCard from "./ProductCard";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cartActions";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  window.__API_BASE__ ||
  "/api";

// แปลง row จาก API -> โครงสร้างที่ ProductCard ใช้
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
    colors: row.colors || [],
    compareAt: row.compare_at ?? null,
  };
}

export default function RecommendedProducts({
  // props เดิมยังรองรับ (เผื่อที่อื่นส่งมา)
  filtered = [],
  onAdd = null,
  onViewAll = () => {},
  onFavorite = () => {},
  favorites = [],
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // --- state หลักสำหรับทำเป็น "หน้าแรก" ---
  // audience ที่จะแสดง (ค่าเริ่มต้นให้เป็น "ชาย")
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialAudience =
    urlParams.get("audience") ||
    localStorage.getItem("active_audience") ||
    "ชาย";

  const [audience, setAudience] = useState(initialAudience);
  const [items, setItems] = useState([]);     // สินค้าแนะนำจาก DB
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // utility: อัปเดต URL ให้มี ?audience=... (คงสถานะเวลารีเฟรช)
  const syncUrlAudience = useCallback((aud) => {
    const sp = new URLSearchParams(location.search);
    sp.set("audience", aud);
    // ใช้ replace เพื่อไม่ยัด history stack เยอะ
    navigate({ pathname: "/", search: `?${sp.toString()}` }, { replace: true });
  }, [location.search, navigate]);

  // โหลดสินค้าแนะนำจาก DB ตาม audience
  const fetchRecommended = useCallback(async (audName) => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (audName) params.set("audience", audName);  // ชาย/หญิง/เด็ก (ภาษาไทยตรง DB)
      params.set("sort", "newest");

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      const rows = await res.json();
      const list = Array.isArray(rows) ? rows.map(adaptProduct) : [];

      // แสดงแนะนำแค่ 8 ชิ้นพอ (ปรับได้)
      setItems(list.slice(0, 8));
    } catch (e) {
      console.error(e);
      setErr("โหลดสินค้าแนะนำล้มเหลว");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // เมื่อ audience เปลี่ยน -> sync URL & localStorage และโหลดใหม่
  useEffect(() => {
    try {
      localStorage.setItem("active_audience", audience);
    } catch {}
    syncUrlAudience(audience);
    fetchRecommended(audience);
  }, [audience, fetchRecommended, syncUrlAudience]);

  // ตอบสนองต่อ 3 แหล่งสัญญาณ: URL, CustomEvent, localStorage
  useEffect(() => {
    // 1) URL ?audience=...
    const audFromUrl = urlParams.get("audience");
    if (audFromUrl && audFromUrl !== audience) {
      setAudience(audFromUrl);
    }

    // 2) CustomEvent audience:change
    const onCustomChange = (e) => {
      const next = (e?.detail ?? "").trim();
      if (next && next !== audience) setAudience(next);
    };
    window.addEventListener("audience:change", onCustomChange);

    // 3) storage (รองรับการเปลี่ยนข้ามแท็บ หรือให้ navbar เซ็ต localStorage)
    const onStorage = (e) => {
      if (e.key === "active_audience" && e.newValue && e.newValue !== audience) {
        setAudience(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("audience:change", onCustomChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [audience, urlParams]);

  // เลือกรายการที่จะแสดงจริง: หาก parent ส่ง filtered เข้ามา จะให้สิทธิมากกว่า
   const displayList = (items && items.length > 0) ? items : filtered;

  return (
    <main className="max-w-6xl mx-auto px-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-extrabold mt-8 mb-3">
          สินค้าแนะนำ{audience ? ` • ${audience}` : ""}
        </h2>
        {loading && <span className="text-sm text-slate-500">กำลังโหลด…</span>}
      </div>

      {!loading && err && (
        <div className="text-red-600 mb-3">{err}</div>
      )}

      {!loading && displayList.length === 0 && !err ? (
        <p className="text-slate-500">ยังไม่มีสินค้าในหมวดนี้</p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayList.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              onAdd={(item) => (onAdd ? onAdd(item) : addToCart(item, navigate))}
              onFavorite={(item) => onFavorite(item)}
              isFavorite={favorites.some((f) => f.id === p.id)}
            />
          ))}
        </section>
      )}

      <div className="flex justify-center my-7">
        <Link
          to={`/products?audience=${encodeURIComponent(audience)}`}
          onClick={onViewAll}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold"
        >
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    </main>
  );
}
