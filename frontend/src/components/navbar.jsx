import { Link } from "react-router-dom";

export default function Nav({ categories = [], active, onSelect, cartCount, go }) {
  const CATS = categories.length ? categories : [
    { id: "home", label: "หน้าแรก" },
    { id: "women", label: "เสื้อผ้าผู้หญิง" },
    { id: "men", label: "เสื้อผ้าผู้ชาย" },
    { id: "acc", label: "อุปกรณ์เสริม" },
    { id: "sale", label: "ลดราคา" },
  ];

  const Icon = {
    Search: (props) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    ),
    User: (props) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
        <path d="M4 20a8 8 0 0 1 16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    Heart: (props) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
        <path d="M12 21s-7-4.4-9-8.6C1.7 9.3 3.3 6 6.6 6c1.9 0 3.1 1 3.9 2 0.8-1 2-2 3.9-2 3.3 0 4.9 3.3 3.6 6.4-2 4.2-9 8.6-9 8.6z" />
      </svg>
    ),
    Bag: (props) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
        <path d="M6 7h12l-1 13H7L6 7z" />
        <path d="M9 7a3 3 0 1 1 6 0" />
      </svg>
    ),
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative">
        <button onClick={() => go("home")} className="flex items-center gap-2 font-extrabold tracking-wide text-slate-900">
          <span className="w-4 h-4 rounded-full bg-teal-800 inline-block" />
          <span>MINIMAL</span>
        </button>

        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6">
          {CATS.map((c) => (
            <a
              key={c.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelect(c.id);
                if (c.id !== "home") go("products");
                else go("home");
              }}
              className={`text-[15px] py-2 transition-colors ${
                active === c.id
                  ? "font-semibold text-teal-800"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {c.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-slate-700">
          <button className="p-2 hover:text-slate-900" title="ค้นหา">
            <Icon.Search className="w-5 h-5" />
          </button>

          {/* changed: use Link for client-side routing to /profile */}
          <Link to="/profile" className="p-2 hover:text-slate-900" title="บัญชีผู้ใช้" aria-label="บัญชีผู้ใช้">
            <Icon.User className="w-5 h-5" />
          </Link>

          <button className="p-2 hover:text-slate-900" title="รายการที่ชอบ">
            <Icon.Heart className="w-5 h-5" />
          </button>
          <button className="relative p-2 hover:text-slate-900" title="ตะกร้า">
            <Icon.Bag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 text-[11px] leading-none px-1.5 py-0.5 rounded-full bg-orange-500 text-white font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}