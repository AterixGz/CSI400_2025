const baht = (n) => `฿${n.toLocaleString("th-TH")}`;
const stars = (value = 0) => `${value.toFixed(1)}`;

export default function ProductCard({ p, onAdd, onFavorite = () => {}, isFavorite = false }) {
  return (
    <article className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <div className="relative">
        {p.isNew && (
          <span className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-yellow-400 text-white font-bold">
            ใหม่
          </span>
        )}
        {p.isSale && (
          <span className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-orange-500 text-white font-bold">
            ลดราคา
          </span>
        )}
        <img
          src={p.image}
          alt={p.name}
          className="w-full h-72 object-cover"
          loading="lazy"
        />
        <button
          onClick={() => onFavorite(p)}
          aria-label={isFavorite ? `เอาออกจากรายการที่ชื่นชอบ` : `เพิ่มลงรายการที่ชื่นชอบ`}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2 border text-red-600 hover:bg-white"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="p-4 bg-[#ffffff]">
        <div className="font-bold">{p.name}</div>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
          <span>⭐ {stars(p.rating)}</span>
          <span>({p.reviews})</span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-extrabold">{baht(p.price)}</div>
          {p.compareAt && <del className="text-slate-500">{baht(p.compareAt)}</del>}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-slate-600 text-sm">สี:</span>
          {p.colors?.map((c, i) => (
            <span key={i} className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" style={{ background: c }} />
          ))}
        </div>
        <button
          onClick={() => onAdd(p)}
          className="mt-3 w-full px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold hover:bg-slate-50"
        >
          เพิ่มลงตะกร้า
        </button>
      </div>
    </article>
  );
}