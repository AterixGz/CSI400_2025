import React, { useState, useEffect, useCallback } from "react";
import Header from "../component/header";
import { getToken } from "../../../utils/api";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// Add keyframes for slide animation
const styles = document.createElement('style');
styles.textContent = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styles);
const SHIPPING_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  PAID: "paid"
};

const statusClass = {
  [SHIPPING_STATUS.PENDING]: "bg-slate-100 text-slate-700",
  [SHIPPING_STATUS.PROCESSING]: "bg-blue-100 text-blue-700",
  [SHIPPING_STATUS.SHIPPED]: "bg-indigo-100 text-indigo-700",
  [SHIPPING_STATUS.DELIVERED]: "bg-emerald-100 text-emerald-700",
  [SHIPPING_STATUS.CANCELLED]: "bg-red-100 text-red-700",
  [SHIPPING_STATUS.PAID]: "bg-green-100 text-green-700"
};

function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-4">
        <p className="text-slate-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}


function OrderDetails({ items = [], address, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="px-4 py-6 bg-slate-50/80 border-t border-b border-slate-100 text-center text-slate-500">
        <div className="animate-pulse">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 bg-red-50/80 border-t border-b border-red-100 text-center text-red-600">
        <div>{error}</div>
      </div>
    );
  }

  if (!items.length && !address) {
    return (
      <div className="px-4 py-6 bg-slate-50/80 border-t border-b border-slate-100 text-center text-slate-500">
        ไม่พบข้อมูลรายละเอียดคำสั่งซื้อ
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-slate-50/80 border-t border-b border-slate-100">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-sm text-slate-900 mb-2">สินค้าในคำสั่งซื้อ</h4>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">{item.name}</div>
                  <div className="text-xs text-slate-500">
                    {item.size && `ขนาด: ${item.size} • `}
                    จำนวน: {item.quantity} • ราคา: ฿{item.price.toLocaleString('th-TH')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {address && (
          <div>
            <h4 className="font-medium text-sm text-slate-900 mb-2">ที่อยู่จัดส่ง</h4>
            <div className="bg-white p-3 rounded-lg text-sm">
              <div className="font-medium">{address.full_name}</div>
              <div className="text-slate-600 mt-1 text-xs space-y-1">
                <p>{address.phone_number}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {[
                    address.subdistrict,
                    address.district,
                    address.province,
                    address.postal_code
                  ].filter(Boolean).join(' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusClass[value]}`}
    >
      {value}
    </span>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/5"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {Object.values(SHIPPING_STATUS).map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [detailErrors, setDetailErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Debounce search term to avoid too many re-renders
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Handle page unload/navigation when there are unsaved changes
  useEffect(() => {
    const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;
    
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return ''; // Required for other browsers
      }
    };

    // Handle browser back/forward buttons
    const handlePopState = (e) => {
      if (hasUnsavedChanges) {
        // Prevent navigation
        e.preventDefault();
        // Stay on current page
        window.history.pushState(null, '', window.location.href);
        // Show confirmation
        setShowSaveDialog(true);
      }
    };

    // Handle all clicks to intercept navigation
    const handleClick = (e) => {
      if (!hasUnsavedChanges) return;

      // Check if click was on a link or button that navigates
      const link = e.target.closest('a[href]');
      if (link) {
        // Don't intercept external links or new tab links
        if (link.target === '_blank' || link.origin !== window.location.origin) {
          return;
        }

        e.preventDefault();
        setPendingNavigation(link.href);
        setShowSaveDialog(true);
      }
    };

    // Handle navigation before it happens
    const handleNavigation = () => {
      if (hasUnsavedChanges) {
        window.history.pushState(null, '', window.location.href);
        setShowSaveDialog(true);
        return false;
      }
      return true;
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick);
    window.navigation?.addEventListener('navigate', handleNavigation);

    // Push initial state to enable popstate handling
    window.history.pushState(null, '', window.location.href);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
      window.navigation?.removeEventListener('navigate', handleNavigation);
    };
  }, [pendingChanges]);

  // Filter orders based on search term and status
  const filterOrders = useCallback((orders, searchTerm, status) => {
    return orders.filter(order => {
      // Status filter
      if (status !== 'all' && order.shippingStatus.toLowerCase() !== status.toLowerCase()) {
        return false;
      }

      // Search filter (case insensitive)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.code.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.customerEmail.toLowerCase().includes(searchLower) ||
          (order.tracking && order.tracking.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, []);

  // Apply filters whenever orders, search term or status changes
  useEffect(() => {
    const filtered = filterOrders(orders, debouncedSearchTerm, statusFilter);
    setFilteredOrders(filtered);
  }, [orders, debouncedSearchTerm, statusFilter, filterOrders]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Transform the data to include empty arrays for items and address
        // The backend will be updated to include this data
        const ordersWithDetails = data.orders.map(order => ({
          ...order,
          items: order.items || [],
          address: order.address || null
        }));
        setOrders(ordersWithDetails);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch {
      setError('Network error when fetching orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, shouldSave = true) => {
    if (!shouldSave) {
      setPendingChanges({
        ...pendingChanges,
        [orderId]: newStatus
      });
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state only after successful API call
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, shippingStatus: newStatus } : order
        ));
        // remove pending change for this order (if any)
        setPendingChanges(prev => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update order status');
        return false;
      }
    } catch {
      setError('Network error when updating order');
      return false;
    }
  };

  const handleSaveChanges = async (orderId) => {
    const newStatus = pendingChanges[orderId];
    if (!newStatus) return;

    // Final confirmation popup before sending update
    const confirmed = window.confirm('ยืนยันการบันทึกการเปลี่ยนแปลงสถานะคำสั่งซื้อใช่หรือไม่?');
    if (!confirmed) return;

    const success = await handleUpdateStatus(orderId, newStatus);
    if (!success) {
      // Optionally keep the pending change so user can retry
      return;
    }
  };

  const handleDiscardChanges = (orderId) => {
    setPendingChanges(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  };

  const fetchOrderDetails = async (orderId) => {
    setLoadingDetails(prev => ({ ...prev, [orderId]: true }));
    setDetailErrors(prev => ({ ...prev, [orderId]: null }));
    
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrderDetails(prev => ({
          ...prev,
          [orderId]: data
        }));
      } else {
        setDetailErrors(prev => ({
          ...prev,
          [orderId]: data.error || 'Failed to fetch order details'
        }));
      }
    } catch (err) {
      setDetailErrors(prev => ({
        ...prev,
        [orderId]: 'Network error when fetching order details'
      }));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleToggleDetails = async (orderId) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
        // Only fetch if we don't have the details yet
        if (!orderDetails[orderId] && !loadingDetails[orderId]) {
          fetchOrderDetails(orderId);
        }
      }
      return next;
    });
  };

  return (
    <>
      <Header />
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
            <p className="text-sm text-slate-500">
              Orders management and fulfillment.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                placeholder="ค้นหาเลขออเดอร์, ชื่อลูกค้า, tracking..."
                className="w-64 px-3 py-2 pl-9 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">สถานะทั้งหมด</option>
              {Object.values(SHIPPING_STATUS).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden m-6">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">กำลังโหลดข้อมูล...</div>
          ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Shipping status</th>
                <th className="px-4 py-3 text-left">Tracking</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <>
                  <tr
                    key={o.id}
                    className="border-t border-slate-50 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">#{o.code}</div>
                      <div className="text-xs text-slate-400">{o.createdAt}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{o.customerName}</div>
                      <div className="text-xs text-slate-400">
                        {o.customerEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ฿{o.total.toLocaleString("th-TH")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                          <StatusBadge value={pendingChanges[o.id] || o.shippingStatus} />
                        <StatusSelect
                            value={pendingChanges[o.id] || o.shippingStatus}
                            onChange={(status) => handleUpdateStatus(o.id, status, false)}
                        />
                          {pendingChanges[o.id] && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSaveChanges(o.id)}
                                className="text-xs px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => handleDiscardChanges(o.id)}
                                className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Discard
                              </button>
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {o.tracking || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleToggleDetails(o.id)}
                        className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100"
                      >
                        {expandedOrders.has(o.id) ? "ปิด" : "ดู"}
                      </button>
                    </td>
                  </tr>
                  {expandedOrders.has(o.id) && (
                    <tr>
                      <td colSpan={7} className="animate-[slideDown_0.2s_ease-out]">
                        <OrderDetails 
                          items={orderDetails[o.id]?.items || []}
                          address={orderDetails[o.id]?.address}
                          isLoading={loadingDetails[o.id]}
                          error={detailErrors[o.id]}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    ยังไม่มีคำสั่งซื้อในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </>
  );
}
