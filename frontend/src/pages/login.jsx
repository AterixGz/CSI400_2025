import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const navigate = useNavigate();

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl">
        <div className="bg-white/80 rounded-2xl shadow-xl p-8" style={{background: "rgba(255, 255, 255)"}}>
          <h2 className="text-2xl text-center font-extrabold text-slate-800">{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h2>
          <p className="text-center text-slate-600 mt-2">{mode === 'login' ? 'เข้าสู่บัญชีของคุณเพื่อเริ่มช้อปปิ้ง' : 'สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้งกับเรา'}</p>

          {mode === 'register' ? (
            <form className="mt-6 space-y-4" onSubmit={(e)=>{e.preventDefault(); navigate('/');}}>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm text-slate-700 mb-1">ชื่อ</div>
                  <input className="w-full rounded-lg border px-3 py-3 bg-white/80" placeholder="ชื่อ" />
                </label>
                <label className="block">
                  <div className="text-sm text-slate-700 mb-1">นามสกุล</div>
                  <input className="w-full rounded-lg border px-3 py-3 bg-white/80" placeholder="นามสกุล" />
                </label>
              </div>

              <label className="block">
                <div className="text-sm text-slate-700 mb-1">อีเมล</div>
                <input className="w-full rounded-lg border px-3 py-3 bg-white/80" placeholder="กรอกอีเมลของคุณ" />
              </label>

              <label className="block">
                <div className="text-sm text-slate-700 mb-1">เบอร์โทรศัพท์</div>
                <input className="w-full rounded-lg border px-3 py-3 bg-white/80" placeholder="0XX-XXX-XXXX" />
              </label>

              <label className="block">
                <div className="text-sm text-slate-700 mb-1">รหัสผ่าน</div>
                <input type="password" className="w-full rounded-lg border px-3 py-3 bg-white/80" placeholder="สร้างรหัสผ่าน" />
              </label>

              <label className="block">
                <div className="text-sm text-slate-700 mb-1">ยืนยันรหัสผ่าน</div>
                <input type="password" className="w-full rounded-lg border px-3 py-3 bg-white/80" placeholder="ยืนยันรหัสผ่าน" />
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" />
                <span className="text-slate-600">ฉันยอมรับ <a className="text-teal-700 underline">ข้อกำหนดและเงื่อนไข</a> และ <a className="text-teal-700 underline">นโยบายความเป็นส่วนตัว</a></span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" />
                <span className="text-slate-600">รับข่าวสารและโปรโมชั่นพิเศษทางอีเมล</span>
              </label>

              <button type="submit" className="w-full bg-black text-white rounded-lg py-3 font-bold">สมัครสมาชิก</button>

              <div className="text-center text-sm text-slate-600">มีบัญชีอยู่แล้ว? <button type="button" onClick={()=>setMode('login')} className="text-teal-700 underline">เข้าสู่ระบบ</button></div>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={(e)=>{e.preventDefault(); navigate('/');}}>
              <label className="block">
                <div className="text-sm text-slate-700 mb-1">อีเมล</div>
                <input className="w-full rounded-lg border px-3 py-3 bg-white/80" placeholder="กรอกอีเมลของคุณ" />
              </label>

              <label className="block">
                <div className="text-sm text-slate-700 mb-1">รหัสผ่าน</div>
                <input type="password" className="w-full rounded-lg border px-3 py-3 bg-white/80" placeholder="กรอกรหัสผ่านของคุณ" />
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600"><input type="checkbox"/> จดจำการเข้าสู่ระบบ</label>
                <Link to="#" className="text-teal-700 underline">ลืมรหัสผ่าน?</Link>
              </div>
            
              <button type="submit" className="w-full bg-black text-white rounded-lg py-3 font-bold">เข้าสู่ระบบ</button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <div className="text-sm text-slate-500">หรือ</div>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button type="button" className="w-full border rounded-lg py-3 flex items-center justify-center gap-3"><span className="w-5 h-5 bg-white rounded-full grid place-items-center">G</span> เข้าสู่ระบบด้วย Google</button>
              <button type="button" className="w-full border rounded-lg py-3 flex items-center justify-center gap-3"><span className="w-5 h-5 bg-white rounded-full grid place-items-center">f</span> เข้าสู่ระบบด้วย Facebook</button>

              <div className="text-center text-sm text-slate-600">ยังไม่มีบัญชี? <button type="button" onClick={()=>setMode('register')} className="text-teal-700 underline">สมัครสมาชิก</button></div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
