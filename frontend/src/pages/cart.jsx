import { useState } from "react";
import { PRODUCTS } from "../data/seed-list";

const baht = (n) => `฿${n.toLocaleString("th-TH")}`;

function CartItem({ item, onChangeQty, onRemove }) {
  return (
    <div className="flex items-center gap-4 border rounded-2xl p-4 bg-white">
      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
      <div className="flex-1">
        <div className="font-bold text-lg">{item.name}</div>
        <div className="text-slate-600 text-sm mt-1">ไซส์: {item.size} &nbsp; สี: {item.color}</div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={() => onChangeQty(item.id, Math.max(1, item.qty - 1))} className="w-8 h-8 rounded-md border bg-white">−</button>
          <div className="w-8 text-center">{item.qty}</div>
          <button onClick={() => onChangeQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-md border bg-white">+</button>
        </div>
      </div>
      <div className="text-right">
        <div className="font-extrabold text-lg">{baht(item.price * item.qty)}</div>
        <div className="text-slate-500 text-sm mt-1">{baht(item.price)} ต่อชิ้น</div>
      </div>
      <button onClick={() => onRemove(item.id)} className="text-red-600 ml-3">🗑️</button>
    </div>
  );
}

export default function CartPage({ items: propsItems, onChangeQty: propsChangeQty, onRemove: propsRemove }) {
  // create a small mock cart using PRODUCTS (first 3) when no props provided
  const initial = PRODUCTS.slice(0, 3).map((p, i) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    price: p.price,
    qty: i === 0 ? 2 : 1,
    size: i === 0 ? "M" : i === 1 ? "32" : "L",
    color: i === 0 ? "ขาว" : i === 1 ? "น้ำเงิน" : "ขาว/น้ำเงิน",
  }));

  const [localItems, setLocalItems] = useState(initial);

  const items = propsItems ?? localItems;
  const changeQty = propsChangeQty ?? ((id, qty) => setLocalItems((cur) => cur.map((it) => (it.id === id ? { ...it, qty } : it))));
  const remove = propsRemove ?? ((id) => setLocalItems((cur) => cur.filter((it) => it.id !== id)));

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal >= 1000 || subtotal === 0 ? 0 : 50; // mimic free shipping over ฿1000

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">รถเข็นของคุณ ({items.length} รายการ)</h3>
              <div className="text-slate-600 text-sm">&nbsp;</div>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((it) => (
                <CartItem key={it.id} item={it} onChangeQty={changeQty} onRemove={remove} />
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border bg-white p-6">
          <h3 className="font-bold text-lg">สรุปคำสั่งซื้อ</h3>
          <div className="mt-4 text-sm text-slate-600 flex justify-between">
            <div>ยอดรวมสินค้า</div>
            <div>{baht(subtotal)}</div>
          </div>
          <div className="mt-2 text-sm text-slate-600 flex justify-between items-center">
            <div>ค่าจัดส่ง</div>
            <div className={`font-bold ${shipping===0? 'text-emerald-600':'text-slate-700'}`}>{shipping===0? 'ฟรี' : baht(shipping)}</div>
          </div>

          {shipping === 0 && (
            <div className="mt-2 text-xs text-emerald-600">🎉 ฟรีค่าจัดส่งสำหรับคำสั่งซื้อเกิน ฿1,000</div>
          )}

          <hr className="my-4 border-slate-200" />

          <div className="flex items-center justify-between">
            <div className="text-slate-700 font-semibold">ยอดรวมทั้งหมด</div>
            <div className="text-2xl font-extrabold">{baht(subtotal + shipping)}</div>
          </div>

          <button className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">ดำเนินการชำระเงิน</button>

          <p className="mt-3 text-xs text-slate-500">การจัดส่งฟรีสำหรับคำสั่งซื้อเกิน ฿1,000<br/>รับประกันการคืนเงิน 30 วัน</p>
        </aside>
      </div>
    </section>
  );
}
