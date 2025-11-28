import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  // Popup notification state
  const [popup, setPopup] = useState("");
  const [showingPopup, setShowingPopup] = useState(false);
  const [popupProgress, setPopupProgress] = useState(100);
  const popupDuration = 2000; // ms
  // Show popup and persist to localStorage
  const showPopup = (msg) => {
    setPopup(msg);
    setShowingPopup(true);
    setPopupProgress(100);
    localStorage.setItem("globalPopup", msg);
    window.dispatchEvent(new Event("globalPopup"));
    const interval = 20;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setPopupProgress(Math.max(0, 100 - (elapsed / popupDuration) * 100));
      if (elapsed >= popupDuration) {
        clearInterval(timer);
        setShowingPopup(false);
        localStorage.removeItem("globalPopup");
      }
    }, interval);
  };

  // Listen for global popup event (for route changes)
  useEffect(() => {
    const handler = () => {
      const msg = localStorage.getItem("globalPopup");
      if (msg) {
        setPopup(msg);
        setShowingPopup(true);
        setPopupProgress(100);
        const interval = 20;
        let elapsed = 0;
        const timer = setInterval(() => {
          elapsed += interval;
          setPopupProgress(Math.max(0, 100 - (elapsed / popupDuration) * 100));
          if (elapsed >= popupDuration) {
            clearInterval(timer);
            setShowingPopup(false);
            localStorage.removeItem("globalPopup");
          }
        }, interval);
      }
    };
    window.addEventListener("globalPopup", handler);
    // On mount, check if popup exists
    const msg = localStorage.getItem("globalPopup");
    if (msg) handler();
    return () => window.removeEventListener("globalPopup", handler);
  }, []);
  const [registerData, setRegisterData] = useState({
    username: "",
    lastname: "",
    password: "",
    confirmPassword: "",
    number: "",
    email: "",
    birthdate: "",
    gender: "",
  });
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setRegisterSuccess(false);
    if (!acceptedTerms) {
      setMessage('กรุณายอมรับข้อกำหนดและเงื่อนไขก่อนสมัครสมาชิก');
      return;
    }
    if (!validateEmail(registerData.email)) {
      setMessage("❌ อีเมลต้องเป็น Gmail (@gmail.com)");
      return;
    }
    if (!/^0\d{9}$/.test(registerData.number)) {
      setMessage("❌ เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 10 หลัก");
      return;
    }
    // Validate age minimum 18 years
    if (!validateAge(registerData.birthdate)) {
      setMessage("❌ อายุต้องไม่น้อยกว่า 18 ปี");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setMessage("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }
    try {
      const res = await fetch("https://csi400-2025-1.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegisterSuccess(true);
        showPopup("✅ สมัครสมาชิกสำเร็จ");
        // Save user info to localStorage and redirect to profile page
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token || "");
          window.dispatchEvent(new Event("authChange"));
          setTimeout(() => {
            navigate("/profile");
          }, 800);
        } else {
          setTimeout(() => navigate("/"), 800);
        }
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
    const googleToken = params.get("token");
    if (googleUser) {
      const userObj = JSON.parse(decodeURIComponent(googleUser));
      localStorage.setItem("user", JSON.stringify(userObj));
      if (googleToken) {
        localStorage.setItem("token", googleToken);
      }
      window.dispatchEvent(new Event("authChange"));
      // redirect ไปหน้าโปรไฟล์หรือรีโหลด
      window.location.href = "/profile";
    }
  }, []);
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const validateEmail = (email) => {
    // Email must be gmail.com
    const emailRegex = /^[^\s,;<>]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validateAge = (birthdate) => {
    if (!birthdate) return false;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setMessage("❌ อีเมลต้องเป็น Gmail (@gmail.com)");
      return;
    }
    try {
      const res = await fetch("https://csi400-2025-1.onrender.com/login", {
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
    <>
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
                      <div className="text-sm text-slate-700 mb-1">วันเกิด</div>
                      <input
                        type="date"
                        className="w-full rounded-lg border px-3 py-3 bg-white/80"
                        value={registerData.birthdate}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={e => setRegisterData({ ...registerData, birthdate: e.target.value })}
                      />
                      <p className="text-xs text-slate-500 mt-1 ">ต้องอายุไม่น้อยกว่า 18 ปี</p>
                    </label>
                    <label className="block">
                      <div className="text-sm text-slate-700 mb-1">เพศ</div>
                      <select
                        className="w-full rounded-lg border px-3 py-3 bg-white/80"
                        value={registerData.gender}
                        onChange={e => setRegisterData({ ...registerData, gender: e.target.value })}
                      >
                        <option value="">เลือกเพศ</option>
                        <option value="male">ชาย</option>
                        <option value="female">หญิง</option>
                        <option value="other">อื่นๆ</option>
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-sm text-slate-700 mb-1">อีเมล</div>
                      <input
                        className="w-full rounded-lg border px-3 py-3 bg-white/80"
                        placeholder="example@gmail.com"
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
                      <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
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
                        <button type="submit" disabled={!acceptedTerms} className={`w-full rounded-lg py-3 font-bold ${acceptedTerms ? 'bg-black text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}>สมัครสมาชิก</button>
                        <div className="text-center text-sm text-slate-600">มีบัญชีอยู่แล้ว? <button type="button" onClick={()=>{ setMode("login"); setMessage(""); }} className="text-teal-700 underline">เข้าสู่ระบบ</button></div>
                      </>
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
     {/* Popup notification */}
{showingPopup && (
  <div style={{position: 'fixed', right: 24, bottom: 24, zIndex: 50, transition: 'all 0.3s ease-out', opacity: 1, minWidth: 300, animation: 'slideInUp 0.4s ease-out'}}>
    <style>{`
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
    <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-xl shadow-2xl relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-white opacity-10 blur-xl"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{popup}</p>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: 3, background: 'rgba(255,255,255,0.3)'}}>
        <div style={{
          height: '100%', 
          width: `${popupProgress}%`, 
          background: 'rgba(255,255,255,0.8)', 
          transition: 'width 0.02s linear',
          borderRadius: '0 0 11px 0'
        }} />
      </div>
    </div>
  </div>
)}
    </>
  );
}