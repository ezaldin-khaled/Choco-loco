import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PAYMENT, VERIFY_PAYMENT } from '../lib/queries';
import Header from './Header';
import Footer from './Footer';
import './PaymentSuccess.css';

const PaymentCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const urlPaymentId = searchParams.get('payment_id');
    const storedPaymentId = localStorage.getItem('payment_id');
    const id = urlPaymentId || storedPaymentId;
    
    if (id) {
      setPaymentId(id);
    }
  }, [searchParams]);

  const [verifyPayment] = useMutation(VERIFY_PAYMENT);

  // Verify payment when component mounts to update status
  useEffect(() => {
    if (paymentId && !verificationAttempted) {
      setVerificationAttempted(true);
      verifyPayment({
        variables: {
          input: {
            paymentId: paymentId,
            gatewayName: 'ZIINA',
          },
        },
      }).catch((err) => {
        console.error('Error verifying payment:', err);
      });
    }
  }, [paymentId, verificationAttempted, verifyPayment]);

  const { data } = useQuery(GET_PAYMENT, {
    variables: { paymentId },
    skip: !paymentId,
    fetchPolicy: 'network-only',
  });

  const payment = data?.payment;

  return (
    <>
      <Header />
      <div className="payment-page">
        <div className="container">
          <div className="payment-status error">
            <div className="status-icon">⚠️</div>
            <h2>Payment Cancelled</h2>
            <p>You cancelled the payment process. Your order has not been placed.</p>
            {payment && (
              <div className="order-details" style={{ marginTop: '1rem' }}>
                <div className="detail-row">
                  <span className="detail-label">Payment ID:</span>
                  <span className="detail-value">{payment.paymentId}</span>
                </div>
                {payment.order && (
                  <div className="detail-row">
                    <span className="detail-label">Order Number:</span>
                    <span className="detail-value">{payment.order.orderNumber}</span>
                  </div>
                )}
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  Your order is still pending. You can return to your cart to complete the payment.
                </p>
              </div>
            )}
            <div className="action-buttons">
              <button onClick={() => navigate('/cart')} className="btn-primary">
                Return to Cart
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentCancel;

