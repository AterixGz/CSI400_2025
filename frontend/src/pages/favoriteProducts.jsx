import ProductCard from "../components/ProductCard";

export default function FavoriteProducts({ favorites = [], onRemove = () => {}, onFavorite = () => {} }) {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">รายการที่ชื่นชอบ</h1>

      {favorites.length === 0 ? (
        <div className="text-slate-600">คุณยังไม่มีรายการที่ชื่นชอบ</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard p={p} onAdd={() => {}} isFavorite={true} onFavorite={() => onFavorite(p)} />
              {/* <button
                onClick={() => onRemove(p.id)}
                className="absolute -bottom-2 right-3 bg-white/90 rounded-full p-2 border text-red-600 hover:bg-white"
                aria-label={`ลบ ${p.name}`}
              >
                🗑️
              </button> */}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
