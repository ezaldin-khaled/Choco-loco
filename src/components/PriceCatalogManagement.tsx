import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS, SET_PRODUCT_PRICE, UPDATE_PRODUCT_PRICE } from '../lib/queries';
import './PriceCatalogManagement.css';

interface Price {
  id?: string;
  basePrice?: string;
  salePrice?: string;
  priceType: string;
  minQuantity?: number;
  isActive?: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  prices?: Price[];
  brand?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

const PriceCatalogManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceTypeFilter, setPriceTypeFilter] = useState<string>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    basePrice: '',
    salePrice: '',
    minQuantity: '1',
    priceType: 'RETAIL',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, error: queryError } = useQuery(GET_PRODUCTS);

  const [setPrice, { loading: creating }] = useMutation(SET_PRODUCT_PRICE, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => {
      setSuccess('Price created successfully!');
      setError('');
      resetForm();
      setIsCreating(false);
      setEditingProductId(null);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Price creation error:', err);
      let errorMessage = 'Failed to create price';
      
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

  const [updatePrice, { loading: updating }] = useMutation(UPDATE_PRODUCT_PRICE, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => {
      setSuccess('Price updated successfully!');
      setError('');
      resetForm();
      setEditingPriceId(null);
      setEditingProductId(null);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Price update error:', err);
      let errorMessage = 'Failed to update price';
      
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
      basePrice: '',
      salePrice: '',
      minQuantity: '1',
      priceType: 'RETAIL',
      isActive: true,
    });
  };

  const handleEdit = (product: Product, price: Price) => {
    if (!price.id) {
      setError('Cannot edit price: Price ID is missing. Please refresh the page.');
      return;
    }
    
    setIsCreating(false);
    setEditingPriceId(price.id);
    setEditingProductId(product.id);
    setFormData({
      productId: product.id,
      basePrice: price.basePrice || '',
      salePrice: price.salePrice || '',
      minQuantity: price.minQuantity?.toString() || '1',
      priceType: price.priceType || 'RETAIL',
      isActive: price.isActive !== false,
    });
    setError('');
    setSuccess('');
  };

  const handleCreate = (product: Product) => {
    setIsCreating(true);
    setEditingPriceId(null);
    setEditingProductId(product.id);
    setFormData({
      productId: product.id,
      basePrice: '',
      salePrice: '',
      minQuantity: '1',
      priceType: 'RETAIL',
      isActive: true,
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingPriceId(null);
    setEditingProductId(null);
    setIsCreating(false);
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

    if (isCreating) {
      // Create new price using setProductPrice
      if (!formData.basePrice.trim()) {
        setError('Base price is required.');
        return;
      }

      try {
        await setPrice({
          variables: {
            input: {
              productId: parseInt(formData.productId, 10),
              priceType: formData.priceType,
              basePrice: formData.basePrice.trim(),
              salePrice: formData.salePrice.trim() || null,
              minQuantity: formData.minQuantity ? parseInt(formData.minQuantity, 10) : 1,
              isActive: formData.isActive,
            },
          },
        });
      } catch (err: any) {
        // Error handled in onError callback
        console.error('Create price error:', err);
      }
    } else {
      // Update existing price
      if (!editingPriceId) {
        setError('Invalid price ID');
        return;
      }

      try {
        await updatePrice({
          variables: {
            priceId: parseInt(editingPriceId, 10),
            basePrice: formData.basePrice.trim() || null,
            salePrice: formData.salePrice.trim() || null,
            minQuantity: formData.minQuantity ? parseInt(formData.minQuantity, 10) : null,
            isActive: formData.isActive,
          },
        });
      } catch (err: any) {
        // Error handled in onError callback
        console.error('Update price error:', err);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (priceTypeFilter !== 'all' && product.prices && product.prices.length > 0) {
      return product.prices.some((price) => price.priceType === priceTypeFilter);
    }

    return true;
  });

  const getPriceTypes = () => {
    const types = new Set<string>();
    products.forEach((product) => {
      product.prices?.forEach((price) => {
        if (price.priceType) {
          types.add(price.priceType);
        }
      });
    });
    return Array.from(types).sort();
  };

  const formatPrice = (price?: string) => {
    if (!price) return <span className="admin-table-empty">—</span>;
    return `AED ${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return <div className="admin-loading">Loading price catalog...</div>;
  }

  if (queryError) {
    return (
      <div className="admin-error-message">
        Error loading price catalog: {queryError.message}
      </div>
    );
  }

  const priceTypes = getPriceTypes();
  const productsWithPrices = products.filter((p) => p.prices && p.prices.length > 0).length;
  const productsWithoutPrices = products.length - productsWithPrices;

  return (
    <div className="admin-price-catalog">
      <div className="admin-price-catalog-header">
        <h2>Price Catalog Management</h2>
        <div className="admin-price-stats">
          <div className="admin-stat-badge total">
            Total Products: {products.length}
          </div>
          <div className="admin-stat-badge with-prices">
            With Prices: {productsWithPrices}
          </div>
          <div className="admin-stat-badge without-prices">
            Without Prices: {productsWithoutPrices}
          </div>
        </div>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-success-message">{success}</div>}

      {(editingPriceId || isCreating) && editingProductId && (
        <form className="admin-price-edit-form" onSubmit={handleSubmit}>
          <div className="admin-form-header">
            <h3>{isCreating ? 'Create Price' : 'Edit Price'}</h3>
            <button
              type="button"
              className="admin-close-button"
              onClick={handleCancelEdit}
              title="Close"
            >
              ✕
            </button>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="basePrice">Base Price (AED)</label>
              <input
                type="text"
                id="basePrice"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                placeholder="e.g., 29.99"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="salePrice">Sale Price (AED)</label>
              <input
                type="text"
                id="salePrice"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleInputChange}
                placeholder="e.g., 24.99"
              />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="minQuantity">Minimum Quantity</label>
              <input
                type="number"
                id="minQuantity"
                name="minQuantity"
                value={formData.minQuantity}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g., 1"
              />
            </div>
            <div className="admin-form-group admin-checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-submit-button" disabled={creating || updating}>
              {creating || updating ? (isCreating ? 'Creating...' : 'Updating...') : (isCreating ? 'Create Price' : 'Update Price')}
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

      <div className="admin-price-catalog-filters">
        <div className="admin-filter-group">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <div className="admin-filter-group">
          <select
            value={priceTypeFilter}
            onChange={(e) => setPriceTypeFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">All Price Types</option>
            {priceTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-price-catalog-list">
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
                <th>Price Type</th>
                <th>Base Price</th>
                <th>Sale Price</th>
                <th>Effective Price</th>
                <th>Min Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                // If product has no prices, show one row
                if (!product.prices || product.prices.length === 0) {
                  return (
                    <tr key={product.id}>
                      <td className="admin-table-sku">{product.sku}</td>
                      <td className="admin-table-name">{product.name}</td>
                      <td>{product.brand?.name || <span className="admin-table-empty">—</span>}</td>
                      <td>{product.category?.name || <span className="admin-table-empty">—</span>}</td>
                      <td colSpan={6}>
                        <span className="admin-table-empty">No pricing configured</span>
                      </td>
                      <td>
                        <button
                          className="admin-add-button"
                          onClick={() => handleCreate(product)}
                          title="Create Price"
                        >
                          + Add Price
                        </button>
                      </td>
                    </tr>
                  );
                }

                // Show each price as a separate row
                return product.prices.map((price, index) => {
                  if (priceTypeFilter !== 'all' && price.priceType !== priceTypeFilter) {
                    return null;
                  }

                  const isActive = price.isActive !== false;
                  const displayPrice = price.salePrice || price.basePrice;

                  return (
                    <tr key={`${product.id}-${index}`}>
                      {index === 0 && (
                        <>
                          <td className="admin-table-sku" rowSpan={product.prices?.length}>
                            {product.sku}
                          </td>
                          <td className="admin-table-name" rowSpan={product.prices?.length}>
                            {product.name}
                          </td>
                          <td rowSpan={product.prices?.length}>
                            {product.brand?.name || <span className="admin-table-empty">—</span>}
                          </td>
                          <td rowSpan={product.prices?.length}>
                            {product.category?.name || <span className="admin-table-empty">—</span>}
                          </td>
                        </>
                      )}
                      <td className="admin-price-type">
                        {price.priceType || <span className="admin-table-empty">—</span>}
                      </td>
                      <td className="admin-price-value">{formatPrice(price.basePrice)}</td>
                      <td className="admin-price-value sale">
                        {formatPrice(price.salePrice)}
                      </td>
                      <td className="admin-price-value effective">
                        {formatPrice(displayPrice)}
                      </td>
                      <td>{price.minQuantity || <span className="admin-table-empty">—</span>}</td>
                      <td>
                        <span className={`admin-status-badge ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {price.id ? (
                          <button
                            className="admin-edit-button"
                            onClick={() => handleEdit(product, price)}
                            title="Edit Price"
                          >
                            ✏️ Edit
                          </button>
                        ) : (
                          <span className="admin-table-empty" style={{ fontSize: '12px' }}>No ID</span>
                        )}
                      </td>
                    </tr>
                  );
                }).filter(Boolean);
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PriceCatalogManagement;

