import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function OrderProfile() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewProductId, setReviewProductId] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

    async function openReviewModal(productId) {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนรีวิวสินค้า");
        // redirect to login
        window.location.href = "/login";
        return;
      }

      setReviewProductId(productId);
      setShowReviewModal(true);
      setReviewLoading(true);
      setReviewError("");
      setExistingReviewId(null);
      setReviewRating(5);
      setReviewComment("");

      try {
        const base = import.meta.env.VITE_API_BASE || "http://localhost:3000";
        const res = await fetch(`${base}/api/reviews/${productId}`);
        if (!res.ok) {
          // Not fatal: keep modal open for new review
          return;
        }
        const data = await res.json().catch(() => ({}));
        const reviews = data.reviews || [];
        // try to get current user id from localStorage
        const raw = localStorage.getItem("user");
        const currentUser = raw ? JSON.parse(raw) : null;
        const myId = currentUser?.user_id;
        if (myId) {
          const myReview = reviews.find((r) => Number(r.user_id) === Number(myId));
          if (myReview) {
            setExistingReviewId(myReview.review_id);
            setReviewRating(Number(myReview.rating) || 5);
            setReviewComment(myReview.comment || "");
          }
        }
      } catch (e) {
        console.warn('failed to load user review', e);
      } finally {
        setReviewLoading(false);
      }
    }
    function closeReviewModal() {
      setShowReviewModal(false);
      setReviewProductId(null);
      setReviewRating(5);
      setReviewComment("");
      setReviewError("");
    }

    async function submitReview() {
      if (!reviewProductId) return;
      if (reviewRating < 1 || reviewRating > 5) {
        setReviewError("กรุณาให้คะแนน 1-5 ดาว");
        return;
      }
      if (!reviewComment.trim()) {
        setReviewError("กรุณาเขียนรีวิว");
        return;
      }
      setReviewSubmitting(true);
      setReviewError("");
      try {
        const token = localStorage.getItem("token");
        const base = import.meta.env.VITE_API_BASE || "http://localhost:3000";
        let res;
        if (existingReviewId) {
          // update existing review
          res = await fetch(`${base}/api/reviews/${existingReviewId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
          });
        } else {
          // create new review
          res = await fetch(`${base}/api/reviews`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ product_id: reviewProductId, rating: reviewRating, comment: reviewComment }),
          });
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.details || err.error || "เกิดข้อผิดพลาด");
        }

        closeReviewModal();
        toast.success(existingReviewId ? "แก้ไขรีวิวเรียบร้อย" : "ส่งรีวิวเรียบร้อย");
        // notify other parts of the app to refresh reviews
        window.dispatchEvent(new Event('reviews:updated'));
      } catch (e) {
        setReviewError(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setReviewSubmitting(false);
      }
    }



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
            status: o.status, // เก็บค่า status แบบดั้งเดิมไว้สำหรับการกรอง
            statusLabel: getStatusInfo(o.status).label, // เพิ่ม statusLabel สำหรับการแสดงผล
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

  const SHIPPING_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    PAID: "paid"
  };

  const statusClass = {
    [SHIPPING_STATUS.PENDING]: "bg-slate-100 text-slate-700",
    [SHIPPING_STATUS.PROCESSING]: "bg-blue-100 text-blue-700",
    [SHIPPING_STATUS.SHIPPED]: "bg-indigo-100 text-indigo-700",
    [SHIPPING_STATUS.DELIVERED]: "bg-emerald-100 text-emerald-700",
    [SHIPPING_STATUS.CANCELLED]: "bg-red-100 text-red-700",
    [SHIPPING_STATUS.PAID]: "bg-green-100 text-green-700"
  };

  function getStatusInfo(status) {
    // Map backend status to Thai labels and colors
    const statusMap = {
      [SHIPPING_STATUS.PENDING]: { label: "รอดำเนินการ", classes: statusClass[SHIPPING_STATUS.PENDING] },
      [SHIPPING_STATUS.PROCESSING]: { label: "กำลังดำเนินการ", classes: statusClass[SHIPPING_STATUS.PROCESSING] },
      [SHIPPING_STATUS.SHIPPED]: { label: "จัดส่งแล้ว", classes: statusClass[SHIPPING_STATUS.SHIPPED] },
      [SHIPPING_STATUS.DELIVERED]: { label: "ส่งถึงแล้ว", classes: statusClass[SHIPPING_STATUS.DELIVERED] },
      [SHIPPING_STATUS.CANCELLED]: { label: "ยกเลิก", classes: statusClass[SHIPPING_STATUS.CANCELLED] },
      [SHIPPING_STATUS.PAID]: { label: "ชำระเงินแล้ว", classes: statusClass[SHIPPING_STATUS.PAID] }
    };

    const statusInfo = statusMap[status] || { label: status || "-", classes: "bg-slate-100 text-slate-700" };
    return {
      label: statusInfo.label,
      bgColor: statusInfo.classes.split(' ')[0],
      textColor: statusInfo.classes.split(' ')[1]
    };
  }


  const statusLabel = {
    [SHIPPING_STATUS.PENDING]: "รอดำเนินการ",
    [SHIPPING_STATUS.PROCESSING]: "กำลังดำเนินการ",
    [SHIPPING_STATUS.SHIPPED]: "จัดส่งแล้ว",
    [SHIPPING_STATUS.DELIVERED]: "ส่งถึงแล้ว",
    [SHIPPING_STATUS.CANCELLED]: "ยกเลิก",
    [SHIPPING_STATUS.PAID]: "ชำระเงินแล้ว"
  };

  // Initialize counts object with all status types
  const counts = orders.reduce(
    (acc, o) => {
      acc.all += 1;
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    { all: 0, ...Object.values(SHIPPING_STATUS).reduce((obj, status) => ({ ...obj, [status]: 0 }), {}) }
  );

  const displayedOrders = orders.filter((o) => {
    const q = (search || "").trim().toLowerCase();
    if (statusFilter !== "all" && o.status !== statusFilter) {
      return false;
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

          <div className="mt-4 space-y-4">
            <div className="w-full md:w-80">
              <label className="sr-only">ค้นหา</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหา Order ID หรือสินค้า..."
                className="w-full border rounded-md px-3 py-2 text-sm placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`rounded-full px-4 py-2 text-sm inline-flex items-center gap-2 border whitespace-nowrap ${statusFilter === "all" ? "bg-slate-900 text-white" : "bg-white"}`}
                aria-pressed={statusFilter === "all"}
              >
                <span className="font-medium">ทั้งหมด</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs min-w-[1.5rem] text-center">{counts.all}</span>
              </button>

              {Object.values(SHIPPING_STATUS).map(value => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-full px-4 py-2 text-sm inline-flex items-center gap-2 border whitespace-nowrap ${
                    statusFilter === value ? "bg-slate-900 text-white" : "bg-white"
                  }`}
                  aria-pressed={statusFilter === value}
                >
                  <span>{statusLabel[value]}</span>
                  <span className={`${statusClass[value]} px-2 py-0.5 rounded-full text-xs min-w-[1.5rem] text-center`}>
                    {counts[value] || 0}
                  </span>
                </button>
              ))}
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
                <div className={`text-xs px-2 py-1 rounded-full ${getStatusInfo(o.status).bgColor} ${getStatusInfo(o.status).textColor}`}>
                  {o.statusLabel}
                </div>
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
                {/* <button className="px-4 py-2 border rounded-md text-sm bg-white">ดูใบเสร็จ</button>
                <button className="px-4 py-2 border rounded-md text-sm bg-white">คืนสินค้า</button> */}
                {o.items.map((it) => (
                  <button
                    key={it.id}
                    className="px-4 py-2 border rounded-md text-sm bg-white"
                    onClick={() => openReviewModal(it.id)}
                  >
                    รีวิวสินค้า
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
          {/* Review Modal */}
          {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
                  onClick={closeReviewModal}
                  disabled={reviewSubmitting}
                  aria-label="ปิด"
                >×</button>
                <h2 className="text-lg font-bold mb-4">รีวิวสินค้า</h2>
                  {reviewLoading ? (
                    <div className="mb-4 text-sm text-slate-500">กำลังโหลดรีวิวของคุณ...</div>
                  ) : (
                    <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">ให้คะแนน</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`text-2xl ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setReviewRating(star)}
                          disabled={reviewSubmitting || reviewLoading}
                        aria-label={`ให้คะแนน ${star} ดาว`}
                      >★</button>
                    ))}
                  </div>
                    </div>
                  )}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">รีวิวสินค้า</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2"
                    rows={4}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    disabled={reviewSubmitting}
                    placeholder="เขียนรีวิวสินค้า..."
                  />
                </div>
                {reviewError && <div className="text-red-600 text-sm mb-2">{reviewError}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 border rounded-md text-sm bg-slate-50"
                    onClick={closeReviewModal}
                    disabled={reviewSubmitting || reviewLoading}
                  >ยกเลิก</button>
                  <button
                    className="px-4 py-2 rounded-md text-sm bg-slate-900 text-white hover:bg-slate-800"
                    onClick={submitReview}
                    disabled={reviewSubmitting || reviewLoading}
                  >{reviewSubmitting ? "กำลังส่ง..." : "ส่งรีวิว"}</button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
