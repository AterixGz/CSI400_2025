import React, { useEffect, useState, useMemo } from "react";
import Header from "../component/header";
import { toast } from "react-hot-toast";

export default function Products() {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editProductDraft, setEditProductDraft] = useState(null);
  const [showHideConfirmModal, setShowHideConfirmModal] = useState(false);
  const [hideTargetProduct, setHideTargetProduct] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTargetProduct, setDeleteTargetProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    audience_id: "",
    category_id: "",
    sizes: [
      { size_name: "Freesize", stock: "" },
      { size_name: "L", stock: "" },
      { size_name: "M", stock: "" },
      { size_name: "S", stock: "" },
    ],
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  // sorting state: key can be 'product_name','description','is_hidden','price','stock'
  const [sortBy, setSortBy] = useState({ key: null, dir: "asc" });

  function handleSort(key) {
    setSortBy((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const categories = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => {
      if (p.category_id || p.category_name) {
        map.set(p.category_id ?? p.category_name, p.category_name ?? String(p.category_id));
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const displayedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    // filter by searchTerm first
  let arr = [...products];
  const q = (searchTerm || "").trim().toLowerCase();
    if (q) {
      arr = arr.filter((p) => {
        const name = String(p.product_name || "").toLowerCase();
        const desc = String(p.description || "").toLowerCase();
        const cat = String(p.category_name || "").toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    // apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "online") {
        arr = arr.filter((p) => !p.is_hidden && (p.stock === undefined || Number(p.stock) > 0));
      } else if (statusFilter === "offline") {
        arr = arr.filter((p) => p.is_hidden || Number(p.stock) <= 0);
      }
    }

    // category filter
    if (categoryFilter && categoryFilter !== "all") {
      arr = arr.filter((p) => String(p.category_id) === String(categoryFilter));
    }

    // price range filter
    const min = priceMin === "" ? null : Number(priceMin);
    const max = priceMax === "" ? null : Number(priceMax);
    if (min !== null) arr = arr.filter((p) => Number(p.price) >= min);
    if (max !== null) arr = arr.filter((p) => Number(p.price) <= max);

    // low stock filter
    if (lowStockOnly) {
      const th = Number(lowStockThreshold) || 0;
      arr = arr.filter((p) => Number(p.stock) < th);
    }

    if (!sortBy.key) return arr;
    const dir = sortBy.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const k = sortBy.key;
      const va = a[k];
      const vb = b[k];
      // numeric fields
      if (k === "price" || k === "stock") {
        const na = Number(va) || 0;
        const nb = Number(vb) || 0;
        return (na - nb) * dir;
      }
      // boolean (is_hidden) -> show (false) should come before hidden (true) when asc
      if (k === "is_hidden") {
        const na = va ? 1 : 0;
        const nb = vb ? 1 : 0;
        return (na - nb) * dir;
      }
      // default: string compare (Thai + fallback)
      return String(va ?? "").localeCompare(String(vb ?? ""), "th") * dir;
    });
    return arr;
  }, [products, sortBy, searchTerm]);

  // โหลดสินค้า
  async function loadProducts() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("http://localhost:3000/api/admin_products/all");
      const text = await res.text();
      if (!res.ok) throw new Error(`โหลดสินค้าล้มเหลว (status: ${res.status})`);

      const rows = JSON.parse(text);
      setProducts(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setErr(e.message || "โหลดสินค้าล้มเหลว");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // ลบสินค้าออกจากระบบ (modal)
  async function confirmDeleteProduct() {
    if (!deleteTargetProduct) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin_products/${deleteTargetProduct.product_id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("ลบสินค้าไม่สำเร็จ");
      await loadProducts();
      setEditProduct(null);
      setEditProductDraft(null);
      setShowDeleteConfirmModal(false);
      setDeleteTargetProduct(null);
    } catch (e) {
      toast.error(e.message || "เกิดข้อผิดพลาด");
      setShowDeleteConfirmModal(false);
    }
  }

  // ซ่อน/แสดงสินค้า
  async function confirmToggleHide() {
    if (!hideTargetProduct) return;
    const { product_id, is_hidden } = hideTargetProduct;
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin_products/${product_id}/hide`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_hidden: !is_hidden }),
        }
      );
      if (!res.ok)
        throw new Error(
          is_hidden ? "แสดงสินค้าไม่สำเร็จ" : "ซ่อนสินค้าไม่สำเร็จ"
        );

      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === product_id ? { ...p, is_hidden: !is_hidden } : p
        )
      );
      setEditProduct((prev) =>
        prev ? { ...prev, is_hidden: !is_hidden } : prev
      );
      setShowHideConfirmModal(false);
      setHideTargetProduct(null);
    } catch (e) {
      toast.error(e.message || "เกิดข้อผิดพลาด");
      setShowHideConfirmModal(false);
    }
  }

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
      formData.append("audience_id", Number(form.audience_id));
      formData.append("category_id", Number(form.category_id));
      formData.append("image", form.image);
      formData.append("sizes", JSON.stringify(form.sizes));

      const res = await fetch("http://localhost:3000/api/admin_products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เพิ่มสินค้าไม่สำเร็จ");

      toast.success("เพิ่มสินค้าสำเร็จ!");
      setForm({
        name: "",
        description: "",
        price: "",
        image: null,
        audience_id: "",
        category_id: "",
        sizes: [
          { size_name: "Freesize", stock: "" },
          { size_name: "L", stock: "" },
          { size_name: "M", stock: "" },
          { size_name: "S", stock: "" },
        ],
      });
      setShowModal(false);
      await loadProducts();
    } catch (e) {
      toast.error(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setAdding(false);
    }
  }

  // ฟังก์ชันแก้ไขสินค้า (PATCH ข้อมูลทั่วไป + PATCH stock เฉพาะ size ที่เปลี่ยน)
  async function handleEditProduct(e) {
    e.preventDefault();
    setShowConfirmModal(true);
  }

  async function confirmEditProduct() {
    if (!editProduct || !editProductDraft) return;
    setSavingEdit(true);
    try {
      let res;

      // ถ้ามีไฟล์รูปใหม่ ให้ส่งแบบ FormData (backend จะจัดการลบรูปเก่า)
      if (editProductDraft.image) {
        const formData = new FormData();
        formData.append("name", editProductDraft.product_name);
        formData.append("description", editProductDraft.description);
        formData.append("price", editProductDraft.price);
        if (editProductDraft.audience_id !== undefined)
          formData.append("audience_id", editProductDraft.audience_id);
        if (editProductDraft.category_id !== undefined)
          formData.append("category_id", editProductDraft.category_id);
        formData.append("image", editProductDraft.image);
        if (editProductDraft.sizes) {
          formData.append("sizes", JSON.stringify(editProductDraft.sizes));
        }

        res = await fetch(
          `http://localhost:3000/api/admin_products/${editProduct.product_id}`,
          { method: "PATCH", body: formData }
        );
      } else {
        // ไม่มีรูปใหม่ -> ส่ง JSON ปกติ
        res = await fetch(
          `http://localhost:3000/api/admin_products/${editProduct.product_id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editProductDraft.product_name,
              description: editProductDraft.description,
              price: editProductDraft.price,
            }),
          }
        );
      }

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "แก้ไขสินค้าไม่สำเร็จ");
      }

      // PATCH stock ทุก size ที่เปลี่ยน
      const changedSizes = (editProductDraft.sizes || []).filter((sz, idx) => {
        const oldSz = (editProduct.sizes || [])[idx];
        return oldSz && String(oldSz.stock) !== String(sz.stock);
      });
      for (const sz of changedSizes) {
        const delta =
          Number(sz.stock) -
          Number(
            (editProduct.sizes || []).find((s) => s.size_name === sz.size_name)
              ?.stock ?? 0
          );
        if (delta !== 0) {
          const stockRes = await fetch(
            `http://localhost:3000/api/admin_products/products/${editProduct.product_id}/stock`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ size_name: sz.size_name, delta }),
            }
          );
          const stockData = await stockRes.json();
          if (!stockRes.ok)
            throw new Error(
              stockData.error || `ปรับ stock ${sz.size_name} ไม่สำเร็จ`
            );
        }
      }

      toast.success("บันทึกการแก้ไขเรียบร้อย!");
      try {
        if (editProductDraft?.image_url && String(editProductDraft.image_url).startsWith("blob:")) {
          URL.revokeObjectURL(editProductDraft.image_url);
        }
      } catch (_) {}
      setEditProduct(null);
      setEditProductDraft(null);
      setShowConfirmModal(false);
      await loadProducts();
    } catch (err) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
      setShowConfirmModal(false);
    } finally {
      setSavingEdit(false);
    }
  }

  // ฟังก์ชันปรับ stock size draft ใน modal edit
  function adjustSizeStockDraft(size_name, delta) {
    setEditProductDraft((prev) => {
      if (!prev || !prev.sizes) return prev;
      return {
        ...prev,
        sizes: prev.sizes.map((sz) =>
          sz.size_name === size_name
            ? { ...sz, stock: String(Math.max(0, Number(sz.stock) + delta)) }
            : sz
        ),
      };
    });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-4 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">Products</h2>

        {/* ปุ่มเพิ่มสินค้า และช่องค้นหา (บนบรรทัดเดียวกัน) */}
          <div className="mb-6 flex items-center justify-between">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-bold"
            onClick={() => setShowModal(true)}
          >
            เพิ่มสินค้าใหม่
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาสินค้า / รายละเอียด / ประเภท"
              className="border rounded px-3 py-2 w-72"
            />
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="px-3 py-2 bg-gray-200 rounded"
            >
              ล้าง
            </button>
          </div>
        
        {showFilters && (
          <div className="mb-4 p-3 bg-white border rounded shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm">สถานะ</label>
                <select className="border rounded px-2 py-1" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">ทั้งหมด</option>
                  <option value="online">ออนไลน์ (แสดง)</option>
                  <option value="offline">ออฟไลน์ / หมดสต็อก</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">หมวดหมู่</label>
                <select className="border rounded px-2 py-1" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">ทั้งหมด</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">ช่วงราคา</label>
                <input type="number" className="border rounded px-2 py-1 w-20" placeholder="จาก" value={priceMin} onChange={(e)=>setPriceMin(e.target.value)} />
                <span>-</span>
                <input type="number" className="border rounded px-2 py-1 w-20" placeholder="ถึง" value={priceMax} onChange={(e)=>setPriceMax(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={lowStockOnly} onChange={(e)=>setLowStockOnly(e.target.checked)} />
                  คงเหลือต่ำกว่า
                </label>
                <input type="number" className="border rounded px-2 py-1 w-20" value={lowStockThreshold} onChange={(e)=>setLowStockThreshold(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => {
                  setStatusFilter("all"); setCategoryFilter("all"); setPriceMin(""); setPriceMax(""); setLowStockOnly(false); setLowStockThreshold(10);
                }}>ล้างตัวกรอง</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setShowFilters(false)}>ปิด</button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Modal เพิ่มสินค้า */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setShowModal(false)}
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
                    <option value="">เลือกประเภทสินค้า</option>
                    <option value="1">เสื้อ</option>
                    <option value="2">กางเกง</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    กลุ่มเป้าหมาย
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    required
                    value={form.audience_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, audience_id: e.target.value }))
                    }
                  >
                    <option value="">เลือกกลุ่มเป้าหมาย</option>
                    <option value="1">ชาย</option>
                    <option value="2">หญิง</option>
                    <option value="3">เด็ก</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Stock แต่ละไซต์
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {form.sizes.map((sz, idx) => (
                      <div
                        key={sz.size_name}
                        className="flex items-center gap-2"
                      >
                        <span className="w-20">{sz.size_name}</span>
                        <input
                          type="number"
                          min={0}
                          className="border rounded px-2 py-1 w-24"
                          placeholder={`Stock ${sz.size_name}`}
                          value={sz.stock}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((f) => ({
                              ...f,
                              sizes: f.sizes.map((s, i) =>
                                i === idx ? { ...s, stock: val } : s
                              ),
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
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

        {/* Modal แก้ไขสินค้า */}
        {editProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => {
                  try {
                    if (editProductDraft?.image_url && String(editProductDraft.image_url).startsWith("blob:")) {
                      URL.revokeObjectURL(editProductDraft.image_url);
                    }
                  } catch (_) {}
                  setEditProduct(null);
                  setEditProductDraft(null);
                  setShowConfirmModal(false);
                }}
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4">แก้ไขสินค้า</h3>
              <form className="space-y-4" onSubmit={handleEditProduct}>
                <div>
                  <label className="block mb-1 font-medium">ชื่อสินค้า</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editProductDraft?.product_name ?? ""}
                    onChange={(e) =>
                      setEditProductDraft((p) => ({
                        ...p,
                        product_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">รายละเอียด</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={editProductDraft?.description ?? ""}
                    onChange={(e) =>
                      setEditProductDraft((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">ราคา</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded px-3 py-2"
                    value={editProductDraft?.price ?? ""}
                    onChange={(e) =>
                      setEditProductDraft((p) => ({
                        ...p,
                        price: e.target.value,
                      }))
                    }
                  />
                </div>
                {/* เปลี่ยนรูปภาพสินค้า (edit) */}
                <div>
                  <label className="block mb-1 font-medium">เปลี่ยนรูปภาพสินค้า</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="w-full border rounded px-3 py-2"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditProductDraft((prev) => {
                          try {
                            if (prev?.image_url && String(prev.image_url).startsWith("blob:")) {
                              URL.revokeObjectURL(prev.image_url);
                            }
                          } catch (_) {}
                          const preview = URL.createObjectURL(file);
                          return { ...prev, image: file, image_url: preview };
                        });
                      }
                    }}
                  />
                  {editProductDraft?.image_url && (
                    <img src={editProductDraft.image_url} alt="preview" className="mt-2 w-24 h-24 object-cover rounded" />
                  )}
                </div>
                {/* ปรับ stock size draft */}
                <div>
                  <label className="block mb-1 font-medium">
                    ปรับ stock แต่ละไซต์
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {editProductDraft?.sizes &&
                      editProductDraft.sizes.map((sz, idx) => (
                        <div
                          key={sz.size_name}
                          className="flex items-center gap-2"
                        >
                          <span className="w-20">{sz.size_name}</span>
                          <button
                            type="button"
                            className="px-2 py-1 bg-gray-200 rounded text-lg"
                            onClick={() =>
                              adjustSizeStockDraft(sz.size_name, -1)
                            }
                            disabled={adding || Number(sz.stock) <= 0}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            className="border rounded px-2 py-1 w-16 text-center"
                            value={sz.stock}
                            readOnly
                          />
                          <button
                            type="button"
                            className="px-2 py-1 bg-gray-200 rounded text-lg"
                            onClick={() =>
                              adjustSizeStockDraft(sz.size_name, 1)
                            }
                            disabled={adding}
                          >
                            +
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setHideTargetProduct(editProduct);
                      setShowHideConfirmModal(true);
                    }}
                    className={`px-3 py-2 rounded text-sm font-bold ${
                      editProduct.is_hidden
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {editProduct.is_hidden ? "แสดงสินค้า" : "ซ่อนสินค้า"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTargetProduct(editProduct);
                      setShowDeleteConfirmModal(true);
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded text-sm font-bold"
                  >
                    ลบสินค้า
                  </button>
              {/* Modal ยืนยันลบสินค้า */}
              {showDeleteConfirmModal && deleteTargetProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center">
                    <h4 className="text-lg font-bold mb-4">ยืนยันการลบสินค้า</h4>
                    <p className="mb-6">คุณต้องการลบสินค้านี้ออกจากระบบถาวรหรือไม่?</p>
                    <div className="flex gap-4 justify-center">
                      <button
                        className="px-4 py-2 rounded bg-red-600 text-white font-bold"
                        onClick={confirmDeleteProduct}
                      >ตกลง</button>
                      <button
                        className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-bold"
                        onClick={() => {
                          setShowDeleteConfirmModal(false);
                          setDeleteTargetProduct(null);
                        }}
                      >ยกเลิก</button>
                    </div>
                  </div>
                </div>
              )}
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded font-bold"
                >
                  บันทึกการแก้ไข
                </button>
              </form>

              {/* Modal ยืนยันซ่อน/แสดง */}
              {showHideConfirmModal && hideTargetProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center">
                    <h4 className="text-lg font-bold mb-4">
                      ยืนยันการซ่อน/แสดงสินค้า
                    </h4>
                    <p className="mb-6">
                      คุณต้องการ {hideTargetProduct.is_hidden ? "แสดง" : "ซ่อน"}{" "}
                      สินค้านี้หรือไม่?
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        className="px-4 py-2 rounded bg-blue-600 text-white font-bold"
                        onClick={confirmToggleHide}
                      >
                        ตกลง
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-bold"
                        onClick={() => {
                          setShowHideConfirmModal(false);
                          setHideTargetProduct(null);
                        }}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal ยืนยันบันทึกการแก้ไข */}
              {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center">
                    <h4 className="text-lg font-bold mb-4">
                      ยืนยันการบันทึกสินค้า
                    </h4>
                    <p className="mb-6">
                      คุณต้องการบันทึกการแก้ไขสินค้านี้หรือไม่?
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        className={`px-4 py-2 rounded font-bold text-white ${savingEdit ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'}`}
                        onClick={confirmEditProduct}
                        disabled={savingEdit}
                      >
                        {savingEdit ? 'กำลังบันทึก...' : 'ตกลง'}
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-bold"
                        onClick={() => setShowConfirmModal(false)}
                        disabled={savingEdit}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ตารางแสดงสินค้า */}
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : err ? (
          <p className="text-red-600">{err}</p>
        ) : products.length > 0 ? (
          <div className="overflow-y-auto max-h-[70vh] rounded-lg shadow">
            
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 text-left">รูปภาพ</th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer select-none"
                    onClick={() => handleSort("product_name")}
                  >
                    ชื่อสินค้า
                    <span className="ml-2 inline-block w-4 text-center">{sortBy.key === "product_name" ? (sortBy.dir === "asc" ? "▲" : "▼") : "\u00A0"}</span>
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer select-none"
                    onClick={() => handleSort("description")}
                  >
                    รายละเอียด
                    <span className="ml-2 inline-block w-4 text-center">{sortBy.key === "description" ? (sortBy.dir === "asc" ? "▲" : "▼") : "\u00A0"}</span>
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer select-none"
                    onClick={() => handleSort("is_hidden")}
                  >
                    สถานะ
                    <span className="ml-2 inline-block w-4 text-center">{sortBy.key === "is_hidden" ? (sortBy.dir === "asc" ? "▲" : "▼") : "\u00A0"}</span>
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer select-none"
                    onClick={() => handleSort("price")}
                  >
                    ราคา
                    <span className="ml-2 inline-block w-4 text-center">{sortBy.key === "price" ? (sortBy.dir === "asc" ? "▲" : "▼") : "\u00A0"}</span>
                  </th>
                  <th
                    className="py-3 px-4 text-left cursor-pointer select-none"
                    onClick={() => handleSort("stock")}
                  >
                    คงเหลือ
                    <span className="ml-2 inline-block w-4 text-center">{sortBy.key === "stock" ? (sortBy.dir === "asc" ? "▲" : "▼") : "\u00A0"}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((p) => (
                  <tr
                    key={p.product_id}
                    className="border-b transition-colors hover:bg-gray-50"
                  >
                    <td className="py-2 px-4">
                      <img
                        src={p.image_url}
                        alt={p.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-2 px-4">{p.product_name}</td>
                    <td className="py-2 px-4">{p.description}</td>
                    <td className="py-2 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${p.is_hidden ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {p.is_hidden ? 'ซ่อน' : 'แสดง'}
                      </span>
                    </td>
                    <td className="py-2 px-4">{p.price}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-between">
                        <span>{p.stock ?? "-"}</span>
                        <button
                          onClick={() => {
                            setEditProduct(p);
                            setEditProductDraft(JSON.parse(JSON.stringify(p)));
                          }}
                          className="ml-2 text-gray-600 hover:text-gray-900 text-2xl"
                          title="แก้ไขสินค้า"
                        >
                          ✎
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
