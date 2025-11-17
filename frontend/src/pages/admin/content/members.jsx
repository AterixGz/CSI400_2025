import React, { useEffect, useState } from "react";
import Header from "../component/header";
import { Search, Users, Shield, MoreHorizontal } from "lucide-react";
import Swal from 'sweetalert2';

export default function Members() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const roleMap = { 2: "Staff", 3: "Manager" };
  
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_id: 2,
  });

  const createUser = async () => {
  // Validate required fields
  if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please fill in all required fields.',
    });
    return;
  }

  // Validate email ends with @gmail.com
  const emailPattern = /^[^\s@]+@gmail\.com$/;
  if (!emailPattern.test(newUser.email)) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid email',
      text: 'Email must end with @gmail.com!',
    });
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();

    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: 'User created',
        text: 'The new user was successfully added!',
        timer: 2000,
        showConfirmButton: false,
      });
      setAdmins((cur) => [...cur, data.user]);
      setNewUser({ first_name: "", last_name: "", email: "", password: "", role_id: 2 });
      setIsModalOpen(false);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: data.message || "Failed to create user",
      });
    }
  } catch (err) {
    console.error("Failed to create user:", err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong. Please try again.',
    });
  }
};



  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await fetch("http://localhost:3000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAdmins(data.users);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
        setLoading(false);
      }
    }
    fetchAdmins();
  }, [token]);

  const deleteUser = async (userId, roleId) => {
  if (roleId === 3) {
    Swal.fire({
      icon: 'warning',
      title: 'Forbidden',
      text: 'Managers cannot be deleted.',
    });
    return;
  }

  const confirm = await Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'This user will be permanently deleted.',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The user has been removed.',
        timer: 2000,
        showConfirmButton: false,
      });
      setAdmins(current => current.filter(u => u.user_id !== userId));
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message,
      });
    }
  } catch (err) {
    console.error("Failed to delete user:", err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong while deleting.',
    });
  }
};

 const changeRole = async (userId, newRoleId, userName) => {
  const newRoleName = newRoleId === 2 ? "Staff" : "Manager";

  // ถ้ามี Manager ครบ 3 คน และพยายามเปลี่ยนเป็น Manager ให้เตือนและ return
  if (newRoleId === 3 && totalManagers >= 3 && !admins.find(u => u.user_id === userId).role_id === 3) {
    Swal.fire({
      icon: 'warning',
      title: 'Limit reached',
      text: 'ไม่สามารถเพิ่ม Manager ได้อีก เพราะมีครบ 3 คนแล้ว',
    });
    return;
  }

  // Confirm + input key
 const { value: keyInput } = await Swal.fire({
    title: `ยืนยันการเปลี่ยนตำแหน่ง`,
    html: `คุณต้องการเปลี่ยน <b>${userName}</b> เป็น <b>${newRoleName}</b> จริงหรือไม่?<br><br>
           กรอกรหัสยืนยันเพื่อดำเนินการ:`,
    input: 'text',
    inputPlaceholder: 'Enter admin key',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
  });

  if (!keyInput) return; // ถ้าไม่กรอกก็ไม่ทำอะไร

  // เช็ค key
  const ADMIN_KEY = "ADMIN"; // เปลี่ยนเป็น key จริงของคุณ
  if (keyInput !== ADMIN_KEY) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid key',
      text: 'รหัสยืนยันไม่ถูกต้อง',
    });
    return;
  }

  // ถ้า key ถูกต้อง ให้เรียก API เปลี่ยน role
  try {
    const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role_id: newRoleId }),
    });
    const data = await res.json();
    if (data.success) {
      setAdmins((cur) => cur.map((u) => (u.user_id === userId ? data.user : u)));
      Swal.fire({
        icon: 'success',
        title: 'Role updated',
        text: `${userName} ถูกเปลี่ยนเป็น ${newRoleName} แล้ว`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  } catch (err) {
    console.error("Failed to update role:", err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'เกิดข้อผิดพลาดในการเปลี่ยนตำแหน่ง',
    });
  }
};


  if (loading) return <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
  </div>;

  const totalAdmins = admins.length;
  const totalStaff = admins.filter((u) =>Number(u.role_id) === 2 ).length;
  const totalManagers = admins.filter((u) =>Number(u.role_id) === 3 ).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Management</h1>
            <p className="text-gray-600">จัดการผู้ดูแลระบบและพนักงานของคุณ</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg p-6 rounded-2xl text-white transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-100 font-medium">Total Admins</span>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">{totalAdmins}</div>
              <div className="text-blue-100 text-sm">ผู้ดูแลระบบทั้งหมด</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg p-6 rounded-2xl text-white transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-orange-100 font-medium">Staff</span>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">{totalStaff}</div>
              <div className="text-orange-100 text-sm">จำนวนพนักงาน</div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 shadow-lg p-6 rounded-2xl text-white transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-yellow-50 font-medium">Managers</span>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">{totalManagers}/3</div>
              <div className="text-yellow-50 text-sm">จำนวนผู้จัดการสูงสุด 3 คน</div>
            </div>
          </div>

          {/* Create Button */}
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg font-medium transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mb-6"
            onClick={() => setIsModalOpen(true)}
          >
            <Users className="h-5 w-5" />
            Create Staff / Manager
          </button>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Create Staff / Manager
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={newUser.first_name}
                      required
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={newUser.last_name}
                      required
                      onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={newUser.email}
                      required
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={newUser.password}
                      required
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={newUser.role_id}
                      onChange={(e) => setNewUser({ ...newUser, role_id: Number(e.target.value) })}
                    >
                      <option value={2}>Staff</option>
                      <option value={3} disabled={totalManagers >= 3}>Manager (Limit: 3)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg transition-all duration-200"
                    onClick={createUser}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Admin List</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((admin) => {
                    const firstName = admin.first_name || '';
                    const lastName = admin.last_name || '';
                    const initials = (firstName[0] || '') + (lastName[0] || '');
                    
                    return (
                    <tr key={admin.user_id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {admin.profile_image_url ? (
                            <img 
                              src={admin.profile_image_url} 
                              alt={`${firstName} ${lastName}`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                              {initials || '?'}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{firstName} {lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          admin.role_id === 3 
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border border-red-800 shadow-md' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {admin.role_id === 3 ? <Shield className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                          {admin.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Change Role */}
                          <select
                            value={admin.role_id}
                            onChange={(e) =>
                              changeRole(
                                admin.user_id,
                                Number(e.target.value),
                                `${admin.first_name} ${admin.last_name}`
                              )
                            }
                            className="border border-gray-300 rounded-lg px-3 py-2 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          >
                            <option value={2}>Staff</option>
                            <option
                              value={3}
                              disabled={totalManagers >= 3 && admin.role_id !== 3}
                            >
                              Manager
                            </option>
                          </select>

                          {/* Delete Button: แสดงเฉพาะ Staff */}
                          {Number(admin.role_id) === 2 && (
                            <button
                              className="text-red-600 hover:text-white hover:bg-red-600 px-4 py-2 border border-red-600 rounded-lg transition-all duration-200 text-sm font-medium"
                              onClick={() => deleteUser(admin.user_id, admin.role_id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}