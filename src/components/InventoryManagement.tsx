import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS, CREATE_PRODUCT_INVENTORY, UPDATE_PRODUCT_INVENTORY } from '../lib/queries';
import './InventoryManagement.css';

interface Product {
  id: string;
  name: string;
  sku: string;
  inventory?: {
    id?: string;
    quantityInStock?: number;
    isInStock?: boolean;
    lowStockThreshold?: number;
    warehouseLocation?: string;
  };
  brand?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

const InventoryManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantityInStock: '',
    lowStockThreshold: '',
    warehouseLocation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, error: queryError } = useQuery(GET_PRODUCTS);

  const [createInventory, { loading: creating }] = useMutation(CREATE_PRODUCT_INVENTORY, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => {
      setSuccess('Inventory created successfully!');
      setError('');
      resetForm();
      setIsAdding(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Inventory creation error:', err);
      let errorMessage = 'Failed to create inventory';
      
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const graphQLError = err.graphQLErrors[0];
        if (graphQLError) {
          errorMessage = graphQLError.message || errorMessage;
          if (graphQLError.message?.includes('authorized') || graphQLError.message?.includes('Not authorized')) {
            errorMessage = 'Not authorized: The backend has rejected this request. Please ensure your account has staff/admin permissions and try again.';
          }
        }
      } else if (err.networkError) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setSuccess('');
    },
  });

  const [updateInventory, { loading: updating }] = useMutation(UPDATE_PRODUCT_INVENTORY, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => {
      setSuccess('Inventory updated successfully!');
      setError('');
      resetForm();
      setEditingProductId(null);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Inventory update error:', err);
      let errorMessage = 'Failed to update inventory';
      
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const graphQLError = err.graphQLErrors[0];
        if (graphQLError) {
          errorMessage = graphQLError.message || errorMessage;
          if (graphQLError.message?.includes('authorized') || graphQLError.message?.includes('Not authorized')) {
            errorMessage = 'Not authorized: The backend has rejected this request. Please ensure your account has staff/admin permissions and try again.';
          }
        }
      } else if (err.networkError) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setSuccess('');
    },
  });

  const products: Product[] = data?.products || [];

  const resetForm = () => {
    setFormData({
      productId: '',
      quantityInStock: '',
      lowStockThreshold: '',
      warehouseLocation: '',
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setIsAdding(false);
    setFormData({
      productId: product.id,
      quantityInStock: product.inventory?.quantityInStock?.toString() || '',
      lowStockThreshold: product.inventory?.lowStockThreshold?.toString() || '',
      warehouseLocation: product.inventory?.warehouseLocation || '',
    });
    setError('');
    setSuccess('');
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingProductId(null);
    resetForm();
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setIsAdding(false);
    resetForm();
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }

    const productId = isAdding ? formData.productId : editingProductId;
    if (!productId) {
      setError('Please select a product.');
      return;
    }

    const variables = {
      productId: parseInt(productId, 10),
      quantityInStock: formData.quantityInStock ? parseInt(formData.quantityInStock, 10) : null,
      lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold, 10) : null,
      warehouseLocation: formData.warehouseLocation.trim() || null,
    };

    try {
      if (isAdding) {
        await createInventory({ variables });
      } else {
        await updateInventory({ variables });
      }
    } catch (err: any) {
      // Error handled in onError callback
      console.error('Inventory operation error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const quantity = product.inventory?.quantityInStock ?? 0;
    const threshold = product.inventory?.lowStockThreshold ?? 10;

    if (filter === 'low') {
      return quantity > 0 && quantity <= threshold;
    }
    if (filter === 'out') {
      return quantity === 0 || !product.inventory?.isInStock;
    }
    return true;
  });

  const getStockStatus = (product: Product) => {
    const quantity = product.inventory?.quantityInStock ?? 0;
    const threshold = product.inventory?.lowStockThreshold ?? 10;

    if (quantity === 0 || !product.inventory?.isInStock) {
      return { status: 'out', label: 'Out of Stock', className: 'out-of-stock' };
    }
    if (quantity <= threshold) {
      return { status: 'low', label: 'Low Stock', className: 'low-stock' };
    }
    return { status: 'in', label: 'In Stock', className: 'in-stock' };
  };

  if (loading) {
    return <div className="admin-loading">Loading inventory...</div>;
  }

  if (queryError) {
    return (
      <div className="admin-error-message">
        Error loading inventory: {queryError.message}
      </div>
    );
  }

  const lowStockCount = products.filter((p) => {
    const qty = p.inventory?.quantityInStock ?? 0;
    const threshold = p.inventory?.lowStockThreshold ?? 10;
    return qty > 0 && qty <= threshold;
  }).length;

  const outOfStockCount = products.filter((p) => {
    const qty = p.inventory?.quantityInStock ?? 0;
    return qty === 0 || !p.inventory?.isInStock;
  }).length;

  return (
    <div className="admin-inventory">
      <div className="admin-inventory-header">
        <h2>Inventory Management</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-inventory-stats">
            <div className="admin-stat-badge total">
              Total Products: {products.length}
            </div>
            <div className="admin-stat-badge low">
              Low Stock: {lowStockCount}
            </div>
            <div className="admin-stat-badge out">
              Out of Stock: {outOfStockCount}
            </div>
          </div>
          <button
            className="admin-add-button"
            onClick={handleAdd}
            disabled={creating || updating || (editingProductId !== null) || isAdding}
          >
            + Add Inventory
          </button>
        </div>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-success-message">{success}</div>}

      {(editingProductId || isAdding) && (
        <form className="admin-inventory-edit-form" onSubmit={handleSubmit}>
          <div className="admin-form-header">
            <h3>{isAdding ? 'Add Inventory' : 'Edit Inventory'}</h3>
            <button
              type="button"
              className="admin-close-button"
              onClick={handleCancelEdit}
              title="Close"
            >
              ✕
            </button>
          </div>
          {isAdding && (
            <div className="admin-form-group">
              <label htmlFor="productId">Product *</label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={(e) => setFormData((prev) => ({ ...prev, productId: e.target.value }))}
                required
                className="admin-form-group select"
              >
                <option value="">Select a product</option>
                {products
                  .filter((p) => !p.inventory || !p.inventory.id)
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="quantityInStock">Quantity in Stock</label>
              <input
                type="number"
                id="quantityInStock"
                name="quantityInStock"
                value={formData.quantityInStock}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g., 100"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="lowStockThreshold">Low Stock Threshold</label>
              <input
                type="number"
                id="lowStockThreshold"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g., 10"
              />
            </div>
          </div>
          <div className="admin-form-group">
            <label htmlFor="warehouseLocation">Warehouse Location</label>
            <input
              type="text"
              id="warehouseLocation"
              name="warehouseLocation"
              value={formData.warehouseLocation}
              onChange={handleInputChange}
              placeholder="e.g., Warehouse A, Shelf 3"
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-submit-button" disabled={creating || updating}>
              {creating || updating ? (isAdding ? 'Creating...' : 'Updating...') : (isAdding ? 'Create Inventory' : 'Update Inventory')}
            </button>
            <button
              type="button"
              className="admin-cancel-button"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-inventory-filters">
        <div className="admin-filter-group">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <div className="admin-filter-buttons">
          <button
            className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Products
          </button>
          <button
            className={`admin-filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Low Stock
          </button>
          <button
            className={`admin-filter-btn ${filter === 'out' ? 'active' : ''}`}
            onClick={() => setFilter('out')}
          >
            Out of Stock
          </button>
        </div>
      </div>

      <div className="admin-inventory-list">
        {filteredProducts.length === 0 ? (
          <div className="admin-empty-state">
            {searchTerm
              ? 'No products found matching your search.'
              : 'No products found.'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Quantity in Stock</th>
                <th>Low Stock Threshold</th>
                <th>Warehouse Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id}>
                    <td className="admin-table-sku">{product.sku}</td>
                    <td className="admin-table-name">{product.name}</td>
                    <td>{product.brand?.name || <span className="admin-table-empty">—</span>}</td>
                    <td>{product.category?.name || <span className="admin-table-empty">—</span>}</td>
                    <td className="admin-inventory-quantity">
                      {product.inventory?.quantityInStock ?? 0}
                    </td>
                    <td>{product.inventory?.lowStockThreshold ?? <span className="admin-table-empty">—</span>}</td>
                    <td>
                      {product.inventory?.warehouseLocation || (
                        <span className="admin-table-empty">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-stock-badge ${stockStatus.className}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-edit-button"
                        onClick={() => handleEdit(product)}
                        title="Edit Inventory"
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;

