import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ORDERS, GET_ORDER, UPDATE_ORDER_STATUS, CANCEL_ORDER } from '../lib/queries';
import './OrdersManagement.css';

const OrdersManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  const { data, loading, error, refetch } = useQuery(GET_ORDERS, {
    variables: {
      status: statusFilter || undefined,
      limit: 50,
    },
    fetchPolicy: 'network-only',
  });

  const { data: orderDetails } = useQuery(GET_ORDER, {
    variables: { orderNumber: selectedOrder || '' },
    skip: !selectedOrder,
    fetchPolicy: 'network-only',
  });

  const [updateOrderStatus, { loading: updatingStatus }] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      setShowStatusModal(false);
      setStatusNotes('');
      setNewStatus('');
      refetch();
      if (selectedOrder) {
        // Refetch order details if viewing a specific order
      }
    },
  });

  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_ORDER, {
    onCompleted: () => {
      refetch();
      if (selectedOrder) {
        setSelectedOrder(null);
      }
    },
  });

  const orders = data?.orders || [];

  const handleStatusUpdate = (status: string) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleConfirmStatusUpdate = () => {
    if (!selectedOrder || !newStatus) return;

    const order = orderDetails?.order;
    if (!order) return;

    updateOrderStatus({
      variables: {
        input: {
          orderId: parseInt(order.id),
          status: newStatus,
          notes: statusNotes || undefined,
        },
      },
    });
  };

  const handleCancelOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      cancelOrder({
        variables: {
          orderId: orderId,
          reason: 'Cancelled by admin',
        },
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
    };
    return statusMap[status] || 'unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="admin-loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div className="admin-error">
          Error loading orders: {error.message}
        </div>
      </div>
    );
  }

  const order = orderDetails?.order;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Orders Management</h2>
        <div className="admin-orders-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button onClick={() => refetch()} className="admin-refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>

      {selectedOrder && order ? (
        <div className="admin-order-details">
          <div className="admin-order-details-header">
            <button
              onClick={() => setSelectedOrder(null)}
              className="admin-back-button"
            >
              ← Back to Orders
            </button>
            <h3>Order Details: {order.orderNumber}</h3>
          </div>

          <div className="admin-order-details-content">
            <div className="admin-order-info-grid">
              <div className="admin-order-info-card">
                <h4>Order Information</h4>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Order Number:</span>
                  <span className="admin-order-info-value">{order.orderNumber}</span>
                </div>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Status:</span>
                  <span className={`admin-status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Order Type:</span>
                  <span className="admin-order-info-value">{order.orderType}</span>
                </div>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Created:</span>
                  <span className="admin-order-info-value">{formatDate(order.createdAt)}</span>
                </div>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Total Amount:</span>
                  <span className="admin-order-info-value">AED {order.totalAmount}</span>
                </div>
              </div>

              <div className="admin-order-info-card">
                <h4>Customer Information</h4>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Name:</span>
                  <span className="admin-order-info-value">{order.customerName}</span>
                </div>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Email:</span>
                  <span className="admin-order-info-value">{order.customerEmail}</span>
                </div>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Phone:</span>
                  <span className="admin-order-info-value">{order.customerPhone}</span>
                </div>
                {order.customerCompany && (
                  <div className="admin-order-info-row">
                    <span className="admin-order-info-label">Company:</span>
                    <span className="admin-order-info-value">{order.customerCompany}</span>
                  </div>
                )}
              </div>

              {order.shippingAddress && (
                <div className="admin-order-info-card">
                  <h4>Shipping Address</h4>
                  <div className="admin-order-info-row">
                    <span className="admin-order-info-label">Name:</span>
                    <span className="admin-order-info-value">{order.shippingAddress.fullName}</span>
                  </div>
                  <div className="admin-order-info-row">
                    <span className="admin-order-info-label">Phone:</span>
                    <span className="admin-order-info-value">{order.shippingAddress.phoneNumber}</span>
                  </div>
                  <div className="admin-order-info-row">
                    <span className="admin-order-info-label">Address:</span>
                    <span className="admin-order-info-value">
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                    </span>
                  </div>
                  <div className="admin-order-info-row">
                    <span className="admin-order-info-label">City:</span>
                    <span className="admin-order-info-value">{order.shippingAddress.city}</span>
                  </div>
                  <div className="admin-order-info-row">
                    <span className="admin-order-info-label">Emirate:</span>
                    <span className="admin-order-info-value">{order.shippingAddress.emirate}</span>
                  </div>
                  {order.shippingAddress.postalCode && (
                    <div className="admin-order-info-row">
                      <span className="admin-order-info-label">Postal Code:</span>
                      <span className="admin-order-info-value">{order.shippingAddress.postalCode}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="admin-order-info-card">
                <h4>Order Summary</h4>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Subtotal:</span>
                  <span className="admin-order-info-value">AED {order.subtotal}</span>
                </div>
                {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                  <div className="admin-order-info-row">
                    <span className="admin-order-info-label">Discount:</span>
                    <span className="admin-order-info-value">-AED {order.discountAmount}</span>
                  </div>
                )}
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Tax:</span>
                  <span className="admin-order-info-value">AED {order.taxAmount || '0.00'}</span>
                </div>
                <div className="admin-order-info-row">
                  <span className="admin-order-info-label">Delivery Fee:</span>
                  <span className="admin-order-info-value">AED {order.deliveryFee || '0.00'}</span>
                </div>
                <div className="admin-order-info-row admin-order-total">
                  <span className="admin-order-info-label">Total:</span>
                  <span className="admin-order-info-value">AED {order.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="admin-order-items-section">
              <h4>Order Items</h4>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.productSku || item.product?.sku || '—'}</td>
                      <td>{item.quantity}</td>
                      <td>AED {item.unitPrice}</td>
                      <td>AED {item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="admin-order-status-history">
                <h4>Status History</h4>
                <div className="admin-status-history-list">
                  {order.statusHistory.map((history: any, index: number) => (
                    <div key={index} className="admin-status-history-item">
                      <div className="admin-status-history-status">
                        <span className={`admin-status-badge ${getStatusBadgeClass(history.status)}`}>
                          {history.status}
                        </span>
                        <span className="admin-status-history-date">
                          {formatDate(history.createdAt)}
                        </span>
                      </div>
                      {history.notes && (
                        <div className="admin-status-history-notes">{history.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-order-actions">
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('CONFIRMED')}
                    className="admin-action-button"
                    disabled={order.status === 'CONFIRMED'}
                  >
                    ✓ Confirm
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('PROCESSING')}
                    className="admin-action-button"
                    disabled={order.status === 'PROCESSING'}
                  >
                    ⚙️ Process
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('SHIPPED')}
                    className="admin-action-button"
                    disabled={order.status === 'SHIPPED'}
                  >
                    🚚 Ship
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('DELIVERED')}
                    className="admin-action-button"
                    disabled={order.status === 'DELIVERED'}
                  >
                    ✓ Deliver
                  </button>
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="admin-action-button admin-cancel-button"
                    disabled={cancelling}
                  >
                    ✕ Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.length === 0 ? (
            <div className="admin-empty-state">No orders found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="admin-table-order-number">{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{order.customerEmail}</td>
                    <td>
                      <span className={`admin-status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>AED {order.totalAmount}</td>
                    <td>
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(order.orderNumber)}
                        className="admin-view-button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showStatusModal && (
        <div className="admin-modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update Order Status</h3>
            <div className="admin-modal-content">
              <label>
                New Status:
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-form-input"
                >
                  <option value="">Select Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </label>
              <label>
                Notes (optional):
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="admin-form-input"
                  rows={4}
                  placeholder="Add notes about this status change..."
                />
              </label>
            </div>
            <div className="admin-modal-actions">
              <button
                onClick={() => setShowStatusModal(false)}
                className="admin-cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                className="admin-save-button"
                disabled={!newStatus || updatingStatus}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;

