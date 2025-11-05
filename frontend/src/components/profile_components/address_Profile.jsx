import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function IconLocation({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21l-8-8c-2-2-2-5.5 0-7.5s5.5-2 7.5 0L12 6l.5-.5c2-2 5.5-2 7.5 0s2 5.5 0 7.5L12 21z" />
      <circle cx="12" cy="9" r="3" />
    </svg>
  );
}

export default function AddressProfile() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    street: '',
    subdistrict: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Thailand',
    phone: ''
  });

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  // Fetch addresses when component mounts
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('http://localhost:3000/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch addresses');
      
      const data = await response.json();
      setAddresses(data.map(addr => ({
        id: addr.address_id,
        isDefault: addr.is_default,
        name: addr.full_name,
        address: addr.address_line1,
        street: addr.address_line2 || '',
        city: addr.district,
        province: addr.province,
        postalCode: addr.postal_code,
        country: addr.country || 'Thailand',
        phone: addr.phone_number
      })));
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to load addresses');
      toast.error('ไม่สามารถโหลดข้อมูลที่อยู่ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มที่อยู่');
        return;
      }

      console.log('Adding address with token:', token);

      const response = await fetch('http://localhost:3000/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: newAddress.name,
          phone_number: newAddress.phone,
          address_line1: newAddress.address,
          address_line2: newAddress.street || '',
          subdistrict: newAddress.subdistrict || '',
          district: newAddress.city,
          province: newAddress.province || 'Bangkok',
          postal_code: newAddress.postalCode,
          is_default: addresses.length === 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to add address');
      }

      toast.success('เพิ่มที่อยู่เรียบร้อยแล้ว');
      fetchAddresses(); // Refresh the list
      setNewAddress({
        name: '',
        address: '',
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Thailand',
        phone: ''
      });
      setIsAddingNew(false);
    } catch (err) {
      console.error('Error adding address:', err);
      toast.error(err.message || 'ไม่สามารถเพิ่มที่อยู่ได้');
    }
  };

  const handleSetDefault = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('กรุณาเข้าสู่ระบบก่อนแก้ไขที่อยู่');
      return;
    }

    try {
      setSettingDefaultId(id);

      const response = await fetch(`http://localhost:3000/api/addresses/${id}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.details || err.error || 'Failed to set default address');
      }

      // Optimistically update UI: mark selected address as default
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
      toast.success('ตั้งค่าที่อยู่หลักเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error setting default address:', err);
      toast.error(err.message || 'ไม่สามารถตั้งค่าที่อยู่หลักได้');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณต้องการลบที่อยู่นี้ใช่หรือไม่?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนลบที่อยู่');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete address');

      toast.success('ลบที่อยู่เรียบร้อยแล้ว');
      fetchAddresses(); // Refresh the list
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('ไม่สามารถลบที่อยู่ได้');
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Addresses</h2>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800"
          >
            Add New Address
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            คุณยังไม่มีที่อยู่ที่บันทึกไว้
          </div>
        ) : null}

        {isAddingNew && (
          <form onSubmit={handleSubmit} className="mb-8 border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Add New Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddress.name}
                  onChange={e => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={e => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={newAddress.address}
                  onChange={e => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Street</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={e => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subdistrict</label>
                <input
                  type="text"
                  required
                  value={newAddress.subdistrict}
                  onChange={e => setNewAddress(prev => ({ ...prev, subdistrict: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
                <input
                  type="text"
                  required
                  value={newAddress.province}
                  onChange={e => setNewAddress(prev => ({ ...prev, province: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={newAddress.city}
                  onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={newAddress.postalCode}
                  onChange={e => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-slate-100 rounded-md">
                    <IconLocation className="w-4 h-4 text-slate-600" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{addr.address}</div>
                    <div className="text-sm text-slate-600">{addr.street}</div>
                    <div className="text-sm text-slate-600">{`${addr.city} ${addr.postalCode}`}</div>
                    <div className="text-sm text-slate-600">{addr.country}</div>
                    <div className="text-sm text-slate-600 mt-2">{addr.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
                  >
                    Delete
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={settingDefaultId !== null}
                      className={`px-3 py-1.5 text-sm border rounded-md ${settingDefaultId === addr.id ? 'opacity-70 cursor-wait' : 'hover:bg-slate-50'}`}
                    >
                      {settingDefaultId === addr.id ? 'Setting...' : 'Set as Default'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}