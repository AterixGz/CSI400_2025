import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

export default function RecommendedProducts({ filtered = [], onAdd = () => {}, onViewAll = () => {}, onFavorite = () => {}, favorites = [] }) {
  return (
    <main className="max-w-6xl mx-auto px-8">
      <h2 className="text-2xl font-extrabold mt-8 mb-3">สินค้าแนะนำ</h2>
      {filtered.length === 0 ? (
        <p className="text-slate-500">ยังไม่มีสินค้าในหมวดนี้</p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              onAdd={(item) => onAdd(item)}
              onFavorite={(item) => onFavorite(item)}
              isFavorite={favorites.some((f) => f.id === p.id)}
            />
          ))}
        </section>
      )}

      <div className="flex justify-center my-7">
        <Link to="/products" onClick={onViewAll} className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold">
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    </main>
  );
}
