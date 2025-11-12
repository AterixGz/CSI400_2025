import React, { useEffect, useState } from "react";
import Header from "../component/header";
import { Search, Users, Shield, MoreHorizontal } from "lucide-react";

export default function Members() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const roleMap = { 2: "Staff", 3: "Manager" }; // map role_id → role_name

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await fetch("http://localhost:3000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // เปลี่ยน role
  const changeRole = async (userId, newRoleId) => {
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
        setAdmins((cur) =>
          cur.map((u) => (u.user_id === userId ? data.user : u))
        );
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  // สถิติ
  const totalAdmins = admins.length;
  const totalStaff = admins.filter((u) => u.role_id === 2).length;
  const totalManagers = admins.filter((u) => u.role_id === 3).length;

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
              <div className="text-orange-500 text-sm">↗ +2 this month</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="">Staff</span>
                <Users className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{totalStaff}</div>
              <div className="text-orange-500 text-sm">↗ updated</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="">Managers</span>
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{totalManagers}</div>
              <div className="text-sm">Can manage staff</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="">Avg. Session</span>
                <Users className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-2">4.2h</div>
              <div className="text-orange-500 text-sm">↗ +0.5h</div>
            </div>
          </div>

          {/* Admin Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                      <select
                        value={admin.role_id}
                        onChange={(e) => changeRole(admin.user_id, Number(e.target.value))}
                        className="border border-gray-200 rounded px-2 py-1"
                      >
                        <option value={2}>Staff</option>
                        <option value={3}>Manager</option>
                      </select>
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
