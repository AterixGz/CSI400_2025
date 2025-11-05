import { toast } from "react-hot-toast";
import { getToken } from "./api";

// Use relative /api so Vite proxy forwards requests in dev
const API_BASE = import.meta.env.VITE_API_BASE || window.__API_BASE__ || "/api";

/**
 * Add product to cart (supports logged-in users via API and guest via localStorage).
 * @param {Object} product - Product object with id/product_id, name, price, image, optional size
 * @param {Function} navigate - react-router navigate function
 * @param {number} quantity - Number of items to add (default: 1)
 * @returns {Promise<boolean>} true if added successfully
 */
export async function addToCart(product, navigate, quantity = 1) {
  const token = getToken();
  const productId = product.product_id || product.id;
  const size = product.size || null;

  // Guest: store in localStorage
  if (!token) {
    try {
      const key = "cart_items";
      const raw = localStorage.getItem(key);
      const items = raw ? JSON.parse(raw) : [];

      // if same product+size exists, increase qty
      const existing = items.find(
        (it) => it.id === productId && it.size === size
      );
      if (existing) {
        existing.qty = (existing.qty || 1) + quantity;
      } else {
        items.push({
          id: productId,
          product_id: productId,
          name: product.name || product.product_name || "",
          price: product.price || 0,
          image: product.image || product.image_url || "",
          qty: quantity,
          size: size,
        });
      }
      localStorage.setItem(key, JSON.stringify(items));
      window.dispatchEvent(new Event("cart:updated"));
      toast.success("เพิ่มสินค้าลงตะกร้าสำเร็จ");
      navigate("/cart");
      return true;
    } catch (e) {
      console.error("addToCart guest error:", e);
      toast.error("ไม่สามารถเพิ่มสินค้าลงตะกร้าได้");
      return false;
    }
  }

  // Logged-in: call API
  try {
    const body = {
      product_id: productId,
      quantity,
    };
    if (size) body.size = size;

    const res = await fetch(`${API_BASE}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      window.dispatchEvent(new Event("cart:updated"));
      toast.success("เพิ่มสินค้าลงตะกร้าสำเร็จ");
      navigate("/cart");
      return true;
    }
    console.error("addToCart api error:", data);
    toast.error(data.error || "เพิ่มสินค้าไม่สำเร็จ");
    return false;
  } catch (e) {
    console.error("addToCart network error:", e);
    toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    return false;
  }
}

export default addToCart;