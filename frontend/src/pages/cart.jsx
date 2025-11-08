import { useState, useEffect } from "react";

import { getToken } from "../utils/api";
import StripeCheckout from '../components/payment/StripeCheckout';
import AddressCart from '../components/cart/address_cart';

const baht = (n) => `฿${n.toLocaleString("th-TH")}`;
const API_BASE = import.meta.env.VITE_API_BASE || window.__API_BASE__ || "http://localhost:3000";

function CartItem({ item, onChangeQty, onRemove, loading, selected, onSelect }) {
  return (
    <div className="flex items-center gap-4 border rounded-2xl p-4 bg-white">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onSelect(item.id, e.target.checked)}
        className="w-5 h-5 accent-emerald-600"
      />
      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
      <div className="flex-1">
        <div className="font-bold text-lg">{item.name}</div>
        <div className="text-slate-600 text-sm mt-1">ไซส์: {item.size} &nbsp; สี: {item.color}</div>
        <div className="mt-3 flex items-center gap-3">
          <button disabled={loading} onClick={() => onChangeQty(item.id, Math.max(1, item.qty - 1))} className="w-8 h-8 rounded-md border bg-white">−</button>
          <div className="w-8 text-center">{item.qty}</div>
          <button disabled={loading} onClick={() => onChangeQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-md border bg-white">+</button>
        </div>
      </div>
      <div className="text-right">
        <div className="font-extrabold text-lg">{baht(item.price * item.qty)}</div>
        <div className="text-slate-500 text-sm mt-1">{baht(item.price)} ต่อชิ้น</div>
      </div>
      <button disabled={loading} onClick={() => onRemove(item.id)} className="text-red-600 ml-3 mx-5">ลบ</button>
    </div>
  );
}


