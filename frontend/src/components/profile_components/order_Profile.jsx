import { useState } from "react";

export default function OrderProfile() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const orders = [
    {
      id: "ORD-2024-001",
      date: "March 15, 2024",
      status: "ส่งถึงแล้ว",
      total: 289.99,
      items: [
        { id: "p1", title: "Organic Cotton T-Shirt", size: "M", color: "White", qty: 2, price: 49.99, img: "/VYNE_tran.png" },
        { id: "p2", title: "Linen Summer Dress", size: "S", color: "Beige", qty: 1, price: 189.99, img: "/VYNE_tran.png" },
      ],
      tracking: { code: "TRK123456789", date: "March 18, 2024" },
    },
    {
      id: "ORD-2024-002",
      date: "April 02, 2024",
      status: "ยังไม่จ่ายเงิน",
      total: 79.98,
      items: [
        { id: "p3", title: "Minimalist Wallet", size: "-", color: "Black", qty: 1, price: 39.99, img: "/VYNE_tran.png" },
        { id: "p4", title: "Socks (3-pack)", size: "L", color: "Grey", qty: 1, price: 39.99, img: "/VYNE_tran.png" },
      ],
    },
    {
      id: "ORD-2024-003",
      date: "May 10, 2024",
      status: "กำลังจัดส่ง",
      total: 129.5,
      items: [
        { id: "p5", title: "Canvas Tote Bag", size: "-", color: "Natural", qty: 1, price: 29.5, img: "/VYNE_tran.png" },
        { id: "p6", title: "Ceramic Mug", size: "-", color: "Blue", qty: 2, price: 50.0, img: "/VYNE_tran.png" },
      ],
      tracking: { code: "TRK987654321", date: "May 12, 2024" },
    },
    {
      id: "ORD-2024-004",
      date: "June 01, 2024",
      status: "กำลังจัดส่ง",
      total: 45.0,
      items: [
        { id: "p7", title: "Silk Scarf", size: "-", color: "Red", qty: 1, price: 45.0, img: "/VYNE_tran.png" },
      ],
    },
    // เพิ่มตัวอย่างคำสั่งซื้อเพิ่มเติมสำหรับทดสอบปุ่ม
    {
      id: "ORD-2024-005",
      date: "July 12, 2024",
      status: "ยังไม่จ่ายเงิน",
      total: 199.99,
      items: [
        { id: "p8", title: "Bluetooth Headphones", size: "-", color: "Black", qty: 1, price: 199.99, img: "/VYNE_tran.png" },
      ],
    },
    {
      id: "ORD-2024-006",
      date: "August 05, 2024",
      status: "ส่งถึงแล้ว",
      total: 59.0,
      items: [
        { id: "p9", title: "Travel Adapter", size: "-", color: "White", qty: 1, price: 29.0, img: "/VYNE_tran.png" },
        { id: "p10", title: "Phone Stand", size: "-", color: "Grey", qty: 1, price: 30.0, img: "/VYNE_tran.png" },
      ],
      tracking: { code: "TRK555666777", date: "August 08, 2024" },
    },
  ];

  const statusLabel = {
    unpaid: "ยังไม่จ่ายเงิน",
    shipping: "กำลังจัดส่ง",
    delivered: "ส่งถึงแล้ว",
  };

  const counts = orders.reduce(
    (acc, o) => {
      acc.all += 1;
      if (o.status === statusLabel.unpaid) acc.unpaid += 1;
      if (o.status === statusLabel.shipping) acc.shipping += 1;
      if (o.status === statusLabel.delivered) acc.delivered += 1;
      return acc;
    },
    { all: 0, unpaid: 0, shipping: 0, delivered: 0 }
  );

  const displayedOrders = orders.filter((o) => {
    const q = (search || "").trim().toLowerCase();
    if (statusFilter !== "all") {
      const label = statusLabel[statusFilter];
      if (o.status !== label) return false;
    }
    if (!q) return true;
    if ((o.id || "").toLowerCase().includes(q)) return true;
    if ((o.items || []).some((it) => (it.title || "").toLowerCase().includes(q))) return true;
    return false;
  });

  return (
    <div className="col-span-12 lg:col-span-9">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">คำสั่งซื้อของคุณ</h1>
          <p className="text-sm text-slate-500 mt-1">ติดตามและจัดการคำสั่งซื้อของคุณ</p>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:gap-4">
            <div className="w-full md:w-80">
              <label className="sr-only">ค้นหา</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหา Order ID หรือสินค้า..."
                className="w-full border rounded-md px-3 py-2 text-sm placeholder:text-slate-400"
              />
            </div>

            <div className="mt-3 md:mt-0 flex gap-3 items-center">
              <button
                onClick={() => setStatusFilter("all")}
                className={`rounded-full px-4 py-2 text-sm flex items-center gap-3 border ${statusFilter === "all" ? "bg-slate-900 text-white" : "bg-white"}`}
                aria-pressed={statusFilter === "all"}
              >
                <span className="font-medium">ทั้งหมด</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">{counts.all}</span>
              </button>

              <button
                onClick={() => setStatusFilter("unpaid")}
                className={`rounded-full px-4 py-2 text-sm flex items-center gap-3 border ${statusFilter === "unpaid" ? "bg-slate-900 text-white" : "bg-white"}`}
                aria-pressed={statusFilter === "unpaid"}
              >
                <span>ยังไม่จ่ายเงิน</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">{counts.unpaid}</span>
              </button>

              <button
                onClick={() => setStatusFilter("shipping")}
                className={`rounded-full px-4 py-2 text-sm flex items-center gap-3 border ${statusFilter === "shipping" ? "bg-slate-900 text-white" : "bg-white"}`}
                aria-pressed={statusFilter === "shipping"}
              >
                <span>กำลังจัดส่ง</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">{counts.shipping}</span>
              </button>

              <button
                onClick={() => setStatusFilter("delivered")}
                className={`rounded-full px-4 py-2 text-sm flex items-center gap-3 border ${statusFilter === "delivered" ? "bg-slate-900 text-white" : "bg-white"}`}
                aria-pressed={statusFilter === "delivered"}
              >
                <span>ส่งถึงแล้ว</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">{counts.delivered}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {displayedOrders.length === 0 && (
          <div className="py-6 text-center text-slate-500">ไม่พบคำสั่งซื้อที่ตรงกับการค้นหา</div>
        )}

        {displayedOrders.map((o) => (
          <div key={o.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">{o.id}</div>
                <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{o.status}</div>
                <div className="text-sm text-slate-500 ml-3">สั่งซื้อเมื่อ {o.date}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">ยอดรวม</div>
                <div className="text-2xl font-extrabold">${o.total.toFixed(2)}</div>
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-4">
                {o.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                      <img src={it.img} alt={it.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{it.title}</div>
                      <div className="text-sm text-slate-600 mt-1">ไซส์: {it.size} &nbsp; สี: {it.color} &nbsp; จำนวน: {it.qty}</div>
                    </div>
                    <div className="text-right font-semibold">${it.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {o.tracking && (
                <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-emerald-700 font-medium">หมายเลขติดตามพัสดุ</div>
                    <div className="ml-auto text-slate-500 text-sm">ส่งถึงเมื่อ {o.tracking.date}</div>
                  </div>
                  <div className="mt-2 text-slate-700 font-mono font-semibold">{o.tracking.code}</div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button className="px-4 py-2 border rounded-md text-sm bg-white">ดูใบเสร็จ</button>
                <button className="px-4 py-2 border rounded-md text-sm bg-white">คืนสินค้า</button>
                <button className="px-4 py-2 border rounded-md text-sm bg-white">รีวิวสินค้า</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}