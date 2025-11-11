import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  let user = null;

  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {}

  // ตรวจสอบสิทธิ์
  if (!user || !["manager", "admin", "staff"].includes(user.role_name || user.role)) {
    return <Navigate to="/login" replace />; // ถ้าไม่มีสิทธิ์ → redirect login
  }

  return children; // มีสิทธิ์ → render หน้า admin
}
