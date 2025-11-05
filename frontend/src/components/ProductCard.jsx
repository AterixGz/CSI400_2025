import { Link } from "react-router-dom";

const baht = (n) => `฿${n.toLocaleString("th-TH")}`;
const stars = (value = 0) => `${value.toFixed(1)}`;

export default function ProductCard({
  p,
  onAdd,
  onFavorite = () => {},
  isFavorite = false,
}) {
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
        <Link to={`/products/${p.id}`} className="block">
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-72 object-cover"
            loading="lazy"
          />
        </Link>
        <button
          onClick={() => onFavorite(p)}
          aria-label={
            isFavorite ? `เอาออกจากรายการที่ชื่นชอบ` : `เพิ่มลงรายการที่ชื่นชอบ`
          }
          className="absolute top-3 right-3 rounded-full p-2 text-black"
        >
          {isFavorite ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="p-4 bg-[#ffffff]">
        <Link to={`/products/${p.id}`} className="font-bold block">{p.name}</Link>
        {/* <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
          <span>⭐ {stars(p.rating)}</span>
          <span>({p.reviews})</span>
        </div> */}
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-extrabold">{baht(p.price)}</div>
          {p.compareAt && (
            <del className="text-slate-500">{baht(p.compareAt)}</del>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-slate-600 text-sm">สี:</span>
          {p.colors?.map((c, i) => (
            <span
              key={i}
              className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
              style={{ background: c }}
            />
          ))}
        </div>
        <Link
          to={`/products/${p.id}`}
          className="mt-3 w-full px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold hover:bg-slate-50 block text-center"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </article>
  );
}
