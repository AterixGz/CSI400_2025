import { useState } from 'react';

function IconCard({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

export default function PaymentProfile() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'Visa',
      last4: '4242',
      expiry: '04/28',
      isDefault: true
    },
    {
      id: 2,
      type: 'PromptPay',
      last4: '001',
      status: 'Linked',
      isDefault: false
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation and API call here
    setPaymentMethods(prev => [...prev, {
      id: Date.now(),
      type: 'Visa',
      last4: newCard.number.slice(-4),
      expiry: newCard.expiry,
      isDefault: paymentMethods.length === 0
    }]);
    setNewCard({
      number: '',
      expiry: '',
      cvc: '',
      name: ''
    });
    setIsAddingNew(false);
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const handleDelete = (id) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Payment Methods</h2>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800"
          >
            Add Payment Method
          </button>
        </div>

        {isAddingNew && (
          <form onSubmit={handleSubmit} className="mb-8 border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Add New Card</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  maxLength="16"
                  value={newCard.number}
                  onChange={e => setNewCard(prev => ({ ...prev, number: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="5"
                    value={newCard.expiry}
                    onChange={e => setNewCard(prev => ({ ...prev, expiry: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="3"
                    value={newCard.cvc}
                    onChange={e => setNewCard(prev => ({ ...prev, cvc: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="123"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={newCard.name}
                  onChange={e => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="JOHN DOE"
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
                Add Card
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-slate-100 rounded-md">
                    <IconCard className="w-4 h-4 text-slate-600" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {method.type} •••• {method.last4}
                      </span>
                      {method.isDefault && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {method.expiry && (
                      <div className="text-sm text-slate-600 mt-1">
                        Exp {method.expiry}
                      </div>
                    )}
                    {method.status && (
                      <div className="text-sm text-slate-600 mt-1">
                        {method.status}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
                  >
                    Remove
                  </button>
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50"
                    >
                      Make default
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