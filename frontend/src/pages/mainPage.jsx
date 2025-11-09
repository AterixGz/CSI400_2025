import RecommendedProducts from "../components/RecommendedProducts";

import { useState, useEffect, useRef } from "react";

export default function Hero({ filtered = [], onAdd = () => {}, onViewAll = () => {}, onFavorite = () => {}, favorites = [] }) {
  // slides for carousel (you can replace images/text as needed)
  const slides = [
    {
      id: 1,
      title: "แฟชั่นมินิมอลสำหรับคุณ",
      subtitle: "คอลเลกชันใหม่ล่าสุด",
      image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "คอลเลกชันฤดูร้อน",
      subtitle: "สดชื่นและสบาย",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600&auto=format&fit=crop"
    }
    // {
    //   id: 3,
    //   title: "ชุดลำลองประจำวัน",
    //   subtitle: "เรียบง่ายแต่มีสไตล์",
    //   image: "https://image.made-in-china.com/203f0j00CLQqAdoRfbkI/blog.jpg"
    // }
  ];

  const [index, setIndex] = useState(0);
  const autoplayRef = useRef(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    // autoplay
    autoplayRef.current = setInterval(() => {
      if (!pauseRef.current) setIndex((i) => (i + 1) % slides.length);
    }, 5000); // 5000 milliseconds = 5 seconds
    return () => clearInterval(autoplayRef.current);
  }, [slides.length]);

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <>
      {/* Carousel section - keeps same sizing as original (min-h-[720px]) */}
      <section
        className="relative min-h-[720px] grid place-items-center text-center text-slate-900 overflow-hidden"
        onMouseEnter={() => (pauseRef.current = true)}
        onMouseLeave={() => (pauseRef.current = false)}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 bg-cover bg-center transform transition-transform duration-500 ${i === index ? "translate-x-0" : i < index ? "-translate-x-full" : "translate-x-full"}`}
            style={{ backgroundImage: `url('${s.image}')` }}
            aria-hidden={i !== index}
          />
        ))}

        <div className="absolute inset-0 bg-white/15" aria-hidden />

        <div className="z-20 px-6 max-w-3xl">
          <h1 className="text-slate-200 text-4xl sm:text-6xl font-extrabold leading-tight">
            {slides[index].title}
          </h1>
          <p className="mt-3 text-lg text-slate-700">{slides[index].subtitle}</p>
          {/* side arrows (left/right) placed beside the carousel, not centered */}
          {/* left arrow */}
          <button
            onClick={goPrev}
            aria-label="ก่อนหน้า"
            className="absolute z-30 left-0 top-1/2 -translate-y-1/2 w-60 h-full bg-white/0 text-slate-900 flex items-center justify-center hover:bg-white/20"
          >
            
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M7.707 3.707a1 1 0 010 1.414L4.414 9H15a1 1 0 110 2H4.414l3.293 3.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* right arrow */}
          <button
            onClick={goNext}
            aria-label="ถัดไป"
            className="absolute z-30 right-0 top-1/2 -translate-y-1/2 w-60 h-full bg-white/0 text-slate-900 flex items-center justify-center hover:bg-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M12.293 16.293a1 1 0 010-1.414L15.586 11H5a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Custom navigation dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-0 opacity-70">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`ไปที่สไลด์ ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`rounded-full w-9 h-1.5 ${i === index ? 'bg-slate-900' : 'bg-white/70'}`}
            />
          ))}
        </div>
      </section>

      <div id="recommended-products">
        <RecommendedProducts filtered={filtered} onAdd={onAdd} onViewAll={onViewAll} onFavorite={onFavorite} favorites={favorites} />
      </div>
    </>
  );
}