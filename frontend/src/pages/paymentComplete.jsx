import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentComplete() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe || !mounted) return;

        const clientSecret = new URLSearchParams(window.location.search).get(
          'payment_intent_client_secret'
        );

        if (!clientSecret) {
          navigate('/');
          return;
        }

        const resp = await stripe.retrievePaymentIntent(clientSecret);
        const paymentIntent = resp?.paymentIntent;

        if (!paymentIntent) {
          setStatus('failed');
          setMessage('ไม่พบข้อมูลการชำระเงิน');
          return;
        }

        const cartItems = JSON.parse(localStorage.getItem('cart_items') || '[]');

        switch (paymentIntent.status) {
          case 'succeeded':
            if (!mounted) return;
            setStatus('success');
            setMessage('การชำระเงินสำเร็จ');
            
            // Clear cart items from localStorage and API
            localStorage.removeItem('cart_items');
            
            // For logged-in users, cart will be cleared by webhook
            const token = localStorage.getItem('token');
            if (token) {
              try {
                await fetch('http://localhost:3000/cart', {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
              } catch (error) {
                console.error('Error clearing cart:', error);
              }
            }

            setOrderDetails({
              id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              date: new Date().toLocaleString('th-TH'),
              items: cartItems,
              shipping: {
                fee: cartItems.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0) >= 1000 ? 0 : 50
              }
            });
            break;
          case 'processing':
            if (!mounted) return;
            setStatus('processing');
            setMessage('กำลังดำเนินการชำระเงิน');
            break;
          case 'requires_payment_method':
            if (!mounted) return;
            setStatus('failed');
            setMessage('การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
            break;
          default:
            if (!mounted) return;
            setStatus('failed');
            setMessage('เกิดข้อผิดพลาด กรุณาติดต่อเจ้าหน้าที่');
            break;
        }
      } catch (err) {
        console.error('PaymentComplete error:', err);
        if (!mounted) return;
        setStatus('failed');
        setMessage('เกิดข้อผิดพลาดระหว่างดึงข้อมูลการชำระเงิน');
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (status === 'processing') {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6">
        <div className="text-center p-8 rounded-xl border bg-slate-50">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
          <h2 className="text-xl font-semibold mt-4">กำลังดำเนินการชำระเงิน</h2>
          <p className="text-slate-600 mt-2">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6">
      <div className={`p-6 rounded-xl border ${
        status === 'success' ? 'bg-emerald-50 border-emerald-100' :
        status === 'failed' ? 'bg-red-50 border-red-100' :
        'bg-slate-50 border-slate-100'
      }`}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            {status === 'success' ? '✅ ขอบคุณสำหรับการสั่งซื้อ' :
             status === 'failed' ? '❌ การชำระเงินไม่สำเร็จ' :
             '⏳ กำลังดำเนินการ'}
          </h2>
          <p className="text-slate-600">{message}</p>
        </div>

        {status === 'success' && orderDetails && (
          <div className="mt-8">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-semibold">หมายเลขคำสั่งซื้อ</h3>
                  <p className="text-sm text-slate-600 mt-1">{orderDetails.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">วันที่สั่งซื้อ</div>
                  <div className="font-medium">{orderDetails.date}</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {orderDetails.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-slate-600">
                        {item.size && `ไซส์: ${item.size}`} 
                        {item.color && ` • สี: ${item.color}`} 
                        {` • จำนวน: ${item.qty}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">฿{(item.price * item.qty).toLocaleString('th-TH')}</div>
                      <div className="text-sm text-slate-500">฿{item.price.toLocaleString('th-TH')} ต่อชิ้น</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-sm text-slate-600">
                  <div>ยอดรวมสินค้า</div>
                  <div>฿{orderDetails.amount.toLocaleString('th-TH')}</div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <div>ค่าจัดส่ง</div>
                  <div className={orderDetails.shipping.fee === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {orderDetails.shipping.fee === 0 ? 'ฟรี' : `฿${orderDetails.shipping.fee.toLocaleString('th-TH')}`}
                  </div>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <div className="font-semibold">ยอดรวมทั้งหมด</div>
                  <div className="text-xl font-bold">฿{(orderDetails.amount + orderDetails.shipping.fee).toLocaleString('th-TH')}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center space-y-4">
              <button
                onClick={() => navigate('/profile')}
                className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800"
              >
                ดูประวัติการสั่งซื้อ
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 border rounded-xl font-semibold hover:bg-slate-50"
              >
                กลับสู่หน้าแรก
              </button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/cart')}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}