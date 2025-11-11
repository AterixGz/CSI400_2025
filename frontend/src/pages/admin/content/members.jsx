import React, { useEffect, useState } from "react";
import Header from "../component/header";
import { Search, Users, Shield, MoreHorizontal } from "lucide-react";

export default function Members() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token"); // สมมติคุณเก็บ token ไว้ที่ localStorage

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

  // ฟังก์ชันเปลี่ยน role
  const changeRole = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Management</h1>

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
                    <td className="px-6 py-4">
                      {admin.first_name} {admin.last_name}
                    </td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">{admin.role}</td>
                    <td className="px-6 py-4">
                      <select
                        value={admin.role}
                        onChange={(e) => changeRole(admin.user_id, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1"
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                   
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
