import { useState } from "react";

export default function SidebarFilters({ filters, setFilters }) {
  const categories = ["หญิง", "ชาย", "เด็ก"];
  const prices = ["ต่ำกว่า ฿1,000","฿1,000 - ฿2,000","฿2,000 - ฿3,000","มากกว่า ฿3,000"];

  const toggleCategory = (cat) => {
    setFilters((prev) => {
      const newCats = prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: newCats };
    });
  };

  const togglePrice = (price) => {
    setFilters((prev) => {
      const newPrices = prev.prices.includes(price)
        ? prev.prices.filter((p) => p !== price)
        : [...prev.prices, price];
      return { ...prev, prices: newPrices };
    });
  };

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="rounded-2xl border bg-[#ffffff] p-5">
        <h3 className="font-bold text-lg">ตัวกรองสินค้า</h3>

        {/* หมวดหมู่ */}
        <div className="mt-4">
          <p className="font-semibold">หมวดหมู่</p>
          <ul className="mt-2 space-y-2 text-slate-700">
            {categories.map((cat) => (
              <li key={cat} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-teal-700"
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {cat}
              </li>
            ))}
          </ul>
        </div>

        <hr className="border-slate-200 my-4" />

        {/* ช่วงราคา */}
        <div>
          <p className="font-semibold">ช่วงราคา</p>
          <ul className="mt-2 space-y-2 text-slate-700">
            {prices.map((price) => (
              <li key={price} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-teal-700"
                  checked={filters.prices.includes(price)}
                  onChange={() => togglePrice(price)}
                />
                {price}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
