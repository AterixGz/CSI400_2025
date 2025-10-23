import { useState, useEffect } from 'react';

export default function AccountDetailsProfile({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone_number: user.phone_number || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Account Details</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-md text-slate-900 bg-slate-50"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}