import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PAYMENT, VERIFY_PAYMENT } from '../lib/queries';
import Header from './Header';
import Footer from './Footer';
import './PaymentSuccess.css';

const PaymentFailure: React.FC = () => {
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

  // Verify payment when component mounts
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
            <div className="status-icon">❌</div>
            <h2>Payment Failed</h2>
            <p>Your payment could not be processed. This could be due to:</p>
            <ul className="error-list">
              <li>Insufficient funds</li>
              <li>Card declined</li>
              <li>Network error</li>
              <li>Invalid card details</li>
            </ul>
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
              </div>
            )}
            <p style={{ marginTop: '1rem' }}>Please try again or use a different payment method.</p>
            <div className="action-buttons">
              <button onClick={() => navigate('/cart')} className="btn-primary">
                Try Again
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

export default PaymentFailure;

