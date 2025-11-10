import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { GET_PAYMENT, VERIFY_PAYMENT, UPDATE_ORDER_STATUS, GET_ORDER } from '../lib/queries';
import Header from './Header';
import Footer from './Footer';
import './PaymentSuccess.css';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    // Get payment ID from URL or localStorage
    const urlPaymentId = searchParams.get('payment_id');
    const storedPaymentId = localStorage.getItem('payment_id');
    const id = urlPaymentId || storedPaymentId;
    
    if (id) {
      setPaymentId(id);
    }
  }, [searchParams]);

  const [verifyPayment, { loading: verifying }] = useMutation(VERIFY_PAYMENT);
  const [updateOrderStatus, { loading: updatingOrder }] = useMutation(UPDATE_ORDER_STATUS);
  const [getOrder, { data: orderData }] = useLazyQuery(GET_ORDER);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PAYMENT, {
    variables: { paymentId },
    skip: !paymentId,
    pollInterval: paymentId ? 3000 : 0, // Poll every 3 seconds until payment is confirmed
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      // If payment is still pending, keep polling
      if (data?.payment?.status === 'PENDING' && !verifying) {
        // Refetch to get latest status
        refetch();
      }
    },
  });

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
      })
        .then((result) => {
          // After successful payment verification, check if we need to confirm the order
          if (result.data?.verifyPayment?.success) {
            const verifyStatus = result.data.verifyPayment.status;
            if (verifyStatus === 'completed' || verifyStatus === 'captured') {
              // Payment verified successfully - trigger refetch to get updated payment/order status
              setTimeout(() => {
                refetch();
              }, 1000);
            }
          }
        })
        .catch((err) => {
          console.error('Error verifying payment:', err);
        });
    }
  }, [paymentId, verificationAttempted, verifyPayment, refetch]);

  // Auto-confirm order when payment is successful
  useEffect(() => {
    const payment = data?.payment;
    if (
      payment &&
      !orderConfirmed &&
      (payment.status === 'COMPLETED' || payment.status === 'CAPTURED' || payment.status === 'AUTHORIZED') &&
      payment.order?.status === 'PENDING' &&
      payment.order?.orderNumber
    ) {
      setOrderConfirmed(true);
      // Fetch order details to get the order ID
      getOrder({
        variables: {
          orderNumber: payment.order.orderNumber,
        },
      });
    }
  }, [data, orderConfirmed, getOrder]);

  // Update order status to CONFIRMED once we have the order details
  useEffect(() => {
    const order = orderData?.order;
    if (order && order.status === 'PENDING' && order.id && !updatingOrder) {
      // Automatically confirm the order after successful payment
      updateOrderStatus({
        variables: {
          input: {
            orderId: parseInt(order.id),
            status: 'CONFIRMED',
            notes: 'Order automatically confirmed after successful payment verification',
          },
        },
      })
        .then(() => {
          console.log('Order automatically confirmed:', order.orderNumber);
          // Refetch payment data to get updated order status
          refetch();
        })
        .catch((err) => {
          console.error('Error auto-confirming order:', err);
          // If it fails due to auth, that's okay - backend webhook should handle it
          // But we'll still try to refetch to see if backend already confirmed it
          setTimeout(() => refetch(), 2000);
        });
    }
  }, [orderData, updateOrderStatus, updatingOrder, refetch]);

  if (loading || verifying || updatingOrder) {
    return (
      <>
        <Header />
        <div className="payment-page">
          <div className="container">
            <div className="payment-status">
              <div className="loading-spinner">⏳</div>
              <h2>Verifying payment...</h2>
              <p>Please wait while we confirm your payment.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="payment-page">
          <div className="container">
            <div className="payment-status error">
              <div className="status-icon">❌</div>
              <h2>Error Verifying Payment</h2>
              <p>{error.message || 'An error occurred while verifying your payment.'}</p>
              <button onClick={() => navigate('/cart')} className="btn-primary">
                Return to Cart
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const payment = data?.payment;

  if (!payment) {
    return (
      <>
        <Header />
        <div className="payment-page">
          <div className="container">
            <div className="payment-status error">
              <div className="status-icon">❌</div>
              <h2>Payment Not Found</h2>
              <p>We couldn't find your payment. Please contact support if you've been charged.</p>
              <button onClick={() => navigate('/')} className="btn-primary">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Check payment status
  const isSuccess = payment.status === 'COMPLETED' || payment.status === 'CAPTURED' || payment.status === 'AUTHORIZED';
  
  if (isSuccess) {
    // Payment successful - clear stored payment info
    localStorage.removeItem('payment_id');
    localStorage.removeItem('order_number');

    return (
      <>
        <Header />
        <div className="payment-page">
          <div className="container">
            <div className="payment-status success">
              <div className="status-icon">✅</div>
              <h1>Payment Successful!</h1>
              <p className="success-message">
                Thank you for your order, {payment.order?.customerName || 'valued customer'}!
              </p>
              
              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Order Number:</span>
                  <span className="detail-value">{payment.order?.orderNumber || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount Paid:</span>
                  <span className="detail-value">AED {payment.amount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{payment.gateway?.name || 'Ziina'}</span>
                </div>
              </div>

              <p className="info-message">
                Your order is being processed and will be shipped soon. You will receive a confirmation email shortly.
              </p>

              <div className="action-buttons">
                <button onClick={() => navigate('/')} className="btn-primary">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (payment.status === 'FAILED') {
    return (
      <>
        <Header />
        <div className="payment-page">
          <div className="container">
            <div className="payment-status error">
              <div className="status-icon">❌</div>
              <h2>Payment Failed</h2>
              <p>Your payment could not be processed. Please try again.</p>
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
  }

  if (payment.status === 'PENDING') {
    return (
      <>
        <Header />
        <div className="payment-page">
          <div className="container">
            <div className="payment-status pending">
              <div className="status-icon">⏳</div>
              <h2>Payment Processing</h2>
              <p>Your payment is being processed. Please wait...</p>
              <p className="info-message">
                This may take a few moments. Please do not close this page.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="payment-page">
        <div className="container">
          <div className="payment-status">
            <div className="status-icon">⚠️</div>
            <h2>Unknown Payment Status</h2>
            <p>Payment status: {payment.status}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccess;

