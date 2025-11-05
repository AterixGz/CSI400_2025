import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function formatCurrency(amount) {
  try {
    return amount.toLocaleString('th-TH');
  } catch {
    return String(amount);
  }
}

export default function PaymentComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Try to get order details from navigation state first, then sessionStorage as a fallback
  const order = state?.orderDetails || (() => {
    try {
      const raw = sessionStorage.getItem('last_order');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">การชำระเงิน</h2>
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-slate-700">ไม่พบข้อมูลคำสั่งซื้อล่าสุด</p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-emerald-600 text-white rounded">ไปยังหน้าหลัก</button>
            <button onClick={() => navigate('/profile')} className="px-4 py-2 border rounded">บัญชีของฉัน</button>
          </div>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const itemsTotal = items.reduce((s, it) => s + ((it.price || 0) * (it.qty || 1)), 0);
  const shippingFee = order.shipping?.fee ?? 0;
  const grandTotal = (order.amount ?? itemsTotal) + shippingFee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold">ขอบคุณสำหรับการสั่งซื้อ 🎉</h1>
        <p className="text-slate-600 mt-2">คำสั่งซื้อของคุณได้รับการชำระเงินเรียบร้อยแล้ว</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 p-4 border rounded-lg">
          <h2 className="font-semibold text-lg mb-3">รายละเอียดคำสั่งซื้อ</h2>
          <div className="text-sm text-slate-700 space-y-2">
            <div><span className="font-medium">หมายเลขชำระเงิน:</span> {order.id}</div>
            <div><span className="font-medium">วันที่:</span> {order.date}</div>
            <div><span className="font-medium">จำนวนเงิน:</span> {formatCurrency(order.amount)} บาท</div>
            <div><span className="font-medium">ค่าจัดส่ง:</span> {formatCurrency(shippingFee)} บาท</div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">สรุปยอด</h3>
          <div className="flex justify-between text-slate-700 mb-2"><span>รวมสินค้า</span><span>{formatCurrency(grandTotal-shippingFee)} บาท</span></div>
          <div className="flex justify-between text-slate-700 mb-2"><span>ค่าจัดส่ง</span><span>{formatCurrency(shippingFee)} บาท</span></div>
          <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg"><span>ยอดรวมที่ต้องชำระ</span><span>{formatCurrency(grandTotal)} บาท</span></div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-3">สินค้าในคำสั่งซื้อ</h2>
        <div className="bg-white border rounded-lg">
          <ul>
            {items.map((it, idx) => (
              <li key={idx} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden flex items-center justify-center text-sm text-slate-500">รูปภาพ</div>
                  <div>
                    <div className="font-medium">{it.name || it.title || 'ชื่อสินค้าไม่ระบุ'}</div>
                    <div className="text-sm text-slate-500">จำนวน: {it.qty || 1}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency((it.price || 0) * (it.qty || 1))} บาท</div>
                  <div className="text-sm text-slate-500">หน่วยละ {formatCurrency(it.price || 0)} บาท</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="flex gap-3">
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-emerald-600 text-white rounded">กลับไปหน้าหลัก</button>
        <button onClick={() => navigate('/profile/orders')} className="px-4 py-2 border rounded">ดูคำสั่งซื้อของฉัน</button>
        {/* <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 rounded">พิมพ์ใบเสร็จ</button> */}
      </footer>
    </div>
  );
}
