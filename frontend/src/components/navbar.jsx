// frontend/src/components/navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getToken } from "../utils/api";
import VYNE from "../assets/VYNE_tranparent_256.png";
import SearchBox from "./SearchBox";
const API_BASE = import.meta.env.VITE_API_BASE || window.__API_BASE__ || "http://localhost:3000";

export default function Nav({
  active,
}) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const readUser = () => {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      try {
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
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
  }, []);

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

  const navigate = useNavigate();
  const location = useLocation();

  function handleLogoClick(e) {
    // prevent default Link behavior and use navigate so we can smooth-scroll to top
    e.preventDefault();
    // navigate to home
    navigate('/');
    // smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // notify recommended products to refresh
    window.dispatchEvent(new Event('refresh:recommended'));
  }

  function handleCategoryClick(e, audience) {
    // Always prevent default Link navigation; we'll handle it.
    e.preventDefault();
    // If we're on the home page, smooth scroll to the recommended products section
    if ((location.pathname || '/') === '/') {
      // เลือก id ของ section ที่ตรงกับ audience
      let targetId = 'recommended-products';
      if (audience === 'ชาย') targetId = 'recommended-men';
      else if (audience === 'หญิง') targetId = 'recommended-women';
      else if (audience === 'เด็ก') targetId = 'recommended-kids';

      const el = document.getElementById(targetId) || document.getElementById('recommended-products');
      if (el) {
        // compute offset to account for sticky header
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const rect = el.getBoundingClientRect();
        const top = window.scrollY + rect.top - headerHeight - 12; // small offset
        window.scrollTo({ top, behavior: 'smooth' });
      }
      // Update the URL query param so components can react as well
      try {
        navigate(`/?audience=${encodeURIComponent(audience)}`, { replace: true });
      } catch (err) {
        console.warn('Failed to update URL via navigate:', err);
      }
      return;
    }

    // Otherwise navigate to home with the audience query
    navigate(`/?audience=${encodeURIComponent(audience)}`);
  }

  return (
    <header className="sticky top-0 z-30 bg-white/100 ">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative">
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold tracking-wide text-slate-900"
          onClick={handleLogoClick}
        >
          <img src={VYNE} alt="VYNE" className="w-17 h-14 object-contain" />
        </Link>

        {/* middle nav */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 z-1000">
        <Link
            to="/?audience=ชาย"
            onClick={(e) => handleCategoryClick(e, 'ชาย')}
            aria-current={active === "ชาย" ? "page" : undefined}
            className={`hover:text-slate-900 ${active === "ชาย" ? "font-semibold text-black" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <p>เสื้อผ้าผู้ชาย</p>
          </Link>
          
          <Link
            to="/?audience=หญิง"
            onClick={(e) => handleCategoryClick(e, 'หญิง')}
            aria-current={active === "หญิง" ? "page" : undefined}
            className={`hover:text-slate-900 ${active === "หญิง" ? "font-semibold text-black" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <p>เสื้อผ้าผู้หญิง</p>
          </Link>

          

          <Link
            to="/?audience=เด็ก"
            onClick={(e) => handleCategoryClick(e, 'เด็ก')}
            aria-current={active === "เด็ก" ? "page" : undefined}
            className={`hover:text-slate-900 ${active === "เด็ก" ? "font-semibold text-black" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <p>เสื้อผ้าเด็ก</p>
          </Link>

          <Link
            to="/"
            onClick={(e) => handleCategoryClick(e, 'ลดราคา')}
            aria-current={active === "ลดราคา" ? "page" : undefined}
            className={`hover:text-slate-900 ${active === "ลดราคา" ? "font-semibold text-black" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <p>ลดราคา</p>
          </Link>
        </nav>

        <div className="flex items-center gap-4 text-slate-700">
          <div className="relative">
            <SearchBox />
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
          {/* ปุ่ม Admin */}
{/* ปุ่ม Admin / Manager / Staff */}
{user && ["manager", "staff"].includes(user.role_name) && (
  <button
    className="p-2 hover:text-slate-900 text-sm font-semibold"
    onClick={() => {
      if (user.role_name === "manager") {
        navigate("/admin/dashboard"); // Manager → Dashboard
      } else if (user.role_name === "staff") {
        navigate("/admin/orders"); // Staff → Orders
      }
    }}
  >
    {user.role_name === "manager" ? "Dashboard" : "Orders"}
  </button>
)}


        </div>
      </div>
    </header>
  );
}
