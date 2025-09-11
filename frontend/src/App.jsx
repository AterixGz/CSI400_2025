import { useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/navbar";
import Footer from "./components/footer";
import { CATEGORIES, PRODUCTS } from "./data/seed-list";
import SidebarFilters from "./components/sidebarFilter";
import ProductsPage from "./pages/products";
import ProductCard from "./components/ProductCard";
import ProfilePage from "./pages/profile";
import RecommendedProducts from "./components/recommendedProducts";
import CartPage from "./pages/cart";
// -------------------- UI --------------------

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

export default function App() {
  const [activeCat, setActiveCat] = useState("home");
  const [cart, setCart] = useState([]);
  const [_route, setRoute] = useState("home"); // "home" | "products"

  const filtered = useMemo(() => {
    if (activeCat === "home") return PRODUCTS;
    if (activeCat === "sale") return PRODUCTS.filter((p) => p.isSale);
    if (activeCat === "acc") return PRODUCTS.filter((p) => p.category === 'acc');
    return PRODUCTS.filter((p) => p.category === activeCat);
  }, [activeCat]);

  return (
    <div className="text-slate-900 bg-white">
  <Nav active={activeCat} onSelect={setActiveCat} cartCount={cart.length} go={setRoute} />

      <Routes>
        <Route
          path="/"
          element={
                <>
                  <Hero />
                    <RecommendedProducts
                      filtered={filtered}
                      onAdd={(item) => setCart((c) => [...c, item])}
                      onViewAll={() => setRoute("products")}
                    />
                </>
          }
        />
        <Route path="/products" element={<ProductsPage onAdd={(item)=> setCart((c)=>[...c,item])} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>

      <Footer />
    </div>
  );
}
