// ...existing code...
import VYNE from "../assets/VYNE.png";

export default function Footer() {
  return (
    <footer className="mt-10 border-top">
      <div className="max-w-6xl mx-auto px-6 py-8 text-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 font-extrabold text-slate-900 mb-2">
              <img src={VYNE} alt="VYNE Logo" className="h-12 w-12" />
              {/* <span>VYNE</span> */}
            </div>
            <p>แฟชั่นมินิมอลคุณภาพสูง เพื่อการแต่งกายที่สมบูรณ์แบบ</p>
          </div>
          <div>
            <b>ลิงก์ด่วน</b>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>เกี่ยวกับเรา</li>
              <li>ติดต่อเรา</li>
              <li>คู่มือขนาด</li>
              <li>วิธีดูแลเสื้อผ้า</li>
            </ul>
          </div>
          <div>
            <b>บริการลูกค้า</b>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>การจัดส่ง</li>
              <li>การคืนสินค้า</li>
              <li>คำถามที่พบบ่อย</li>
              <li>ศูนย์ช่วยเหลือ</li>
            </ul>
          </div>
          <div>
            <b>ติดต่อเรา</b>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>โทร: 02-xxx-xxxx</li>
              <li>อีเมล: info@vyne.co.th</li>
              <li>จันทร์–ศุกร์ 9:00-18:00</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-slate-500">© 2025 VYNE สงวนลิขสิทธิ์</p>
      </div>
    </footer>
  );
}
// ...existing code...