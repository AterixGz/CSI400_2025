// src/pages/ProductDetailPage.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";

// ---------- utils ----------
const baht = (n) => `฿${Number(n ?? 0).toLocaleString("th-TH")}`;
const stars = (value = 0) => `${Number(value ?? 0).toFixed(1)}`;

// ---------- adapter ----------
// แปลง row จาก API → โครงสร้างที่ UI เดิมใช้
function adaptProduct(row) {
  if (!row) return null;
  // เผื่ออนาคตฐานข้อมูลมี images, colors, sizes ในตารางย่อย
  const images = row.images?.length ? row.images : [row.image_url].filter(Boolean);
  const isSale = row.compare_at && Number(row.compare_at) > Number(row.price);
  // isNew: ภายใน 14 วันล่าสุด (ปรับได้)
  const isNew =
    row.created_at
      ? (Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 14
      : false;

  return {
    id: row.product_id,
    name: row.product_name ?? row.name,
    description: row.description ?? "",
    price: Number(row.price ?? 0),
    compareAt: row.compare_at ? Number(row.compare_at) : null,
    stock: row.stock ?? 0,
    image: images?.[0] ?? null,
    images,
    createdAt: row.created_at,
    category: { id: row.category_id, name: row.category_name },
    audience: { id: row.audience_id, name: row.audience_name },

    // ค่าเสริมให้ UI เดิม
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    colors: row.colors ?? [],  // ถ้ามีเก็บเป็น array ใน DB ก็ map มาใส่ตรงนี้
    sizes: row.sizes ?? null,  // ถ้าไม่มี ให้เป็น null
    features: row.features ?? null,

    // badge
    isSale,
    isNew,
  };
}

export default function ProductDetailPage({
  onAdd = () => {},
  onFavorite = () => {},
  favorites = [],
}) {
  const { id } = useParams();              // "id" จาก URL (string)
  const numericId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");
  const [isFav, setIsFav] = useState(false);

  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // เพิ่มฟังก์ชันเพิ่มลงตะกร้าแบบ products.jsx
  async function handleAddToCart() {
    if (!product) return toast.error("ไม่พบข้อมูลสินค้า");
    // ถ้าสินค้ามี size แต่ไม่ได้เลือก
    if (product.sizes && !size) {
      toast.error("กรุณาเลือกไซส์ก่อนเพิ่มลงตะกร้า");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
      navigate("/login");
      return;
    }
    const cartItem = {
      product_id: product.id,
      quantity: qty,
      size: size,
    };
    try {
      // Logged-in: เรียก API
      const res = await api.post("/cart/items", cartItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        window.dispatchEvent(new Event("cart:updated"));
        toast.success("เพิ่มสินค้าลงตะกร้าสำเร็จ");
        navigate("/cart");
      } else {
        toast.error(res.data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      console.error("เพิ่มลงตะกร้าผิดพลาด", e);
      toast.error(e?.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  }

  // ✅ ดึงรายละเอียดสินค้า
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr("");

      try {
        // เรียกแบบ relative path ได้เลย ถ้าตั้ง proxy ใน vite.config.js
        const res = await fetch(`/api/products/${numericId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const row = await res.json();

        const p = adaptProduct(row);
        if (!p) throw new Error("ไม่พบสินค้า");

        if (alive) {
          setProduct(p);
          setMainImage(p.image ?? null);
          setSize(p.sizes?.[0] ?? null);
          setIsFav((favorites || []).some((f) => f.id === p.id));
        }

        // โหลด related ตาม category เดียวกัน (ยกเว้นตัวเอง)
        if (p?.category?.id) {
          const r = await fetch(`/api/products?category_id=${p.category.id}`);
          if (r.ok) {
            const rows = await r.json();
            const rel = (rows || [])
              .map(adaptProduct)
              .filter(Boolean)
              .filter((x) => x.id !== p.id)
              .slice(0, 4);
            if (alive) setRelated(rel);
          }
        }
      } catch (e) {
        console.error(e);
        if (alive) setErr("โหลดรายละเอียดสินค้าล้มเหลว");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (!Number.isFinite(numericId)) {
      setErr("รหัสสินค้าไม่ถูกต้อง");
      setLoading(false);
      return;
    }
    load();

    return () => { alive = false; };
  }, [numericId, favorites]);

  // ---------- loading / error ----------
  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-center text-slate-600">กำลังโหลดสินค้า…</p>
      </section>
    );
  }

  if (err || !product) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-center text-rose-600">{err || "ไม่พบสินค้านี้"}</p>
        <div className="mt-6 text-center">
          <Link to="/products" className="px-4 py-2 rounded-xl border bg-white">กลับไปหน้าสินค้า</Link>
        </div>
      </section>
    );
  }

  // ---------- UI ----------
  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="rounded-xl overflow-hidden bg-slate-100 h-[560px] flex items-center justify-center">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="object-contain max-h-[560px] w-full" />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-400">รูปภาพ</div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {(product.images ?? [product.image]).map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className={`rounded-lg overflow-hidden border ${mainImage === img ? "border-rose-400" : "border-slate-200"} bg-white`}
                aria-label={`เลือกรูปที่ ${i + 1}`}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-24 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-extrabold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-yellow-500 font-semibold">⭐ {stars(product.rating ?? 0)}</div>
            <div className="text-sm text-slate-500">({product.reviews ?? 0} รีวิว)</div>
            {product.isSale && (
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
                ลด {Math.round(((product.compareAt ?? product.price) - product.price) / (product.compareAt ?? product.price) * 100)}%
              </span>
            )}
            {product.isNew && (
              <span className="ml-2 text-xs bg-yellow-400 text-white px-2 py-1 rounded">ใหม่</span>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-3xl font-extrabold text-rose-600">{baht(product.price)}</div>
            {product.compareAt && <del className="text-slate-400">{baht(product.compareAt)}</del>}
          </div>

          <p className="mt-4 text-slate-700">{product.description || "รายละเอียดสินค้าแบบย่อ..."}</p>

          <div className="mt-4">
            <div className="text-sm text-slate-600 mb-2">สี:</div>
            <div className="flex items-center gap-2">
              {(product.colors ?? ["#ffffff"]).map((c, i) => (
                <button
                  key={i}
                  title={c}
                  className="w-7 h-7 rounded-full border border-slate-300"
                  style={{ background: c }}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>

          {product.sizes && (
            <div className="mt-4">
              <div className="text-sm text-slate-600 mb-2">ไซส์</div>
              <div className="flex items-center gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-3 py-2 rounded-lg border ${size === s ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">−</button>
              <div className="px-4 py-2">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2">+</button>
            </div>

            <div className="flex-1 flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                เพิ่มลงตะกร้า
              </button>

              <button
                onClick={() => { /* buy now */ }}
                className="px-4 py-3 rounded-xl bg-amber-500 text-white font-bold"
              >
                ซื้อทันที
              </button>

              <button
                onClick={() => {
                  setIsFav((v) => !v);
                  onFavorite(product);
                }}
                className={`p-3 rounded-lg border ${isFav ? "bg-rose-100 text-rose-600" : "bg-white text-slate-700"}`}
                aria-label="รายการที่ชอบ"
              >
                {isFav ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 bg-white rounded-xl border">
        <div className="flex">
          <button onClick={() => setActiveTab("detail")} className={`flex-1 py-3 text-sm ${activeTab === "detail" ? "font-semibold" : "text-slate-500"}`}>รายละเอียด</button>
          <button onClick={() => setActiveTab("reviews")} className={`flex-1 py-3 text-sm ${activeTab === "reviews" ? "font-semibold" : "text-slate-500"}`}>รีวิว ({product.reviews ?? 0})</button>
          <button onClick={() => setActiveTab("care")} className={`flex-1 py-3 text-sm ${activeTab === "care" ? "font-semibold" : "text-slate-500"}`}>วิธีดูแล</button>
        </div>
        <div className="p-6">
          {activeTab === "detail" && (
            <div className="text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                {(product.features ?? [
                  "ผ้าคอตตอน 100% คุณภาพพรีเมียม",
                  "ผ่านการรับรองมาตรฐาน OEKO-TEX",
                  "ระบายอากาศได้ดี ไม่อับชื้น",
                  "ทนทานต่อการซัก ไม่หด ไม่ซีด",
                ]).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="text-slate-700">
              <p className="mb-3">คะแนนเฉลี่ย: ⭐ {stars(product.rating ?? 0)} ({product.reviews ?? 0} รีวิว)</p>
              <p className="text-slate-500">ตัวอย่างรีวิวจะแสดงที่นี่ (mock)</p>
            </div>
          )}
          {activeTab === "care" && (
            <div className="text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>ซักด้วยน้ำเย็น แยกผ้าสี</li>
                <li>ไม่ควรใช้น้ำยาฟอกขาว</li>
                <li>ตากในที่ร่มเพื่อยืดอายุผ้า</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">สินค้าที่เกี่ยวข้อง</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {related.map((r) => (
            <ProductCard
              key={r.id}
              p={r}
              onAdd={() => onAdd(r)}
              onFavorite={() => onFavorite(r)}
              isFavorite={(favorites || []).some((f) => f.id === r.id)}
            />
          ))}
          {related.length === 0 && (
            <div className="text-slate-500 col-span-full">ไม่มีสินค้าที่เกี่ยวข้อง</div>
          )}
        </div>
      </div>
    </section>
  );
}
