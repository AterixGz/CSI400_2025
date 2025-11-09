import { Link } from "react-router-dom";

function IconOrders({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M2 10h20" />
      <path d="M7 15h4" />
      <path d="M7 18h8" />
    </svg>
  );
}

function IconAccount({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6" />
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14c-3.315 0-6 2.685-6 6" />
      <path d="M12 14c3.315 0 6 2.685 6 6" />
    </svg>
  );
}

function IconLogout({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function MenuProfile({ onLogout, activeView, onChangeView }) {
  return (
    <nav className="mt-6 bg-white rounded-xl border p-4 shadow-sm">
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onChangeView('orders')}
            className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg ${
              activeView === 'orders' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
            }`}
          >
            <span className={`p-2 ${activeView === 'orders' ? 'bg-slate-800' : 'bg-slate-100'} rounded-md`}>
              <IconOrders className={`w-4 h-4 ${activeView === 'orders' ? 'text-white' : 'text-slate-600'}`} />
            </span>
            <span className={activeView === 'orders' ? 'font-medium' : 'text-slate-700'}>Orders</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => onChangeView('account')}
            className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg ${
              activeView === 'account' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
            }`}
          >
            <span className={`p-2 ${activeView === 'account' ? 'bg-slate-800' : 'bg-slate-100'} rounded-md`}>
              <IconAccount className={`w-4 h-4 ${activeView === 'account' ? 'text-white' : 'text-slate-600'}`} />
            </span>
            <span className={activeView === 'account' ? 'font-medium' : 'text-slate-700'}>Account Details</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => onChangeView('addresses')}
            className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg ${
              activeView === 'addresses' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
            }`}
          >
            <span className={`p-2 ${activeView === 'addresses' ? 'bg-slate-800' : 'bg-slate-100'} rounded-md`}>
              <svg className={`w-4 h-4 ${activeView === 'addresses' ? 'text-white' : 'text-slate-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </span>
            <span className={activeView === 'addresses' ? 'font-medium' : 'text-slate-700'}>Addresses</span>
          </button>
        </li>
        {/* <li>
          <button
            onClick={() => onChangeView('payment')}
            className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg ${
              activeView === 'payment' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
            }`}
          >
            <span className={`p-2 ${activeView === 'payment' ? 'bg-slate-800' : 'bg-slate-100'} rounded-md`}>
              <svg className={`w-4 h-4 ${activeView === 'payment' ? 'text-white' : 'text-slate-600'}`} viewBox="0 0 24 24" fill="none">
                <path d="M21 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className={activeView === 'payment' ? 'font-medium' : 'text-slate-700'}>Payment Methods</span>
          </button>
        </li> */}
        <li>
          {/* <Link to="#" className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-slate-50">
            <span className="p-2 bg-slate-100 rounded-md">
              <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none">
                <path d="M12 21l-8-5V6l8-5 8 5v10l-8 5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="text-slate-700">Wishlist</span>
          </Link>
        </li>
        <li>
          <Link to="#" className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-slate-50">
            <span className="p-2 bg-slate-100 rounded-md">
              <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none">
                <path d="M12 1v22" stroke="currentColor" strokeWidth="1.5" />
                <path d="M1 12h22" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <span className="text-slate-700">Settings</span>
          </Link> */}
        </li>
      </ul>

      <div className="mt-6 border-t pt-4">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-md hover:bg-red-50 group"
        >
          <span className="p-2 bg-red-100 rounded-md group-hover:bg-red-200">
            <IconLogout className="w-4 h-4 text-red-600" />
          </span>
          <span className="text-red-600 font-medium">Log Out</span>
        </button>
      </div>
    </nav>
  );
}