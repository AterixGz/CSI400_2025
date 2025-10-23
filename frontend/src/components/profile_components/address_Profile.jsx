import { useState } from 'react';

function IconLocation({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21l-8-8c-2-2-2-5.5 0-7.5s5.5-2 7.5 0L12 6l.5-.5c2-2 5.5-2 7.5 0s2 5.5 0 7.5L12 21z" />
      <circle cx="12" cy="9" r="3" />
    </svg>
  );
}

export default function AddressProfile() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      isDefault: true,
      name: "Nemo V.",
      address: "Room 1201, SPU Residence",
      street: "Phahonyothin Rd.",
      city: "Bangkok",
      postalCode: "10900",
      country: "Thailand",
      phone: "+66 81 234 5678"
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Thailand',
    phone: ''
  });

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAddresses(prev => [...prev, {
      id: Date.now(),
      isDefault: addresses.length === 0,
      ...newAddress
    }]);
    setNewAddress({
      name: '',
      address: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Thailand',
      phone: ''
    });
    setIsAddingNew(false);
  };

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleDelete = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
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
                      className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
                    >
                      Set as Default
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