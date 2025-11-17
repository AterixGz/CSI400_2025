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


  if (loading) return <div>Loading...</div>;

  const totalAdmins = admins.length;
  const totalStaff = admins.filter((u) =>Number(u.role_id) === 2 ).length;
  const totalManagers = admins.filter((u) =>Number(u.role_id) === 3 ).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Management</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-black">Total Admins</span>
                <Users className="h-6 w-6 text-black" />
              </div>
              <div className="text-4xl font-bold mb-2">{totalAdmins}</div>
             
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span>Staff</span>
                <Users className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{totalStaff}</div>
              <div className="text-orange-500 text-sm">จำนวนพนักงาน</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span>Managers</span>
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{totalManagers}</div>
              <div className="text-orange-500 text-sm">จำนวนผู้จัดการศูงสุด 3 คน</div>
            </div>
          </div>

          {/* Create Button */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
            onClick={() => setIsModalOpen(true)}
          >
            + Create Staff
          </button>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Create Staff / Manager</h2>
                <div className="grid grid-cols-1 gap-2">
                  <input
                      type="text"
                      placeholder="First Name"
                      className="border rounded px-2 py-1"
                      value={newUser.first_name}
                      required
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    />
                  <input type="text" placeholder="Last Name" className="border rounded px-2 py-1"
                    value={newUser.last_name} required onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
                  <input
                    type="email"
                    placeholder="Email"
                    className="border rounded px-2 py-1"
                    value={newUser.email}
                    required
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="border rounded px-2 py-1"
                    value={newUser.password}
                    required
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <select
                    className="border rounded px-2 py-1"
                    value={newUser.role_id}
                    onChange={(e) => setNewUser({ ...newUser, role_id: Number(e.target.value) })}
                  >
                    <option value={2}>Staff</option>
                    <option value={3} disabled={totalManagers >= 3}>Manager (Limit: 3)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={createUser}>Create</button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4">Name</th>
                  <th className="text-left px-6 py-4">Email</th>
                  <th className="text-left px-6 py-4">Role</th>
                  <th className="text-left px-6 py-4">Actions</th>
                  
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{admin.first_name} {admin.last_name}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">{admin.role_name}</td>
                    <td className="px-6 py-4">

  <div className="flex items-center gap-2">

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
      className="border border-gray-300 rounded px-2 py-1 hover:border-blue-500"
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
        className="text-red-600 ml-10 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition duration-300 ease-in-out"
        onClick={() => deleteUser(admin.user_id, admin.role_id)}
      >
        Delete
      </button>
    )}
  </div>
</td>

                  </tr>

                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
