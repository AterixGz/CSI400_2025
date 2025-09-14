import { useMemo, useState } from "react";
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

export default function App() {
  const location = useLocation();
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
      <SmallPromoNav />
      <Nav
        active={activeCat}
        onSelect={setActiveCat}
        cartCount={cart.length}
        go={setRoute}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Hero
              filtered={filtered}
              onAdd={addToCart}
              onViewAll={() => setRoute("products")}
              onFavorite={(item) =>
                setFavorites((cur) =>
                  cur.some((f) => f.id === item.id)
                    ? cur.filter((f) => f.id !== item.id)
                    : [...cur, item]
                )
              }
              favorites={favorites}
            />
          }
        />
        <Route path="/products" element={<ProductsPage onAdd={addToCart} />} />
        <Route
          path="/products/:id"
          element={
            <ProductDetailPage
              onAdd={addToCart}
              onFavorite={(item) =>
                setFavorites((cur) =>
                  cur.some((f) => f.id === item.id)
                    ? cur.filter((f) => f.id !== item.id)
                    : [...cur, item]
                )
              }
              favorites={favorites}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
  <Route path="/login" element={<LoginPage />} />
        <Route
          path="/cart"
          element={
            <CartPage
              items={cart}
              onChangeQty={changeQty}
              onRemove={removeFromCart}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            <FavoriteProducts
              favorites={favorites}
              onRemove={(id) =>
                setFavorites((cur) => cur.filter((f) => f.id !== id))
              }
              onFavorite={(item) =>
                setFavorites((cur) =>
                  cur.some((f) => f.id === item.id)
                    ? cur.filter((f) => f.id !== item.id)
                    : [...cur, item]
                )
              }
            />
          }
        />
      </Routes>

          {/* Footer จะหายไปถ้า path เริ่มต้นด้วย /login */}
      {!(location.pathname || "").startsWith("/login") && <Footer />}
    </div>
  );
}
