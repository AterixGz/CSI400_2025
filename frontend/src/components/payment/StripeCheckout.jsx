import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
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

      const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/complete`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        return;
      }

      // ✅ จ่ายสำเร็จ
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // เก็บ cartItems ก่อนลบ localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart_items') || '[]');

        // เตรียมข้อมูล order สำหรับส่งไป paymentComplete
        const orderDetails = {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          date: new Date().toLocaleString('th-TH'),
          items: cartItems,
          shipping: {
            fee: cartItems.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0) >= 1000 ? 0 : 50
          }
        };

        // ลบสินค้าที่เลือกใน DB
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const res = await fetch('http://localhost:3000/cart/selected', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            const data = await res.json();
            if (!res.ok) {
              console.warn('ไม่สามารถลบสินค้าที่เลือกได้:', data.error);
            } else {
              console.log(data.message); // แสดงผลการลบในคอนโซล
            }
          } catch (err) {
            console.warn('ไม่สามารถลบสินค้าที่เลือกได้:', err);
          }
        }

        // ลบสินค้าที่เลือกใน localStorage สำหรับ guest user
        const currentCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
        const selectedIds = cartItems.map(item => item.id);
        const updatedCart = currentCart.filter(item => !selectedIds.includes(item.id));
        localStorage.setItem('cart_items', JSON.stringify(updatedCart));

        // เรียกใช้ onSuccess callback ถ้ามี
        if (typeof onSuccess === 'function') {
          onSuccess();
        }

        // ✅ แสดง toast แจ้งผล
        toast.success('ชำระเงินสำเร็จเรียบร้อย ✅', {
          duration: 4000,
          position: 'top-center',
        });

        // เก็บข้อมูลคำสั่งซื้อไว้ชั่วคราวเผื่อผู้ใช้ refresh หน้าจอ
        try {
          sessionStorage.setItem('last_order', JSON.stringify(orderDetails));
        } catch (e) {
          console.warn('ไม่สามารถเก็บคำสั่งซื้อใน sessionStorage ได้', e);
        }

        // ไปหน้า paymentComplete พร้อมข้อมูล
        navigate('/payment/complete', { state: { orderDetails } });
      }
    } catch (err) {
      console.error('payment submit error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      toast.error('เกิดข้อผิดพลาดในการชำระเงิน ❌');
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

export default function StripeCheckout({ amount, items, onCancel, onSuccess }) {
  const [clientSecret, setClientSecret] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
