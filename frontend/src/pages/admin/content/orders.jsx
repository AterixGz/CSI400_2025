import Header from "../component/header";

const SHIPPING_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
};

const statusClass = {
  [SHIPPING_STATUS.PENDING]: "bg-slate-100 text-slate-700",
  [SHIPPING_STATUS.PROCESSING]: "bg-blue-100 text-blue-700",
  [SHIPPING_STATUS.SHIPPED]: "bg-indigo-100 text-indigo-700",
  [SHIPPING_STATUS.DELIVERED]: "bg-emerald-100 text-emerald-700",
  [SHIPPING_STATUS.CANCELED]: "bg-red-100 text-red-700",
};

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusClass[value]}`}
    >
      {value}
    </span>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/5"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {Object.values(SHIPPING_STATUS).map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export default function OrdersPage({ orders = [], onUpdateStatus }) {
  return (
    <>
      <Header />
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
            <p className="text-sm text-slate-500">
              Orders management and fulfillment.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search order, name, tracking..."
              className="w-64 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
            <select className="px-3 py-2 text-sm border border-slate-200 rounded-xl">
              <option>All statuses</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Canceled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden m-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Shipping status</th>
                <th className="px-4 py-3 text-left">Tracking</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-slate-50 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">#{o.code}</div>
                    <div className="text-xs text-slate-400">{o.createdAt}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-900">{o.customerName}</div>
                    <div className="text-xs text-slate-400">
                      {o.customerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ฿{o.total.toLocaleString("th-TH")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={o.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge value={o.shippingStatus} />
                      <StatusSelect
                        value={o.shippingStatus}
                        onChange={(status) => onUpdateStatus(o.id, status)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {o.tracking || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    ยังไม่มีคำสั่งซื้อในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
