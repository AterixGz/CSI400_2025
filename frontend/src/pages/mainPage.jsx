import RecommendedProducts from "../components/RecommendedProducts";

export default function Hero({ filtered = [], onAdd = () => {}, onViewAll = () => {}, onFavorite = () => {}, favorites = [] }) {
  return (
    <>
    <section className="relative min-h-[720px] grid place-items-center text-center text-slate-900">
      <div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
        aria-hidden
      />
      <div className="absolute inset-0 bg-white/15" aria-hidden />
      <div className="relative px-6">
        {/* <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
          แฟชั่นมินิมอล
          <br />
          สำหรับคุณ
        </h1>
        <p className="mt-3 text-lg text-slate-700">
          ค้นพบคอลเลกชันเสื้อผ้าคุณภาพสูง ดีไซน์เรียบง่าย เหมาะสำหรับทุกโอกาส
        </p> */}
      </div>
    </section>
  <RecommendedProducts filtered={filtered} onAdd={onAdd} onViewAll={onViewAll} onFavorite={onFavorite} favorites={favorites} />
    </>
  );
}