export default function CartPage() {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  // localStorage key
  const LS_KEY = "cart_items";
  const token = getToken();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  // Load cart: guest (localStorage) or logged-in (API)
  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      setError("");
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.items) {
            const items = data.items.map((it) => ({ ...it }));
            setItems(items);
            // Set selectedItems based on selected field from backend
            setSelectedItems(items.filter(it => it.selected).map(it => it.id));
          } else {
            setError(data.error || "โหลดตะกร้าไม่สำเร็จ");
          }
        } catch (e) {
          setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
        }
      } else {
        // guest: localStorage
        try {
          const raw = localStorage.getItem(LS_KEY);
          setItems(raw ? JSON.parse(raw) : []);
        } catch {
          setItems([]);
        }
      }
      setLoading(false);
    }
    loadCart();
  }, [token]);

  // Save to localStorage for guest
  useEffect(() => {
    if (!token) {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    }
  }, [items, token]);

  // Change qty handler
  const changeQty = async (id, qty) => {
    if (qty < 1) return;
    setLoading(true);
    setError("");
    let updated = false;
    if (token) {
      // PATCH API
      try {
        const res = await fetch(`${API_BASE}/cart/items/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: qty }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setItems((cur) => cur.map((it) => (it.id === id ? { ...it, qty: qty } : it)));
          updated = true;
        } else {
          setError(data.error || "แก้ไขจำนวนไม่สำเร็จ");
        }
      } catch (e) {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    } else {
      // guest: localStorage
      setItems((cur) => cur.map((it) => (it.id === id ? { ...it, qty: qty } : it)));
      updated = true;
    }
    setLoading(false);
    if (updated) window.dispatchEvent(new Event("cart:updated"));
  };

  // Remove item handler
  const remove = async (id) => {
    setLoading(true);
    setError("");
    let updated = false;
    if (token) {
      // DELETE API
      try {
        const res = await fetch(`${API_BASE}/cart/items/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setItems((cur) => cur.filter((it) => it.id !== id));
          updated = true;
        } else {
          setError(data.error || "ลบสินค้าไม่สำเร็จ");
        }
      } catch (e) {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    } else {
      // guest: localStorage
      setItems((cur) => cur.filter((it) => it.id !== id));
      updated = true;
    }
    setLoading(false);
    if (updated) window.dispatchEvent(new Event("cart:updated"));
  };

  // Add item handler (for demo, not shown in UI)
  const addItem = async (product) => {
    setLoading(true);
    setError("");
    let updated = false;
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/cart/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            product_id: product.product_id || product.id, 
            quantity: 1,
            size: product.size || null
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // reload cart
          const res2 = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data2 = await res2.json();
          setItems(data2.items || []);
          updated = true;
        } else {
          setError(data.error || "เพิ่มสินค้าไม่สำเร็จ");
        }
      } catch (e) {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    } else {
      // guest: localStorage
      setItems((cur) => {
        const found = cur.find((it) => 
          it.id === product.id && it.size === (product.size || null)
        );
        if (found) {
          return cur.map((it) => 
            (it.id === product.id && it.size === (product.size || null)) 
              ? { ...it, qty: it.qty + 1 } 
              : it
          );
        } else {
          return [...cur, { ...product, qty: 1 }];
        }
      });
      updated = true;
    }
    setLoading(false);
    if (updated) window.dispatchEvent(new Event("cart:updated"));
  };

  const selectedItemsData = items.filter(it => selectedItems.includes(it.id));
  const subtotal = selectedItemsData.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
  const shipping = subtotal >= 1000 || subtotal === 0 ? 0 : 50;

  const handleCheckout = () => {
    setShowPayment(true);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Address selection zone - Moved to top */}
          <div className="rounded-2xl border bg-white p-6">
            {/* <h3 className="font-bold text-lg mb-4">ที่อยู่จัดส่ง</h3> */}
            <AddressCart selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} />
          </div>

          {/* Cart items - Moved below address */}
          <div className="rounded-2xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">รถเข็นของคุณ ({items.length} รายการ)</h3>
              <div className="text-slate-600 text-sm">{loading ? "กำลังโหลด..." : error}</div>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((it) => (
                <CartItem 
                  key={it.id} 
                  item={it} 
                  onChangeQty={changeQty} 
                  onRemove={remove} 
                  loading={loading}
                  selected={selectedItems.includes(it.id)}
                  onSelect={async (id, checked) => {
                    if (token) {
                      try {
                        const res = await fetch(`${API_BASE}/cart/items/${id}/select`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ selected: checked })
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          setSelectedItems(prev => 
                            checked 
                              ? [...prev, id]
                              : prev.filter(itemId => itemId !== id)
                          );
                        } else {
                          setError(data.error || "ไม่สามารถอัปเดตสถานะการเลือกได้");
                        }
                      } catch (e) {
                        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
                      }
                    } else {
                      setSelectedItems(prev => 
                        checked 
                          ? [...prev, id]
                          : prev.filter(itemId => itemId !== id)
                      );
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border bg-white p-6">
          {showPayment ? (
            <>
              <h3 className="font-bold text-lg mb-6">ชำระเงิน</h3>
              <StripeCheckout 
                amount={subtotal + shipping}
                items={selectedItemsData}
                address={selectedAddress}
                onCancel={() => setShowPayment(false)}
                onSuccess={async () => {
                  if (token) {
                    try {
                      const res = await fetch(`${API_BASE}/cart/selected`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        // Remove selected items from local state
                        setItems(cur => cur.filter(it => !selectedItems.includes(it.id)));
                        setSelectedItems([]);
                      } else {
                        setError(data.error || "ไม่สามารถลบสินค้าที่ชำระเงินแล้ว");
                      }
                    } catch (e) {
                      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
                    }
                  }
                }}
              />
            </>
          ) : (
            <>
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

              <button 
                className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold disabled:bg-slate-400" 
                onClick={handleCheckout}
                disabled={loading || selectedItems.length === 0 || !selectedAddress}
              >
                ดำเนินการชำระเงิน ({selectedItems.length} รายการ)
              </button>

              <p className="mt-3 text-xs text-slate-500">
                การจัดส่งฟรีสำหรับคำสั่งซื้อเกิน ฿1,000<br/>
                รับประกันการคืนเงิน 30 วัน
              </p>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
