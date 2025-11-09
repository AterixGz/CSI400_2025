import { useState, useEffect } from "react";

export default function OrderProfile() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/orders/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลคำสั่งซื้อได้");
        const data = await res.json();
        // Map backend fields to frontend format
        setOrders(
          (data.orders || []).map((o) => ({
            id: o.order_id,
            date: o.created_at ? new Date(o.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "",
            status: mapStatus(o.status),
            total: o.total_amount,
            items: (o.items || []).map((it, idx) => ({
              id: it.product_id || idx,
              title: it.name || "สินค้า",
              size: it.size || "-",
              color: it.color || "-",
              qty: it.quantity || 1,
              price: it.price || 0,
              img: it.image || "/VYNE_tran.png",
            })),
            // Tracking info can be added if available in backend
          }))
        );
      } catch (e) {
        setError(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  function mapStatus(status) {
    // Map backend status to Thai labels
    if (status === "pending" || status === "unpaid") return "ยังไม่จ่ายเงิน";
    if (status === "paid") return "ชำระเงินแล้ว";
    if (status === "shipping" || status === "กำลังจัดส่ง") return "กำลังจัดส่ง";
    if (status === "completed" || status === "ส่งถึงแล้ว") return "ส่งถึงแล้ว";
    return status || "-";
  }

  const statusLabel = {
    unpaid: "ยังไม่จ่ายเงิน",
    paid: "ชำระเงินแล้ว",
    shipping: "กำลังจัดส่ง",
    delivered: "ส่งถึงแล้ว",
  };

  const counts = orders.reduce(
    (acc, o) => {
      acc.all += 1;
      if (o.status === statusLabel.unpaid) acc.unpaid += 1;
      if (o.status === statusLabel.paid) acc.paid += 1;
      if (o.status === statusLabel.shipping) acc.shipping += 1;
      if (o.status === statusLabel.delivered) acc.delivered += 1;
      return acc;
    },
    { all: 0, unpaid: 0, paid: 0, shipping: 0, delivered: 0 }
  );

  const displayedOrders = orders.filter((o) => {
    const q = (search || "").trim().toLowerCase();
    if (statusFilter !== "all") {
      const label = statusLabel[statusFilter];
      if (o.status !== label) return false;
    }
    if (!q) return true;
    if ((o.id || "").toString().toLowerCase().includes(q)) return true;
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

              {/* <button
                onClick={() => setStatusFilter("unpaid")}
                className={`rounded-full px-4 py-2 text-sm flex items-center gap-3 border ${statusFilter === "unpaid" ? "bg-slate-900 text-white" : "bg-white"}`}
                aria-pressed={statusFilter === "unpaid"}
              >
                <span>ยังไม่จ่ายเงิน</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">{counts.unpaid}</span>
              </button> */}
              <button
                onClick={() => setStatusFilter("paid")}
                className={`rounded-full px-4 py-2 text-sm flex items-center gap-3 border ${statusFilter === "paid" ? "bg-slate-900 text-white" : "bg-white"}`}
                aria-pressed={statusFilter === "paid"}
              >
                <span>ชำระเงินแล้ว</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">{counts.paid}</span>
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
        {loading && <div className="py-6 text-center text-slate-500">กำลังโหลดข้อมูล...</div>}
        {error && <div className="py-6 text-center text-red-500">{error}</div>}
        {!loading && !error && displayedOrders.length === 0 && (
          <div className="py-6 text-center text-slate-500">ไม่พบคำสั่งซื้อที่ตรงกับการค้นหา</div>
        )}
        {!loading && !error && displayedOrders.map((o) => (
          <div key={o.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">{o.id}</div>
                <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{o.status}</div>
                <div className="text-sm text-slate-500 ml-3">สั่งซื้อเมื่อ {o.date}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">ยอดรวม</div>
                <div className="text-2xl font-extrabold">฿{Number(o.total || 0).toFixed(2)}</div>
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
                      {/* ตัดสีก่อน */}
                      <div className="text-sm text-slate-600 mt-1">ไซส์: {it.size} &nbsp; จำนวน: {it.qty}</div>
                    </div>
                    <div className="text-right font-semibold">฿{Number(it.price || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Tracking info can be added here if backend provides it */}

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