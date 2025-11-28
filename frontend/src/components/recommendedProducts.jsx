// frontend/src/components/recommendedProducts.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import ProductCard from "./ProductCard";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cartActions";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./recommendedProducts.css";

const API_BASE = "https://csi400-2025.onrender.com/api";

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
  const [menItems, setMenItems] = useState([]);     // สินค้าแนะนำสำหรับผู้ชาย
  const [womenItems, setWomenItems] = useState([]); // สินค้าแนะนำสำหรับผู้หญิง
  const [kidsItems, setKidsItems] = useState([]);   // สินค้าแนะนำสำหรับเด็ก
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // (syncUrlAudience removed — navbar updates URL and this component reacts to location.search)

  // โหลดสินค้าแนะนำจาก DB แยกตามประเภทผู้ใช้
  const fetchRecommended = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      // ดึงข้อมูลสินค้าสำหรับผู้ชาย
      const menParams = new URLSearchParams();
      menParams.set("audience", "ชาย");
      menParams.set("sort", "newest");
      const menRes = await fetch(`${API_BASE}/products?${menParams.toString()}`);
      const menRows = await menRes.json();
      const menList = Array.isArray(menRows) ? menRows.map(adaptProduct) : [];
      setMenItems(menList.slice(0, 8));

      // ดึงข้อมูลสินค้าสำหรับผู้หญิง
      const womenParams = new URLSearchParams();
      womenParams.set("audience", "หญิง");
      womenParams.set("sort", "newest");
      const womenRes = await fetch(`${API_BASE}/products?${womenParams.toString()}`);
      const womenRows = await womenRes.json();
      const womenList = Array.isArray(womenRows) ? womenRows.map(adaptProduct) : [];
      setWomenItems(womenList.slice(0, 8));

      // ดึงข้อมูลสินค้าสำหรับเด็ก
      const kidsParams = new URLSearchParams();
      kidsParams.set("audience", "เด็ก");
      kidsParams.set("sort", "newest");
      const kidsRes = await fetch(`${API_BASE}/products?${kidsParams.toString()}`);
      const kidsRows = await kidsRes.json();
      const kidsList = Array.isArray(kidsRows) ? kidsRows.map(adaptProduct) : [];
      setKidsItems(kidsList.slice(0, 8));

    } catch (e) {
      console.error(e);
      setErr("โหลดสินค้าแนะนำล้มเหลว");
      setMenItems([]);
      setWomenItems([]);
      setKidsItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดสินค้าแนะนำครั้งแรกตอน mount component
  useEffect(() => {
    fetchRecommended();
  }, [fetchRecommended]);

  // ตอบสนองต่อ CustomEvent / localStorage และ refresh event
  useEffect(() => {
    // 0) เมื่อคลิก logo หรือกลับหน้าแรก
    const onRefresh = () => {
      fetchRecommended(audience);
    };

    // 1) CustomEvent audience:change
    const onCustomChange = (e) => {
      const next = (e?.detail ?? "").trim();
      if (next && next !== audience) {
        setAudience(next);
        fetchRecommended(next); // โหลดใหม่ทันที
      }
    };

    // 2) storage (รองรับการเปลี่ยนข้ามแท็บ หรือ navbar เซ็ต localStorage)
    const onStorage = (e) => {
      if (e.key === "active_audience" && e.newValue && e.newValue !== audience) {
        setAudience(e.newValue);
        fetchRecommended(e.newValue); // โหลดใหม่ทันที
      }
    };

    window.addEventListener("refresh:recommended", onRefresh);
    window.addEventListener("audience:change", onCustomChange);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("refresh:recommended", onRefresh);
      window.removeEventListener("audience:change", onCustomChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [audience, fetchRecommended]);


  // ไม่จำเป็นต้องใช้ filtered แล้วเพราะแยกตาม audience แล้ว

  // เมื่อ URL มี ?audience=... ให้เลื่อนลงมาที่ section ที่เกี่ยวข้อง
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const aud = sp.get("audience");
    if (!aud) return;
    let id = null;
    if (aud === "ชาย") id = "recommended-men";
    else if (aud === "หญิง") id = "recommended-women";
    else if (aud === "เด็ก") id = "recommended-kids";
    else id = "recommended-products";

    const el = document.getElementById(id);
    if (el) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top - headerHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [location.search]);

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8">
      
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-extrabold mt-8 mb-3">
          สินค้าแนะนำ
        </h2>
        {loading && <span className="text-sm text-slate-500">กำลังโหลด…</span>}
      </div>

      {!loading && err && (
        <div className="text-red-600 mb-3">{err}</div>
      )}

      {!loading && menItems.length === 0 && womenItems.length === 0 && kidsItems.length === 0 && !err ? (
        <p className="text-slate-500">ยังไม่มีสินค้าแนะนำ</p>
      ) : (
        <>
          {/* Carousel สำหรับผู้ชาย */}
          <div className="mb-8">
            {/* id เพื่อให้ navbar สามารถเลื่อนมาที่กลุ่มนี้ได้ */}
            <div id="recommended-men" />
            <h3 className="text-xl font-bold mb-4">สินค้าแนะนำสำหรับผู้ชาย</h3>
            <Carousel
              additionalTransfrom={0}
              arrows
              autoPlaySpeed={3000}
              centerMode={false}
              className="w-full"
              containerClass="container-padding-bottom w-full"
              draggable
              infinite
              keyBoardControl
              minimumTouchDrag={80}
              pauseOnHover
              responsive={{
                desktop: {
                  breakpoint: { max: 3000, min: 1024 },
                    items: 5,
                  slidesToSlide: 2
                },
                tablet: {
                  breakpoint: { max: 1024, min: 464 },
                  items: 2,
                  slidesToSlide: 1
                },
                mobile: {
                  breakpoint: { max: 464, min: 0 },
                  items: 1,
                  slidesToSlide: 1
                }
              }}
              shouldResetAutoplay
              showDots={false}
              swipeable
            >
              {menItems.map((p) => (
                <div key={p.id} className="px-2">
                  <ProductCard
                    p={p}
                    onAdd={(item) => (onAdd ? onAdd(item) : addToCart(item, navigate))}
                    onFavorite={(item) => onFavorite(item)}
                    isFavorite={favorites.some((f) => f.id === p.id)}
                  />
                </div>
              ))}
            </Carousel>
          </div>

          {/* Carousel สำหรับผู้หญิง */}
          <div className="mb-8">
            {/* id เพื่อให้ navbar สามารถเลื่อนมาที่กลุ่มนี้ได้ */}
            <div id="recommended-women" />
            <h3 className="text-xl font-bold mb-4">สินค้าแนะนำสำหรับผู้หญิง</h3>
            <Carousel
              additionalTransfrom={0}
              arrows
              autoPlaySpeed={3000}
              centerMode={false}
              className="w-full"
              containerClass="container-padding-bottom w-full"
              draggable
              infinite
              keyBoardControl
              minimumTouchDrag={80}
              pauseOnHover
              responsive={{
                desktop: {
                  breakpoint: { max: 3000, min: 1024 },
                    items: 5,
                  slidesToSlide: 2
                },
                tablet: {
                  breakpoint: { max: 1024, min: 464 },
                  items: 2,
                  slidesToSlide: 1
                },
                mobile: {
                  breakpoint: { max: 464, min: 0 },
                  items: 1,
                  slidesToSlide: 1
                }
              }}
              shouldResetAutoplay
              showDots={false}
              swipeable
            >
              {womenItems.map((p) => (
                <div key={p.id} className="px-2">
                  <ProductCard
                    p={p}
                    onAdd={(item) => (onAdd ? onAdd(item) : addToCart(item, navigate))}
                    onFavorite={(item) => onFavorite(item)}
                    isFavorite={favorites.some((f) => f.id === p.id)}
                  />
                </div>
              ))}
            </Carousel>
          </div>

          {/* Carousel สำหรับเด็ก */}
          <div className="mb-8">
            {/* id เพื่อให้ navbar สามารถเลื่อนมาที่กลุ่มนี้ได้ */}
            <div id="recommended-kids" />
            <h3 className="text-xl font-bold mb-4">สินค้าแนะนำสำหรับเด็ก</h3>
            <Carousel
              additionalTransfrom={0}
              arrows
              autoPlaySpeed={3000}
              centerMode={false}
              className="w-full"
              containerClass="container-padding-bottom w-full"
              draggable
              infinite
              keyBoardControl
              minimumTouchDrag={80}
              pauseOnHover
              responsive={{
                desktop: {
                  breakpoint: { max: 3000, min: 1024 },
                    items: 5,
                  slidesToSlide: 2
                },
                tablet: {
                  breakpoint: { max: 1024, min: 464 },
                  items: 2,
                  slidesToSlide: 1
                },
                mobile: {
                  breakpoint: { max: 464, min: 0 },
                  items: 1,
                  slidesToSlide: 1
                }
              }}
              shouldResetAutoplay
              showDots={false}
              swipeable
            >
              {kidsItems.map((p) => (
                <div key={p.id} className="px-2">
                  <ProductCard
                    p={p}
                    onAdd={(item) => (onAdd ? onAdd(item) : addToCart(item, navigate))}
                    onFavorite={(item) => onFavorite(item)}
                    isFavorite={favorites.some((f) => f.id === p.id)}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </>
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
