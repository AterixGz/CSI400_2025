import React, { useEffect, useState } from "react";
import Header from "../component/header";

export default function Products() {
  // ฟังก์ชันปรับ stock
  async function updateStock(product_id, delta) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin_products/products/${product_id}/stock`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delta }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "ปรับ stock ไม่สำเร็จ");
      // อัปเดต stock เฉพาะรายการนั้น ไม่ต้อง reload ทั้งหมด
      setProducts((products) =>
        products.map((p) =>
          p.product_id === product_id ? { ...p, stock: data.stock } : p
        )
      );
    } catch (e) {
      alert(e.message || "เกิดข้อผิดพลาด");
    }
  }
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    category_id: "",
  });
  const [adding, setAdding] = useState(false);

  // โหลดสินค้า
  async function loadProducts() {
    setLoading(true);
    setErr("");
    try {
      console.log("📦 กำลังโหลดสินค้า...");
      const res = await fetch("http://localhost:3000/api/products"); // ✅ เปลี่ยนเป็น /api/products
      console.log("📡 Response status:", res.status);

      const text = await res.text();
      console.log("📨 Raw response:", text);

      if (!res.ok) throw new Error(`โหลดสินค้าล้มเหลว (status: ${res.status})`);

      let rows;
      try {
        rows = JSON.parse(text);
      } catch (err) {
        console.error("❌ JSON parse error:", err);
        throw new Error("รูปแบบข้อมูลไม่ถูกต้อง (ไม่ใช่ JSON)");
      }

      setProducts(Array.isArray(rows) ? rows : []);
      console.log("✅ โหลดสินค้าสำเร็จ:", rows);
    } catch (e) {
      console.error("🔥 โหลดสินค้าผิดพลาด:", e);
      setErr(e.message || "โหลดสินค้าล้มเหลว");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // เพิ่มสินค้าใหม่
  async function handleAddProduct(e) {
    e.preventDefault();

    if (adding) return;
    setAdding(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category_id", form.category_id);
      formData.append("image", form.image);

      const res = await fetch("http://localhost:3000/api/products", {
        // ✅ เปลี่ยนตรงนี้ด้วย
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || "เพิ่มสินค้าไม่สำเร็จ");
      }

      alert("✅ เพิ่มสินค้าสำเร็จ!");
      setForm({
        name: "",
        description: "",
        price: "",
        image: null,
        category_id: "",
      });
      setShowModal(false);
      await loadProducts();
    } catch (e) {
      alert(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-4 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">Products</h2>

        {/* ปุ่มเปิด Modal */}
        <button
          className="mb-6 px-4 py-2 rounded bg-blue-600 text-white font-bold"
          onClick={() => setShowModal(true)}
        >
          เพิ่มสินค้าใหม่
        </button>

        {/* Modal เพิ่มสินค้า */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setShowModal(false)}
                aria-label="close"
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4">เพิ่มสินค้าใหม่</h3>
              <form className="space-y-4" onSubmit={handleAddProduct}>
                <div>
                  <label className="block mb-1 font-medium">ชื่อสินค้า</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">รายละเอียด</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    required
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">ราคา</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    required
                    min={0}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">รูปภาพ</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="w-full border rounded px-3 py-2"
                    required
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image: e.target.files[0] }))
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">ประเภทสินค้า</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    required
                    value={form.category_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category_id: e.target.value }))
                    }
                  >
                    <option value="">เลือกประเภท</option>
                    <option value="1">ชาย</option>
                    <option value="2">หญิง</option>
                    <option value="3">เด็ก</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded font-bold text-white ${
                    adding ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={adding}
                >
                  {adding ? "กำลังเพิ่ม..." : "บันทึกสินค้า"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ตารางแสดงสินค้าทั้งหมด */}
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : err ? (
          <p className="text-red-600">{err}</p>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b">รูปภาพ</th>
                  <th className="py-2 px-4 border-b">ชื่อสินค้า</th>
                  <th className="py-2 px-4 border-b">รายละเอียด</th>
                  <th className="py-2 px-4 border-b">ราคา</th>
                  <th className="py-2 px-4 border-b">จำนวนคงเหลือ (Stock)</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.product_id}>
                    <td className="py-2 px-4 border-b">
                      {p.image_url && (
                        <img
                          src={
                            p.image_url.startsWith("http")
                              ? p.image_url
                              : `http://localhost:3000${p.image_url}`
                          }
                          alt={p.product_name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">{p.product_name}</td>
                    <td className="py-2 px-4 border-b">{p.description}</td>
                    <td className="py-2 px-4 border-b">{p.price}</td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="px-2 py-1 bg-gray-200 rounded text-lg font-bold"
                          onClick={() => updateStock(p.product_id, -1)}
                          disabled={adding || p.stock <= 0}
                        >
                          -
                        </button>
                        <span className="min-w-[24px] text-center">
                          {p.stock ?? "-"}
                        </span>
                        <button
                          className="px-2 py-1 bg-gray-200 rounded text-lg font-bold"
                          onClick={() => updateStock(p.product_id, 1)}
                          disabled={adding}
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">ไม่มีสินค้าในระบบ</p>
        )}
      </main>
    </div>
  );
}
