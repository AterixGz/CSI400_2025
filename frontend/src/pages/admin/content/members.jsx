import React, { useEffect, useState } from "react";
import Header from "../component/header";
import { Search, Users, Shield, MoreHorizontal } from "lucide-react";

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
        setAdmins((cur) => [...cur, data.user]);
        setNewUser({ first_name: "", last_name: "", email: "", password: "", role_id: 2 });
        setIsModalOpen(false);
      } else {
        alert(data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Failed to create user:", err);
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
        setAdmins((cur) => cur.map((u) => (u.user_id === userId ? data.user : u)));
      }
    } catch (err) {
      console.error("Failed to update role:", err);
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
              <div className="text-orange-500 text-sm">↗ +2 this month</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span>Staff</span>
                <Users className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{totalStaff}</div>
              <div className="text-orange-500 text-sm">↗ updated</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span>Managers</span>
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{totalManagers}</div>
              <div className="text-sm">Can manage staff</div>
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
                  <input type="text" placeholder="First Name" className="border rounded px-2 py-1"
                    value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
                  <input type="text" placeholder="Last Name" className="border rounded px-2 py-1"
                    value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
                  <input type="email" placeholder="Email" className="border rounded px-2 py-1"
                    value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  <input
                    type="password"
                    placeholder="Password"
                    className="border rounded px-2 py-1"
                    value={newUser.password}
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
