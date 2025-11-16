import { useMemo, useState, useEffect } from "react";
import { getToken } from "./utils/api";
import { toast } from "react-hot-toast";
import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/navbar";
import Footer from "./components/footer";
import { CATEGORIES, PRODUCTS } from "./data/seed-list";
import ProductsPage from "./pages/products";
import ProfilePage from "./pages/profile";
import CartPage from "./pages/cart";
import FavoriteProducts from "./pages/favoriteProducts";
import SmallPromoNav from "./components/smallPromoNav";
import Hero from "./pages/mainPage";
import ProductDetailPage from "./pages/productsDetail";
import LoginPage from "./pages/login";
import { setupAuthWatcher } from "./utils/api";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./pages/admin/main";
import PaymentComplete from "./pages/paymentComplete";

export default function App() {
  const location = useLocation();
  // start auth watcher to auto-logout when token expires
  useEffect(() => {
    const stop = setupAuthWatcher({ intervalSec: 30 });
    return () => stop && stop();
  }, []);
  const [activeCat, setActiveCat] = useState("home");
  const [cart, setCart] = useState([]);
  // cart handlers
  const addToCart = (item) =>
    setCart((c) => {
      // if item already in cart, increase qty
      const existing = c.find((x) => x.id === item.id);
      if (existing)
        return c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...item, qty: 1 }];
    });

  const changeQty = (id, qty) =>
    setCart((cur) => cur.map((it) => (it.id === id ? { ...it, qty } : it)));
  const removeFromCart = (id) =>
    setCart((cur) => cur.filter((it) => it.id !== id));
  const [favorites, setFavorites] = useState([]);
  const token = getToken();

  // โหลด favorite จาก backend
  useEffect(() => {
    async function loadFavorites() {
      if (!token) return setFavorites([]);
      try {
        const res = await fetch("/api/favorite", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const rows = await res.json();
        setFavorites(Array.isArray(rows) ? rows.map(row => ({
          id: row.product_id,
          name: row.product_name || row.name,
          image: row.image_url,
          price: row.price,
        })) : []);
      } catch {
        setFavorites([]);
      }
    }
    loadFavorites();
  }, [token]);

  // ฟังก์ชัน favorite sync backend
  async function handleFavorite(item) {
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด");
      return;
    }
    const isFav = favorites.some(f => f.id === item.id);
    try {
      if (isFav) {
        const res = await fetch(`/api/favorite/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setFavorites(cur => cur.filter(f => f.id !== item.id));
        toast.success("นำออกจากรายการโปรดแล้ว");
      } else {
        const res = await fetch(`/api/favorite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: item.id }),
        });
        if (!res.ok) throw new Error();
        setFavorites(cur => [...cur, item]);
        toast.success("เพิ่มในรายการโปรดแล้ว");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }
  const [_route, setRoute] = useState("home"); // "home" | "products"

  const filtered = useMemo(() => {
    if (activeCat === "home") return PRODUCTS;
    if (activeCat === "sale") return PRODUCTS.filter((p) => p.isSale);
    if (activeCat === "acc")
      return PRODUCTS.filter((p) => p.category === "acc");
    return PRODUCTS.filter((p) => p.category === activeCat);
  }, [activeCat]);

  return (
    <div className="text-slate-900 bg-white">
      <Toaster position="top-right" />
      {!(location.pathname || "").startsWith("/admin") && (
        <>
          <SmallPromoNav />
          <Nav
            active={activeCat}
            onSelect={setActiveCat}
            cartCount={cart.length}
            go={setRoute}
          />
        </>
      )}

      <Routes>
        {/* ...existing routes... */}
  <Route path="/" element={<Hero filtered={filtered} onAdd={addToCart} onViewAll={() => setRoute("products")} onFavorite={handleFavorite} favorites={favorites} />} />
    <Route path="/products" element={<ProductsPage onAdd={addToCart} favorites={favorites} onFavorite={handleFavorite} />} />
        <Route path="/products/:id" element={<ProductDetailPage onAdd={addToCart} onFavorite={(item) => setFavorites((cur) => cur.some((f) => f.id === item.id) ? cur.filter((f) => f.id !== item.id) : [...cur, item])} favorites={favorites} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/cart" element={<CartPage items={cart} onChangeQty={changeQty} onRemove={removeFromCart} />} />
        <Route path="/favorites" element={<FavoriteProducts favorites={favorites} onRemove={(id) => setFavorites((cur) => cur.filter((f) => f.id !== id))} onFavorite={(item) => setFavorites((cur) => cur.some((f) => f.id === item.id) ? cur.filter((f) => f.id !== item.id) : [...cur, item])} />} />
        <Route path="/payment/complete" element={<PaymentComplete />} />
      </Routes>

      {/* Footer จะหายไปถ้า path เริ่มต้นด้วย /login */}
      {!(location.pathname || "").startsWith("/login") && !(location.pathname || "").startsWith("/admin") && <Footer />}
    </div>
  );
}
