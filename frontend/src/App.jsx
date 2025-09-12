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
import FavoriteProducts from "./pages/favoriteProducts";
import SmallPromoNav from "./components/smallPromoNav";
import Hero from "./pages/mainPage";

export default function App() {
  const [activeCat, setActiveCat] = useState("home");
  const [cart, setCart] = useState([]);
  console.log("cart:", cart);
  // cart handlers
  const addToCart = (item) => setCart((c) => {
    // if item already in cart, increase qty
    const existing = c.find((x) => x.id === item.id);
    if (existing) return c.map((x) => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
    return [...c, { ...item, qty: 1 }];
  });

  const changeQty = (id, qty) => setCart((cur) => cur.map((it) => (it.id === id ? { ...it, qty } : it)));
  const removeFromCart = (id) => setCart((cur) => cur.filter((it) => it.id !== id));
  const [favorites, setFavorites] = useState([]);
  const [_route, setRoute] = useState("home"); // "home" | "products"

  const filtered = useMemo(() => {
    if (activeCat === "home") return PRODUCTS;
    if (activeCat === "sale") return PRODUCTS.filter((p) => p.isSale);
    if (activeCat === "acc") return PRODUCTS.filter((p) => p.category === 'acc');
    return PRODUCTS.filter((p) => p.category === activeCat);
  }, [activeCat]);

  return (
    <div className="text-slate-900 bg-white">
      <SmallPromoNav />
      <Nav active={activeCat} onSelect={setActiveCat} cartCount={cart.length} go={setRoute} />

      <Routes>
        <Route
          path="/"
          element={<Hero
            filtered={filtered}
            onAdd={addToCart}
            onViewAll={() => setRoute("products")}
            onFavorite={(item) => setFavorites((cur) => (cur.some((f) => f.id === item.id) ? cur.filter((f) => f.id !== item.id) : [...cur, item]))}
            favorites={favorites}
          />}
        />
        <Route path="/products" element={<ProductsPage onAdd={addToCart} />} />
        <Route path="/profile" element={<ProfilePage />} />
  <Route path="/cart" element={<CartPage items={cart} onChangeQty={changeQty} onRemove={removeFromCart} />} />
        <Route path="/favorites" element={<FavoriteProducts favorites={favorites} onRemove={(id) => setFavorites((cur) => cur.filter((f) => f.id !== id))} onFavorite={(item) => setFavorites((cur) => (cur.some((f) => f.id === item.id) ? cur.filter((f) => f.id !== item.id) : [...cur, item]))} />} />
      </Routes>

      <Footer />
    </div>
  );
}
