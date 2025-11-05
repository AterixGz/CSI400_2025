
import { useEffect, useState } from 'react';
import { getToken } from '../../utils/api';

export default function AddressCart({ selectedAddress, setSelectedAddress }) {
	const [addresses, setAddresses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const token = getToken();

	useEffect(() => {
		async function fetchAddresses() {
			setLoading(true);
			setError(null);
			if (!token) {
				setError('กรุณาเข้าสู่ระบบเพื่อเลือกที่อยู่จัดส่ง');
				setLoading(false);
				return;
			}
			try {
				const res = await fetch('http://localhost:3000/api/addresses', {
					headers: { 'Authorization': `Bearer ${token}` }
				});
				if (!res.ok) throw new Error('Failed to fetch addresses');
				const data = await res.json();
				setAddresses(data);
				// Auto-select default address if not selected
				if (!selectedAddress && data.length > 0) {
					const def = data.find(a => a.is_default) || data[0];
					setSelectedAddress(def);
				}
			} catch (err) {
				setError('ไม่สามารถโหลดข้อมูลที่อยู่ได้');
			} finally {
				setLoading(false);
			}
		}
		fetchAddresses();
		// eslint-disable-next-line
	}, [token]);

	const [isEditing, setIsEditing] = useState(false);

	const handleEditClick = () => {
		setIsEditing(true);
	};

	const handleSelectAddress = (addr) => {
		setSelectedAddress(addr);
		setIsEditing(false);
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-bold text-lg">ที่อยู่จัดส่ง</h3>
				{selectedAddress && !isEditing && (
					<button
						onClick={handleEditClick}
						className="text-sm text-emerald-600 hover:text-emerald-700"
					>
						เปลี่ยนที่อยู่
					</button>
				)}
			</div>

			{loading ? (
				<div className="text-slate-500">กำลังโหลดที่อยู่...</div>
			) : error ? (
				<div className="text-red-600 text-sm">{error}</div>
			) : addresses.length === 0 ? (
				<div className="text-slate-500">คุณยังไม่มีที่อยู่ กรุณาเพิ่มที่อยู่ในหน้าโปรไฟล์</div>
			) : isEditing ? (
				<div className="space-y-3">
					{addresses.map(addr => (
						<div
							key={addr.address_id}
							onClick={() => handleSelectAddress(addr)}
							className={`flex items-start p-3 border rounded-lg cursor-pointer hover:border-emerald-600 hover:bg-emerald-50 ${
								selectedAddress?.address_id === addr.address_id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'
							}`}
						>
							<div className="flex-1">
								<div className="font-medium">
									{addr.full_name} {addr.is_default && (
										<span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ml-2">
											Default
										</span>
									)}
								</div>
								<div className="text-sm text-slate-600">{addr.address_line1} {addr.address_line2}</div>
								<div className="text-sm text-slate-600">{addr.subdistrict} {addr.district} {addr.province} {addr.postal_code}</div>
								<div className="text-sm text-slate-600">{addr.country || 'Thailand'}</div>
								<div className="text-sm text-slate-600 mt-1">{addr.phone_number}</div>
							</div>
						</div>
					))}
				</div>
			) : selectedAddress ? (
				<div className="border rounded-lg p-3">
					<div className="font-medium">
						{selectedAddress.full_name} {selectedAddress.is_default && (
							<span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ml-2">
								Default
							</span>
						)}
					</div>
					<div className="text-sm text-slate-600">{selectedAddress.address_line1} {selectedAddress.address_line2}</div>
					<div className="text-sm text-slate-600">{selectedAddress.subdistrict} {selectedAddress.district} {selectedAddress.province} {selectedAddress.postal_code}</div>
					<div className="text-sm text-slate-600">{selectedAddress.country || 'Thailand'}</div>
					<div className="text-sm text-slate-600 mt-1">{selectedAddress.phone_number}</div>
				</div>
			) : (
				<button
					onClick={handleEditClick}
					className="w-full p-3 border rounded-lg text-center text-emerald-600 hover:bg-emerald-50"
				>
					+ เลือกที่อยู่จัดส่ง
				</button>
			)}
		</div>
	);
}
