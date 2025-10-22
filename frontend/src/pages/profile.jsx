import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function IconCamera({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7h3l2-2h6l2 2h3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMail({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8.5v7A2.5 2.5 0 0 0 5.5 18h13A2.5 2.5 0 0 0 21 15.5v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8.5l-9 6-9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [saved, setSaved] = useState(form);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);

  const handleLogout = () => {
    // clear auth info and go to login
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (e) {
      // ignore
    }
    navigate("/login");
  };

  // base URL for API (use Vite env if provided)
  const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : 'http://localhost:3000';

  useEffect(() => {
    // ดึงข้อมูล user จาก localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const u = JSON.parse(user);
      setForm({
        name: (u.first_name || "") + (u.last_name ? " " + u.last_name : ""),
        email: u.email || "",
        phone: u.phone_number || "",
        address: u.address || ""
      });
      setSaved({
        name: (u.first_name || "") + (u.last_name ? " " + u.last_name : ""),
        email: u.email || "",
        phone: u.phone_number || "",
        address: u.address || ""
      });
      if (u.profile_image_url) setProfileImagePreview(u.profile_image_url);
    }
  }, []);
  const orders = [
    {
      id: "ORD-001",
      date: "15/1/2567",
      status: "จัดส่งแล้ว",
      items: [
        { title: "เสื้อเชิ้ตคอกลม สีขาว", price: 890, img: "/vite.svg" },
        { title: "กางเกงยีนส์ขาบาน สีน้ำเงิน", price: 2000, img: "/vite.svg" },
      ],
    },
    {
      id: "ORD-002",
      date: "20/1/2567",
      status: "กำลังจัดส่ง",
      items: [{ title: "เสื้อเชิ้ตแขนยาว ลายทาง", price: 1590, img: "/vite.svg" }],
    },
  ];

  // Handlers for settings actions
  const handleManageCards = () => {
    // placeholder action - integrate with real payment UI later
    alert("เปิดหน้าจัดการบัตรเครดิต/เดบิต");
  };

  const handleChangePassword = () => {
    alert("เปิดหน้าจอเปลี่ยนรหัสผ่าน");
  };

  const handleTwoFactor = () => {
    alert("เปิดการยืนยันตัวตน 2 ขั้นตอน");
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">
              {/* avatar: preview or placeholder */}
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <svg className="w-16 h-16 text-slate-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                // read as data URL
                const reader = new FileReader();
                reader.onload = () => {
                  setProfileImagePreview(reader.result);
                  setImageChanged(true);
                };
                reader.readAsDataURL(f);
              }}
            />
            <button
              aria-label="อัพโหลดรูป"
              className="absolute -bottom-1 left-6 bg-rose-400 rounded-full p-2 text-white shadow-md"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <IconCamera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{form.name || "-"}</h1>
            <div className="mt-2 flex items-center text-slate-600 gap-2">
              <IconMail className="w-4 h-4 text-slate-500" />
              <span>{form.email || "-"}</span>
            </div>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(true)} className="bg-teal-600 text-white px-4 py-2 rounded-md">แก้ไขข้อมูล</button>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md">ออกจากระบบ</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  // prepare payload: split name into first/last
                  const names = (form.name || "").trim().split(" ");
                  const first_name = names[0] || null;
                  const last_name = names.length > 1 ? names.slice(1).join(" ") : null;

                  // get current user id and token from localStorage
                  const userRaw = localStorage.getItem("user");
                  if (!userRaw) {
                    alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง");
                    navigate("/login");
                    return;
                  }
                  const currentUser = JSON.parse(userRaw);
                  const userId = currentUser.user_id || currentUser.id || currentUser.userId;

                  const payload = {
                    email: form.email,
                    phone_number: form.phone,
                    first_name,
                    last_name,
                    profile_image_url: profileImagePreview || null,
                  };

                  // Validate phone: if provided must be exactly 10 digits
                  if (form.phone && form.phone.length !== 10) {
                    alert('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก (ตัวเลขเท่านั้น)');
                    return;
                  }

                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${API_BASE}/api/users/${userId}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify(payload),
                    });

                    // safe JSON parse: server might return empty body
                    const text = await res.text();
                    let body = null;
                    if (text) {
                      try {
                        body = JSON.parse(text);
                      } catch (parseErr) {
                        console.warn("Response is not valid JSON:", text);
                      }
                    }

                    if (!res.ok) {
                      const serverMsg = (body && (body.error || body.message)) || text || res.statusText;
                      throw new Error(serverMsg || "ไม่สามารถบันทึกได้");
                    }

                    const updated = body || null;
                    if (updated) {
                      // map updated DB row -> form fields
                      const newForm = {
                        name: (updated.first_name || "") + (updated.last_name ? " " + updated.last_name : ""),
                        email: updated.email || "",
                        phone: updated.phone_number || "",
                        address: updated.address || "",
                      };
                      // update localStorage user
                      localStorage.setItem("user", JSON.stringify(updated));
                      setForm(newForm);
                      setSaved(newForm);
                    } else {
                      // fallback: keep current form
                      setSaved(form);
                    }
                    setIsEditing(false);
                    // notify other components (navbar) that user changed
                    try {
                      window.dispatchEvent(new Event('user:updated'));
                    } catch (e) {}
                    alert("บันทึกข้อมูลเรียบร้อยแล้ว");
                  } catch (e) {
                    console.error(e);
                    alert("เกิดข้อผิดพลาดขณะบันทึก: " + (e.message || e));
                  }
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md"
              >
                บันทึก
              </button>
              <button
                onClick={() => {
                  setForm(saved);
                  setIsEditing(false);
                }}
                className="bg-white border border-slate-200 px-4 py-2 rounded-md"
              >
                ยกเลิก
              </button>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md">ออกจากระบบ</button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="flex items-center gap-4 bg-white px-2 py-2 rounded-md shadow-sm">
          <button onClick={() => setTab("profile")} className={`px-4 py-2 rounded-md ${tab === "profile" ? "bg-slate-50 shadow-inner" : "text-slate-600"}`}>
            <span className="inline-flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> ข้อมูลส่วนตัว</span>
          </button>
          <button onClick={() => setTab("orders")} className={`px-4 py-2 rounded-md ${tab === "orders" ? "bg-slate-50 shadow-inner" : "text-slate-600"}`}>
            <span className="inline-flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M3 7h18M7 7v14h10V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> ประวัติการสั่งซื้อ</span>
          </button>
          <button onClick={() => setTab("settings")} className={`px-4 py-2 rounded-md ${tab === "settings" ? "bg-slate-50 shadow-inner" : "text-slate-600"}`}>
            <span className="inline-flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.28 17.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.3 3.7A2 2 0 0 1 7.13 1.87l.06.06A1.65 1.65 0 0 0 9 2.26c.5.2 1 .3 1 .3H14c0 0 .5-.1 1-.3a1.65 1.65 0 0 0 1.81-.33L18.87 1.87A2 2 0 0 1 21.7 4.7l-.06.06a1.65 1.65 0 0 0-.33 1.82c.2.5.3 1 .3 1h.09a2 2 0 0 1 0 4h-.09c-.1 0-.4.5-.3 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> การตั้งค่า</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === "profile" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-4">ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-2">ชื่อ-นามสกุล</label>
                {!isEditing ? (
                  <div className="flex items-center gap-3 bg-slate-50 rounded-md p-3">
                    <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.5-4 6-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    <span className="text-slate-600">{form.name}</span>
                  </div>
                ) : (
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 rounded-md p-3 border border-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">อีเมล</label>
                {!isEditing ? (
                  <div className="flex items-center gap-3 bg-slate-50 rounded-md p-3">
                    <IconMail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{form.email}</span>
                  </div>
                ) : (
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 rounded-md p-3 border border-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">เบอร์โทรศัพท์</label>
                {!isEditing ? (
                  <div className="flex items-center gap-3 bg-slate-50 rounded-md p-3">
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12 1.05.38 2.07.76 3.03a2 2 0 0 1-.45 2.11L9.91 10.09a16 16 0 0 0 6 6l1.23-1.23a2 2 0 0 1 2.11-.45c.96.38 1.98.64 3.03.76A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-slate-600">{form.phone}</span>
                  </div>
                ) : (
                  <input
                    value={form.phone}
                    onChange={(e) => {
                      // allow only digits and limit to 10 characters
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm({ ...form, phone: digits });
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="0812345678"
                    className="w-full bg-slate-50 rounded-md p-3 border border-slate-200"
                  />
                )}
              </div>

              <div className="md:col-span-2">
              </div>
            </div>
          </div>
        )}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">ประวัติการสั่งซื้อ</h3>
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden">
                          <img src={o.items[0].img} alt="thumb" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">คำสั่งซื้อ #{o.id} <span className="ml-2 text-sm px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">{o.status}</span></div>
                          <div className="text-slate-600 text-sm mt-1">
                            {o.items.map((it, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className="text-slate-700">{it.title}</span>
                                <span className="text-slate-500">฿{it.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-500 text-sm">วันที่: {o.date}</div>
                    </div>
                    <div className="mt-4 border-t pt-3 text-right font-bold">฿{o.items.reduce((s, i) => s + i.price, 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">การแจ้งเตือน</h3>
              <div className="space-y-4">
                <ToggleRow labelTop="แจ้งเตือนทางอีเมล" labelBottom="รับข่าวสารและโปรโมชั่น" defaultChecked />
                <ToggleRow labelTop="แจ้งเตือนทาง SMS" labelBottom="สถานะการจัดส่งสินค้า" />
                <ToggleRow labelTop="Push Notifications" labelBottom="แจ้งเตือนบนแอปพลิเคชัน" defaultChecked />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">ความปลอดภัย</h3>
              <div className="space-y-3">
                <button onClick={handleChangePassword} className="w-full text-left bg-slate-50 rounded-md p-3 hover:bg-slate-100">เปลี่ยนรหัสผ่าน</button>
                <button onClick={handleTwoFactor} className="w-full text-left bg-slate-50 rounded-md p-3 hover:bg-slate-100">การยืนยันตัวตนแบบ 2 ขั้นตอน</button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">วิธีการชำระเงิน</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">บัตรเครดิต / เดบิต</div>
                  <div className="text-sm text-slate-500">จัดการบัตรที่บันทึกไว้</div>
                </div>
                <div>
                  <button onClick={handleManageCards} className="bg-white border border-slate-200 px-3 py-2 rounded-md">จัดการบัตรเครดิต/เดบิต</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ToggleRow({ labelTop, labelBottom, defaultChecked = false }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{labelTop}</div>
        {labelBottom && <div className="text-sm text-slate-500">{labelBottom}</div>}
      </div>
      <div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
          <div className="w-11 h-6 bg-slate-200 peer-checked:bg-teal-600 rounded-full peer-focus:ring-2 peer-focus:ring-teal-300 transition-all"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-all"></div>
        </label>
      </div>
    </div>
  );
}