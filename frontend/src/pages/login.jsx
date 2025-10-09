import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [registerData, setRegisterData] = useState({
    username: "",
    lastname: "",
    password: "",
    confirmPassword: "",
    number: "",
    email: "",
  });
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setRegisterSuccess(false);
    if (registerData.password !== registerData.confirmPassword) {
      setMessage("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegisterSuccess(true);
        setMessage("✅ สมัครสมาชิกสำเร็จ");
        setTimeout(() => navigate("/"), 800);
      } else {
        setMessage("❌ " + (data.message || "สมัครสมาชิกไม่สำเร็จ"));
      }
    } catch (err) {
      setMessage("⚠️ " + err.message);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setLoggedIn(true);
      setUser(JSON.parse(userData));
      return;
    }
    // กรณี login ด้วย google
    const params = new URLSearchParams(window.location.search);
    const googleUser = params.get("googleUser");
    if (googleUser) {
      const userObj = JSON.parse(decodeURIComponent(googleUser));
      setLoggedIn(true);
      setUser({ username: userObj.displayName || userObj.email, role: "google" });
      localStorage.setItem("user", JSON.stringify({ username: userObj.displayName || userObj.email, role: "google" }));
      localStorage.setItem("token", "google-oauth");
      window.history.replaceState({}, document.title, window.location.pathname); // ลบ query string
      navigate("/profile");
    }
  }, []);
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("");
        setLoggedIn(true);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChange"));
        navigate("/profile");
      } else {
        setMessage("❌ " + (data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"));
      }
    } catch (err) {
      setMessage("⚠️ " + err.message);
    }
  };

  
  return (
    <section className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl">
        <div
          className="bg-white/80 rounded-2xl shadow-xl p-8"
          style={{ background: "rgba(255, 255, 255)" }}
        >
          {loggedIn ? (
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-green-700 mb-4">
                เข้าสู่ระบบแล้วจ้า
              </h2>
              <div className="mb-4">
                สวัสดีคุณ <span className="font-bold">{user?.username}</span> (
                {user?.role})
              </div>
              <button
                className="bg-red-600 text-white rounded-lg py-2 px-6 font-bold"
                onClick={() => {
                  setLoggedIn(false);
                  setUser(null);
                  setEmail("");
                  setPassword("");
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.dispatchEvent(new Event("authChange"));
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl text-center font-extrabold text-slate-800">
                {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </h2>
              <p className="text-center text-slate-600 mt-2">
                {mode === "login"
                  ? "เข้าสู่บัญชีของคุณเพื่อเริ่มช้อปปิ้ง"
                  : "สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้งกับเรา"}
              </p>
              {mode === "register" ? (
                <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <div className="text-sm text-slate-700 mb-1">ชื่อ</div>
                      <input
                        className="w-full rounded-lg border px-3 py-3 bg-white/80"
                        placeholder="ชื่อ"
                        value={registerData.username}
                        onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <div className="text-sm text-slate-700 mb-1">นามสกุล</div>
                      <input
                        className="w-full rounded-lg border px-3 py-3 bg-white/80"
                        placeholder="นามสกุล"
                        value={registerData.lastname}
                        onChange={e => setRegisterData({ ...registerData, lastname: e.target.value })}
                      />
                    </label>
                  </div>
                  <label className="block">
                    <div className="text-sm text-slate-700 mb-1">อีเมล</div>
                    <input
                      className="w-full rounded-lg border px-3 py-3 bg-white/80"
                      placeholder="กรอกอีเมลของคุณ"
                      value={registerData.email}
                      onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <div className="text-sm text-slate-700 mb-1">เบอร์โทรศัพท์</div>
                    <input
                      type="tel"
                      className="w-full rounded-lg border px-3 py-3 bg-white/80"
                      placeholder="0XX-XXX-XXXX"
                      value={registerData.number}
                      maxLength={10}
                      pattern="\d{10}"
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, "");
                        setRegisterData({ ...registerData, number: value });
                      }}
                    />
                  </label>
                  <label className="block">
                    <div className="text-sm text-slate-700 mb-1">รหัสผ่าน</div>
                    <input
                      type="password"
                      className="w-full rounded-lg border px-3 py-3 bg-white/80"
                      placeholder="สร้างรหัสผ่าน"
                      value={registerData.password}
                      onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <div className="text-sm text-slate-700 mb-1">ยืนยันรหัสผ่าน</div>
                    <input
                      type="password"
                      className="w-full rounded-lg border px-3 py-3 bg-white/80"
                      placeholder="ยืนยันรหัสผ่าน"
                      value={registerData.confirmPassword}
                      onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" />
                    <span className="text-slate-600">ฉันยอมรับ <a className="text-teal-700 underline">ข้อกำหนดและเงื่อนไข</a> และ <a className="text-teal-700 underline">นโยบายความเป็นส่วนตัว</a></span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" />
                    <span className="text-slate-600">รับข่าวสารและโปรโมชั่นพิเศษทางอีเมล</span>
                  </label>
                  {message && (
                    <div className="text-center text-red-600 text-sm mb-2">{message}</div>
                  )}
                  {!registerSuccess && (
                    <>
                      <button type="submit" className="w-full bg-black text-white rounded-lg py-3 font-bold">สมัครสมาชิก</button>
                      <div className="text-center text-sm text-slate-600">มีบัญชีอยู่แล้ว? <button type="button" onClick={()=>{ setMode("login"); setMessage(""); }} className="text-teal-700 underline">เข้าสู่ระบบ</button></div>
                    </>
                  )}
                  {registerSuccess && (
                    <div className="text-center mt-4">
                      <button type="button" className="bg-green-600 text-white rounded-lg px-6 py-2 font-bold" onClick={() => { setMode("login"); setMessage(""); setRegisterSuccess(false); }}>ไปหน้าเข้าสู่ระบบ</button>
                    </div>
                  )}
                </form>
              ) : (
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  <label className="block">
                    <div className="text-sm text-slate-700 mb-1">
                      อีเมล
                    </div>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border px-3 py-3 bg-white/80"
                      placeholder="กรอกอีเมลของคุณ"
                      type="email"
                    />
                  </label>
                  <label className="block">
                    <div className="text-sm text-slate-700 mb-1">รหัสผ่าน</div>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="w-full rounded-lg border px-3 py-3 bg-white/80"
                      placeholder="กรอกรหัสผ่านของคุณ"
                    />
                  </label>
                  {message && (
                    <div className="text-center text-red-600 text-sm mb-2">
                      {message}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2 text-slate-600">
                      <input type="checkbox" /> จดจำการเข้าสู่ระบบ
                    </label>
                    <Link to="#" className="text-teal-700 underline">
                      ลืมรหัสผ่าน?
                    </Link>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white rounded-lg py-3 font-bold"
                  >
                    เข้าสู่ระบบ
                  </button>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <div className="text-sm text-slate-500">หรือ</div>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <button
                    type="button"
                    className="w-full border rounded-lg py-3 flex items-center justify-center gap-3"
                    onClick={() => {
                      window.location.href =
                        "http://localhost:3000/auth/google";
                    }}
                  >
                    <span className="w-5 h-5 bg-white rounded-full grid place-items-center">
                      G
                    </span>{" "}
                    เข้าสู่ระบบด้วย Google
                  </button>
                  <button
                    type="button"
                    className="w-full border rounded-lg py-3 flex items-center justify-center gap-3"
                  >
                    <span className="w-5 h-5 bg-white rounded-full grid place-items-center">
                      f
                    </span>{" "}
                    เข้าสู่ระบบด้วย Facebook
                  </button>
                  <div className="text-center text-sm text-slate-600">
                    ยังไม่มีบัญชี?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setRegisterData({
                          username: "",
                          lastname: "",
                          password: "",
                          confirmPassword: "",
                          number: "",
                          email: "",
                        });
                        setMessage("");
                      }}
                      className="text-teal-700 underline"
                    >
                      สมัครสมาชิก
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}