export default function SidebarFilters() {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="rounded-2xl border bg-[#ffffff] p-5">
        <h3 className="font-bold text-lg">ตัวกรองสินค้า</h3>
        <div className="mt-4 space-y-6">
          <div>
            <p className="font-semibold">หมวดหมู่</p>
            <ul className="mt-2 space-y-2 text-slate-700">
              <li className="flex items-center gap-2"><input type="checkbox" className="accent-teal-700"/> เสื้อผ้าผู้หญิง</li>
              <li className="flex items-center gap-2"><input type="checkbox" className="accent-teal-700"/> เสื้อผ้าผู้ชาย</li>
              <li className="flex items-center gap-2"><input type="checkbox" className="accent-teal-700"/> อุปกรณ์เสริม</li>
            </ul>
          </div>
          <hr className="border-slate-200"/>
          <div>
            <p className="font-semibold">ช่วงราคา</p>
            <ul className="mt-2 space-y-2 text-slate-700">
              {[
                "ต่ำกว่า ฿1,000",
                "฿1,000 - ฿2,000",
                "฿2,000 - ฿3,000",
                "มากกว่า ฿3,000",
              ].map((t,i)=> (
                <li key={i} className="flex items-center gap-2"><input type="checkbox" className="accent-teal-700"/> {t}</li>
              ))}
            </ul>
          </div>
          <hr className="border-slate-200"/>
          <div>
            <p className="font-semibold">สี</p>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {["#ffffff","#111827","#6b7280","#eab308","#93c5fd","#38bdf8","#f1f5f9","#fde68a","#d1fae5","#fecdd3","#a3a3a3","#e2e8f0"].map((c,i)=> (
                <span key={i} className="w-5 h-5 rounded-full border border-slate-300" style={{background:c}} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}