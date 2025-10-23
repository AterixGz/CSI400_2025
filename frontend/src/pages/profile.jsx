import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderProfile from "../components/profile_components/order_Profile";
import MenuProfile from "../components/profile_components/menu_Profile";
import ProfileProfile from "../components/profile_components/profile_Profile";
import AccountDetailsProfile from "../components/profile_components/accountDetails_Profile";
import AddressProfile from "../components/profile_components/address_Profile";
import PaymentProfile from "../components/profile_components/payment_Profile";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profilePreview, setProfilePreview] = useState(null);
  const [hasUserData, setHasUserData] = useState(false);
  const [activeView, setActiveView] = useState('orders'); // เพิ่ม state นี้

  const [user, setUser] = useState({
    name: "Sarah Anderson",
    email: "sarah.anderson@email.com",
    memberSince: "March 2024",
    avatar: null,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUser((prev) => ({
          ...prev,
          name: (u.first_name || u.name || "Sarah Anderson") + (u.last_name ? " " + u.last_name : ""),
          email: u.email || u.email_address || prev.email,
          memberSince: u.memberSince || prev.memberSince,
          avatar: u.profile_image_url || prev.avatar,
        }));
        if (u.profile_image_url) setProfilePreview(u.profile_image_url);
        setHasUserData(true);
      } else {
        setHasUserData(false);
      }
    } catch (e) {
      setHasUserData(false);
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (e) {}
    navigate("/login");
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      console.log('Updating profile:', updatedData);
      setUser(prev => ({
        ...prev,
        ...updatedData
      }));
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!hasUserData) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center py-10 bg-white rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">ไม่สามารถดูข้อมูลได้</h2>
          <p className="text-slate-600 mb-6">คุณไม่มีข้อมูลอยู่ในระบบ</p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3">
          <ProfileProfile 
            user={user}
            profilePreview={profilePreview}
            onUpload={handleFileUpload}
          />
          <MenuProfile 
            onLogout={handleLogout}
            activeView={activeView}
            onChangeView={setActiveView}
          />
        </aside>

        <div className="col-span-12 lg:col-span-9">
          {activeView === 'orders' && <OrderProfile />}
          {activeView === 'account' && (
            <AccountDetailsProfile 
              user={user}
              onUpdate={handleUpdateProfile}
            />
          )}
          {activeView === 'addresses' && <AddressProfile />}
          {activeView === 'payment' && <PaymentProfile />}
        </div>
      </div>
    </section>
  );
}