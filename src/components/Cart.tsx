import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../hooks/useCart';
import { usePayment } from '../hooks/usePayment';
import { getImageUrl } from '../config/api';
import './Cart.css';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<string>('ziina');
  const { cart, loading: cartLoading, error: cartError, refetch } = useCart();
  const { updateCartItem, loading: updatingItem } = useUpdateCartItem();
  const { removeCartItem, loading: removingItem } = useRemoveCartItem();
  const { processPayment, loading: processingPayment, error: paymentError } = usePayment();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    addressLine: '',
    emirate: 'DUBAI',
    city: 'Dubai',
    postalCode: ''
  });

  const cartItems = cart?.items || [];

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, newQuantity);
      refetch();
    } catch (err) {
      console.error('Error updating cart item:', err);
      alert('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
      refetch();
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    }
  };

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    // Validate shipping info
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phoneNumber || !shippingInfo.addressLine) {
      alert('Please fill in all required shipping information (Name, Email, Phone, Address)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!cart || cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // If Ziina is selected, use the new payment flow
    if (selectedPayment === 'ziina') {
      try {
        const result = await processPayment(
          {
            name: shippingInfo.fullName,
            email: shippingInfo.email,
            phone: shippingInfo.phoneNumber,
          },
          {
            fullName: shippingInfo.fullName,
            phoneNumber: shippingInfo.phoneNumber,
            email: shippingInfo.email,
            addressLine1: shippingInfo.addressLine,
            city: shippingInfo.city,
            emirate: shippingInfo.emirate,
            postalCode: shippingInfo.postalCode,
          }
        );

        if (!result.success) {
          alert(result.error || 'Failed to process payment');
        }
        // If successful, user will be redirected to payment page
      } catch (err: any) {
        console.error('Error processing payment:', err);
        alert(err.message || 'Failed to process payment');
      }
    } else {
      // For other payment methods, you can keep the old flow or show a message
      alert('This payment method is not yet available. Please use Ziina for now.');
    }
  };

  if (cartLoading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading cart...</div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="cart-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem', color: 'red' }}>
            Error: {cartError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-content">
          {/* Main sections: Shopping Cart and Payment Method */}
          <div className="cart-main-sections">
            {/* Shopping Cart Section */}
            <div className="cart-container">
              <h2 className="section-title">Shopping cart</h2>
              <div className="cart-section">
                {cartItems.length === 0 ? (
                  <div className="empty-cart">
                    <p>Your cart is empty</p>
                    <button onClick={() => navigate('/')} className="empty-cart-button">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="cart-table">
                    <div className="table-header">
                      <div className="header-cell">Product</div>
                      <div className="header-cell">SKU</div>
                      <div className="header-cell">Quantity</div>
                      <div className="header-cell">Unit</div>
                      <div className="header-cell">Total</div>
                    </div>
                    
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="table-row">
                        <div className="product-cell">
                          {(() => {
                            // Find primary image or first image
                            const primaryImage = item.product.images?.find((img: { image: string; isPrimary?: boolean }) => img.isPrimary)?.image || 
                                                 item.product.images?.[0]?.image || 
                                                 '';
                            return (
                              <img 
                                src={primaryImage ? getImageUrl(primaryImage) : '/Assets/logo.png'} 
                                alt={item.productName || item.product.name} 
                                className="cart-product-image"
                                onError={(e) => {
                                  e.currentTarget.src = '/Assets/logo.png';
                                }}
                              />
                            );
                          })()}
                          <span className="product-name">{item.displayName || item.productName || item.product.name}</span>
                          {item.variantOptionsDisplay && (
                            <span style={{ fontSize: '0.85rem', color: '#666' }}> ({item.variantOptionsDisplay})</span>
                          )}
                        </div>
                        <div className="sku-cell">{item.product.sku || item.variant?.sku || 'N/A'}</div>
                        <div className="quantity-cell">
                          <div className="quantity-controls">
                            <button 
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={updatingItem}
                            >
                              -
                            </button>
                            <input 
                              type="text" 
                              value={item.quantity}
                              readOnly
                              className="quantity-input"
                            />
                            <button 
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updatingItem}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            className="remove-btn"
                            onClick={() => removeItem(item.id)}
                            disabled={removingItem}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="unit-cell">
                          {item.priceAtAddition ? `${item.priceAtAddition} AED` : 'N/A'}
                        </div>
                        <div className="total-cell">
                          {item.subtotal ? `${item.subtotal} AED` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="cart-summary">
                  <div className="cart-summary-row">
                    <span className="cart-summary-label">Subtotal:</span>
                    <span className="cart-summary-value">{cart?.subtotal || '0'} AED</span>
                  </div>
                  {cart?.taxAmount && (
                    <div className="cart-summary-row">
                      <span className="cart-summary-label">Tax:</span>
                      <span className="cart-summary-value">{cart.taxAmount} AED</span>
                    </div>
                  )}
                  <div className="cart-summary-total">
                    <span className="cart-summary-label">Total:</span>
                    <span className="cart-summary-value">{cart?.total || '0'} AED</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="payment-container">
              <h2 className="section-title">Payment Method</h2>
              <div className="payment-section">
                <div className="payment-options">
                <div className="payment-option">
                  <input
                    type="radio"
                    id="toppy"
                    name="payment"
                    value="toppy"
                    checked={selectedPayment === 'toppy'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <label htmlFor="toppy" className="payment-label">
                    <div className="payment-icon toppy-icon">
                      <span>T</span>
                    </div>
                    <div className="payment-details">
                      <h3>Tappy</h3>
                      <p>Split in interest-free payments</p>
                      <span>No interest, no fees</span>
                    </div>
                    <button className="payment-amount">AED 242.81 * 4</button>
                  </label>
                </div>

                <div className="payment-option">
                  <input
                    type="radio"
                    id="tamara"
                    name="payment"
                    value="tamara"
                    checked={selectedPayment === 'tamara'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <label htmlFor="tamara" className="payment-label">
                    <div className="payment-icon tamara-icon">
                      <span>Tamara</span>
                    </div>
                    <div className="payment-details">
                      <h3>Tamara</h3>
                      <p>Pay in 3 installments, no interest</p>
                      <span>No interest, no fees</span>
                    </div>
                    <button className="payment-amount">AED 242.81 * 4</button>
                  </label>
                </div>

                <div className="payment-option">
                  <input
                    type="radio"
                    id="ziina"
                    name="payment"
                    value="ziina"
                    checked={selectedPayment === 'ziina'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <label htmlFor="ziina" className="payment-label">
                    <div className="payment-icon ziina-icon" style={{ background: '#4CAF50', color: 'white', fontWeight: 'bold' }}>
                      <span>Ziina</span>
                    </div>
                    <div className="payment-details">
                      <h3>Ziina</h3>
                      <p>Secure instant payment</p>
                      <span>Credit/Debit Cards, Apple Pay</span>
                    </div>
                  </label>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address Section - spans full width */}
          <div className="shipping-container">
            <h2 className="section-title">Shipping Address</h2>
            <div className="shipping-section">
              <div className="shipping-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={shippingInfo.fullName}
                  onChange={(e) => handleShippingChange('fullName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleShippingChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={shippingInfo.phoneNumber}
                  onChange={(e) => handleShippingChange('phoneNumber', e.target.value)}
                  placeholder="+971501234567"
                  required
                />
              </div>
              <div className="form-group">
                <label>Address line</label>
                <input
                  type="text"
                  value={shippingInfo.addressLine}
                  onChange={(e) => handleShippingChange('addressLine', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Emirate</label>
                <select
                  value={shippingInfo.emirate}
                  onChange={(e) => handleShippingChange('emirate', e.target.value)}
                >
                  <option value="DUBAI">Dubai</option>
                  <option value="ABU_DHABI">Abu Dhabi</option>
                  <option value="SHARJAH">Sharjah</option>
                  <option value="AJMAN">Ajman</option>
                  <option value="UMM_AL_QUWAIN">Umm Al Quwain</option>
                  <option value="RAS_AL_KHAIMAH">Ras Al Khaimah</option>
                  <option value="FUJAIRAH">Fujairah</option>
                </select>
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={shippingInfo.city}
                  onChange={(e) => handleShippingChange('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Postal Code (Optional)</label>
                <input
                  type="text"
                  value={shippingInfo.postalCode}
                  onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                />
              </div>
              {paymentError && (
                <div className="payment-error">
                  {paymentError}
                </div>
              )}
              {cartItems.length > 0 && (
                <div className="checkout-button-container">
                  <button
                    onClick={handleCheckout}
                    disabled={processingPayment}
                    className="checkout-button"
                  >
                    {processingPayment ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
