import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_RETAIL_ORDER, CREATE_PAYMENT_SESSION } from '../lib/queries';
import { getSessionKey } from '../lib/graphqlClient';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  emirate: string;
  postalCode?: string;
}

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  productSku?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  taxAmount?: string;
  deliveryFee?: string;
  totalAmount: string;
  items: OrderItem[];
}

export const usePayment = () => {
  const [createOrder] = useMutation(CREATE_RETAIL_ORDER);
  const [createPayment] = useMutation(CREATE_PAYMENT_SESSION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (
    customerInfo: CustomerInfo,
    shippingAddress: ShippingAddress
  ) => {
    setLoading(true);
    setError(null);

    try {
      const sessionKey = getSessionKey();

      // Step 1: Create Order
      const orderResult = await createOrder({
        variables: {
          sessionKey,
          customerInfo: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
          shippingAddress: {
            fullName: shippingAddress.fullName,
            phoneNumber: shippingAddress.phoneNumber,
            email: shippingAddress.email,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2 || '',
            city: shippingAddress.city,
            emirate: shippingAddress.emirate,
            postalCode: shippingAddress.postalCode || '',
          },
        },
      });

      if (!orderResult.data?.createRetailOrder?.success) {
        throw new Error(
          orderResult.data?.createRetailOrder?.message || 'Failed to create order'
        );
      }

      const order: Order = orderResult.data.createRetailOrder.order;

      // Step 2: Create Payment Session
      const paymentResult = await createPayment({
        variables: {
          input: {
            orderId: order.orderNumber,
            amount: order.totalAmount.toString(),
            currency: 'AED',
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            customerName: customerInfo.name,
            taxAmount: order.taxAmount?.toString() || '0.00',
            shippingAmount: order.deliveryFee?.toString() || '0.00',
            discountAmount: '0.00',
            items: order.items.map((item) => ({
              name: item.productName,
              price: item.unitPrice.toString(),
              quantity: item.quantity,
              sku: item.productSku || '',
            })),
            shippingAddress: {
              fullName: shippingAddress.fullName,
              phoneNumber: shippingAddress.phoneNumber,
              email: shippingAddress.email,
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2 || '',
              city: shippingAddress.city,
              emirate: shippingAddress.emirate,
              postalCode: shippingAddress.postalCode || '',
            },
          },
          gatewayName: 'ZIINA',
        },
      });

      if (!paymentResult.data?.createPaymentSession?.success) {
        throw new Error(
          paymentResult.data?.createPaymentSession?.message ||
            'Failed to create payment session'
        );
      }

      const payment = paymentResult.data.createPaymentSession;

      // Step 3: Save payment info and redirect
      localStorage.setItem('payment_id', payment.paymentId);
      localStorage.setItem('order_number', order.orderNumber);

      // Redirect to Ziina payment page
      window.location.href = payment.paymentUrl;

      return { success: true, paymentId: payment.paymentId, order };
    } catch (err: any) {
      const errorMessage =
        err.message || 'An error occurred during payment processing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { processPayment, loading, error };
};

