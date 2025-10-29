import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/complete`,
        },
      });

      if (confirmError) {
        setError(confirmError.message);
      }
    } catch (e) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 border rounded-xl text-slate-700 hover:bg-slate-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold disabled:bg-slate-400"
        >
          {processing ? 'กำลังดำเนินการ...' : `ชำระเงิน ${amount.toLocaleString('th-TH')} บาท`}
        </button>
      </div>
    </form>
  );
}

export default function StripeCheckout({ amount, items, onCancel }) {
  const [clientSecret, setClientSecret] = useState('');
  const token = localStorage.getItem('token'); // Get auth token

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add auth header
          },
          body: JSON.stringify({ 
            amount, 
            items: items.map(item => ({
              product_id: item.product_id,
              qty: item.qty,
              price: item.price
            }))
          }),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment:', error);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, items, token]);

  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
        <div className="mt-4 text-slate-600">กำลังเตรียมการชำระเงิน...</div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#059669',
            borderRadius: '12px',
          },
        },
      }}
    >
      <CheckoutForm 
        amount={amount} 
        onCancel={onCancel}
      />
    </Elements>
  );
}