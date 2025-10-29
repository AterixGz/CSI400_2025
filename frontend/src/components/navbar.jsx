// frontend/src/components/navbar.jsx
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { getToken } from "../utils/api";
import VYNE from "../assets/VYNE_tranparent_256.png";
const API_BASE = import.meta.env.VITE_API_BASE || window.__API_BASE__ || "http://localhost:3000";

export default function Nav({
  active,
  onSelect = () => { },
  onSearch = () => { },
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const readUser = () => {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      try {
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        setUser(null);
      }
      updateCartCount(); // อัพเดต cartCount ทุกครั้งที่ user เปลี่ยน
    };
    readUser();
    window.addEventListener("user:updated", readUser);
    window.addEventListener("storage", readUser);
    window.addEventListener("authChange", readUser);
    return () => {
      window.removeEventListener("user:updated", readUser);
      window.removeEventListener("storage", readUser);
      window.removeEventListener("authChange", readUser);
    };
    // eslint-disable-next-line
  }, []);

  // sync cart count with cart page
  function updateCartCount() {
    const token = getToken();
    if (!token) {
      // guest: localStorage (หลัง logout)
      try {
        const raw = localStorage.getItem("cart_items");
        const items = raw ? JSON.parse(raw) : [];
        setCartCount(items.reduce((sum, it) => sum + (it.qty || 1), 0));
      } catch {
        setCartCount(0);
      }
      return;
    }
    fetch(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setCartCount(data.items.reduce((sum, it) => sum + (it.qty || 1), 0));
        } else {
          setCartCount(0);
        }
      })
      .catch(() => setCartCount(0));
  }

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart:updated", updateCartCount);
    window.addEventListener("authChange", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart:updated", updateCartCount);
      window.removeEventListener("authChange", updateCartCount);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  const Icon = {
    Search: (props) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8"
        stroke="currentColor"
        {...props}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    ),
    User: (props) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8"
        stroke="currentColor"
        {...props}
      >
        <path d="M4 20a8 8 0 0 1 16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    Heart: (props) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8"
        stroke="currentColor"
        {...props}
      >
        <path d="M12 21s-7-4.4-9-8.6C1.7 9.3 3.3 6 6.6 6c1.9 0 3.1 1 3.9 2 0.8-1 2-2 3.9-2 3.3 0 4.9 3.3 3.6 6.4-2 4.2-9 8.6-9 8.6z" />
      </svg>
    ),
    Bag: (props) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8"
        stroke="currentColor"
        {...props}
      >
        <path d="M6 7h12l-1 13H7L6 7z" />
        <path d="M9 7a3 3 0 1 1 6 0" />
      </svg>
    ),
  };

  return (
    <header className="sticky top-0 z-30 bg-white/100 ">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-wide text-slate-900">
          <img src={VYNE} alt="VYNE" className="w-17 h-14 object-contain" />
        </Link>

        {/* middle nav */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6">
          <Link
            to="/?audience=หญิง"
            aria-current={active === "หญิง" ? "page" : undefined}
            className={`hover:text-slate-900 ${active === "หญิง" ? "font-semibold text-black" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <p>เสื้อผ้าผู้หญิง</p>
          </Link>

          <Link
            to="/?audience=ชาย"
            aria-current={active === "ชาย" ? "page" : undefined}
            className={`hover:text-slate-900 ${active === "ชาย" ? "font-semibold text-black" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <p>เสื้อผ้าผู้ชาย</p>
          </Link>

          <Link
            to="/?audience=เด็ก"
            aria-current={active === "เด็ก" ? "page" : undefined}
            className={`hover:text-slate-900 ${active === "เด็ก" ? "font-semibold text-black" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <p>เสื้อผ้าเด็ก</p>
          </Link>

          <Link
            to="/"
            aria-current={active === "ลดราคา" ? "page" : undefined}
            className={`hover:text-slate-900 ${active === "ลดราคา" ? "font-semibold text-black" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <p>ลดราคา</p>
          </Link>
        </nav>

        <div className="flex items-center gap-4 text-slate-700">
          <div className="relative">
            {!showSearch && (
              <button
                className="p-2 hover:text-slate-900"
                title="ค้นหา"
                onClick={() => setShowSearch(true)}
                aria-label="เปิดค้นหา"
              >
                <Icon.Search className="w-5 h-5" />
              </button>
            )}

            {showSearch && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearch(query);
                  setShowSearch(false);
                }}
                className="flex items-center"
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => setShowSearch(false)}
                  placeholder="ค้นหา"
                  className="w-24 md:w-32 rounded-md border px-3 py-1 text-sm outline-none"
                  aria-label="ค้นหา"
                />
              </form>
            )}
          </div>

          {/* account: ถ้ามี user ใน localStorage ให้ไป /profile, ถ้าไม่มีไป /login */}
          {user ? (
            <Link
              to="/profile"
              className="p-2 hover:text-slate-900"
              title="บัญชีผู้ใช้"
              aria-label="บัญชีผู้ใช้"
            >
              <Icon.User className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="p-2 hover:text-slate-900"
              title="บัญชีผู้ใช้"
              aria-label="บัญชีผู้ใช้"
            >
              <Icon.User className="w-5 h-5" />
            </Link>
          )}

          <Link
            to="/favorites"
            className="p-2 hover:text-slate-900"
            title="รายการที่ชอบ"
          >
            <Icon.Heart className="w-5 h-5" />
          </Link>
          <Link
            to="/cart"
            className="relative p-2 hover:text-slate-900"
            title="ตะกร้า"
          >
            <Icon.Bag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 text-[11px] leading-none px-1.5 py-0.5 rounded-full bg-orange-500 text-white font-bold">
              {cartCount}
            </span>
          </Link>
          <Link
            to="/admin/dashboard"
            className="p-2 hover:text-slate-900 text-sm font-semibold"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
