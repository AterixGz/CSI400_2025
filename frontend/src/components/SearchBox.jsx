// components/SearchBox.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  // ตรวจสอบ API_BASE
  const API_BASE = import.meta.env.VITE_API_BASE || window.__API_BASE__ || "http://localhost:3000";

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/search/products?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        
        if (!res.ok) {
          throw new Error(`Search failed with status ${res.status}`);
        }
        
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          console.error('Unexpected response format:', data);
        }
      } catch (e) {
        if (e.name === "AbortError") return;
        console.error("Search failed:", e);
        setResults([]); // Clear results on error
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  function handleSelect(product) {
    navigate(`/products/${product.product_id}`);
    setShow(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShow(true);
          }}
          onFocus={() => setShow(true)}
          placeholder="ค้นหาสินค้า..."
          className="w-[200px] px-4 py-2 rounded-lg border border-slate-00 focus:outline-none focus:border-teal-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {show && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 max-h-[400px] overflow-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              {loading ? "กำลังค้นหา..." : "ไม่พบสินค้า"}
            </div>
          ) : (
            <div className="py-2">
              {results.map((product) => (
                <button
                  key={product.product_id}
                  onClick={() => handleSelect(product)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3"
                >
                  <img
                    src={product.image_url}
                    alt=""
                    className="w-12 h-12 rounded object-cover flex-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {product.product_name}
                    </div>
                    <div className="text-sm text-slate-500">
                      ฿{Number(product.price).toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}