import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
  let user = null;

  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {}

  const location = useLocation();
  const currentPath = location.pathname;

  // ถ้าไม่ได้ login → redirect login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role_name || user.role;

  // user (role_id=1) ไม่มีสิทธิ์เข้า admin เลย
  if (role === "user" || role === 1) {
    return <Navigate to="/profile" replace />;
  }

  // staff (role_id=2) เข้าได้เฉพาะ /admin/orders
  if (role === "staff" || role === 2) {
    if (!currentPath.includes("/admin/orders")) {
      return <Navigate to="/admin/orders" replace />;
    }
    return children; // staff allowed for /admin/orders
  }

  // manager (role_id=3) เข้า admin ทั้งหมดได้
  if (!["manager", "admin", 3].includes(role)) {
    return <Navigate to="/profile" replace />;
  }

  return children; // manager/admin มีสิทธิ์ → render หน้า admin
}
