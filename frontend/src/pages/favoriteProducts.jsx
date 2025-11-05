import ProductCard from "../components/ProductCard";
import { useEffect, useState } from "react";
import { getToken } from "../utils/api";
import { toast } from "react-hot-toast";

export default function FavoriteProducts() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  // โหลด favorite จาก API
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/favorite", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("โหลดรายการโปรดล้มเหลว");
        const rows = await res.json();
        setFavorites((rows || []).map(row => ({
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
          compareAt: null,
        })));
      } catch (e) {
        toast.error(e.message || "โหลดรายการโปรดล้มเหลว");
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  // เพิ่ม/ลบ favorite
  const handleFavorite = async (p) => {
    if (!token) return toast.error("กรุณาเข้าสู่ระบบก่อน");
    const isFav = favorites.some(f => f.id === p.id);
    try {
      if (isFav) {
        // Remove
        const res = await fetch(`/api/favorite/${p.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("ลบรายการโปรดไม่สำเร็จ");
        setFavorites(favorites.filter(f => f.id !== p.id));
        toast.success("ลบออกจากรายการโปรดแล้ว");
      } else {
        // Add
        const res = await fetch(`/api/favorite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: p.id }),
        });
        if (!res.ok) throw new Error("เพิ่มรายการโปรดไม่สำเร็จ");
        setFavorites([...favorites, p]);
        toast.success("เพิ่มในรายการโปรดแล้ว");
      }
    } catch (e) {
      toast.error(e.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">รายการที่ชื่นชอบ</h1>

      {loading ? (
        <div className="text-slate-600">กำลังโหลด...</div>
      ) : favorites.length === 0 ? (
        <div className="text-slate-600">คุณยังไม่มีรายการที่ชื่นชอบ</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard p={p} onAdd={() => {}} isFavorite={true} onFavorite={() => handleFavorite(p)} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
