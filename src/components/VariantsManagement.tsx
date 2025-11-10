import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS, GET_PRODUCT, CREATE_VARIANT_OPTIONS, CREATE_PRODUCT_VARIANT, UPDATE_PRODUCT_VARIANT, DELETE_PRODUCT_VARIANT } from '../lib/queries';
import './VariantsManagement.css';

interface OptionValue {
  id: string;
  value: string;
  displayOrder?: number;
  option?: {
    id: string;
    name: string;
  };
}

interface Variant {
  id: string;
  sku: string;
  price?: string;
  salePrice?: string;
  effectivePrice?: string;
  quantityInStock?: number;
  isInStock?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
  optionValues?: OptionValue[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  variants?: Variant[];
  variantOptions?: Array<{
    id: string;
    name: string;
    displayOrder?: number;
    values?: Array<{
      id: string;
      value: string;
    }>;
  }>;
  brand?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

const VariantsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Options form state
  const [optionsForm, setOptionsForm] = useState<Array<{
    name: string;
    values: string[];
    displayOrder: number;
  }>>([{ name: '', values: [''], displayOrder: 0 }]);

  // Variant form state
  const [variantForm, setVariantForm] = useState({
    sku: '',
    price: '',
    salePrice: '',
    quantityInStock: '',
    weight: '',
    isDefault: false,
    isActive: true,
    optionValues: {} as Record<string, string>,
  });

  const { data: productsData, loading: productsLoading, error: queryError } = useQuery(GET_PRODUCTS);
  const { data: productData, loading: productLoading } = useQuery(
    GET_PRODUCT,
    {
      variables: { id: selectedProductId ? parseInt(selectedProductId, 10) : null },
      skip: !selectedProductId,
    }
  );

  const products: Product[] = productsData?.products || [];
  const selectedProduct: Product | undefined = productData?.product;

  const productsWithVariants = products.filter((p) => p.variants && p.variants.length > 0);
  const productsWithoutVariants = products.length - productsWithVariants.length;

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const [createOptions, { loading: creatingOptions }] = useMutation(CREATE_VARIANT_OPTIONS, {
    refetchQueries: selectedProductId ? [{ query: GET_PRODUCT, variables: { id: parseInt(selectedProductId, 10) } }] : [],
    onCompleted: () => {
      setSuccess('Variant options created successfully!');
      setError('');
      setShowCreateOptions(false);
      setOptionsForm([{ name: '', values: [''], displayOrder: 0 }]);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Create options error:', err);
      setError(err.graphQLErrors?.[0]?.message || 'Failed to create variant options');
      setSuccess('');
    },
  });

  const [createVariant, { loading: creatingVariant }] = useMutation(CREATE_PRODUCT_VARIANT, {
    refetchQueries: selectedProductId ? [{ query: GET_PRODUCT, variables: { id: parseInt(selectedProductId, 10) } }] : [],
    onCompleted: () => {
      setSuccess('Variant created successfully!');
      setError('');
      setShowCreateVariant(false);
      resetVariantForm();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Create variant error:', err);
      setError(err.graphQLErrors?.[0]?.message || 'Failed to create variant');
      setSuccess('');
    },
  });

  const [updateVariant, { loading: updatingVariant }] = useMutation(UPDATE_PRODUCT_VARIANT, {
    refetchQueries: selectedProductId ? [{ query: GET_PRODUCT, variables: { id: parseInt(selectedProductId, 10) } }] : [],
    onCompleted: () => {
      setSuccess('Variant updated successfully!');
      setError('');
      setEditingVariantId(null);
      resetVariantForm();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Update variant error:', err);
      setError(err.graphQLErrors?.[0]?.message || 'Failed to update variant');
      setSuccess('');
    },
  });

  const [deleteVariant, { loading: deletingVariant }] = useMutation(DELETE_PRODUCT_VARIANT, {
    refetchQueries: selectedProductId ? [{ query: GET_PRODUCT, variables: { id: parseInt(selectedProductId, 10) } }] : [],
    onCompleted: () => {
      setSuccess('Variant deleted successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Delete variant error:', err);
      setError(err.graphQLErrors?.[0]?.message || 'Failed to delete variant');
      setSuccess('');
    },
  });

  const resetVariantForm = () => {
    setVariantForm({
      sku: '',
      price: '',
      salePrice: '',
      quantityInStock: '',
      weight: '',
      isDefault: false,
      isActive: true,
      optionValues: {},
    });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setShowCreateOptions(false);
    setShowCreateVariant(false);
    setEditingVariantId(null);
    setError('');
    setSuccess('');
  };

  const handleCreateOptions = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const validOptions = optionsForm.filter((opt) => opt.name.trim() && opt.values.some((v) => v.trim()));
    if (validOptions.length === 0) {
      setError('Please add at least one option with values');
      return;
    }

    try {
      await createOptions({
        variables: {
          productId: parseInt(selectedProductId, 10),
          options: validOptions.map((opt, idx) => ({
            name: opt.name.trim(),
            values: opt.values.filter((v) => v.trim()),
            displayOrder: opt.displayOrder ?? idx,
          })),
        },
      });
    } catch (err) {
      // Error handled in onError
    }
  };

  const handleCreateVariant = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    if (!variantForm.sku.trim() || !variantForm.price.trim()) {
      setError('SKU and price are required');
      return;
    }

    // Build optionValues JSON
    const optionValuesJson: Record<string, string> = {};
    selectedProduct?.variantOptions?.forEach((option) => {
      const value = variantForm.optionValues[option.id];
      if (value) {
        optionValuesJson[option.name] = value;
      }
    });

    try {
      await createVariant({
        variables: {
          input: {
            productId: parseInt(selectedProductId, 10),
            sku: variantForm.sku.trim(),
            optionValues: JSON.stringify(optionValuesJson),
            price: variantForm.price.trim(),
            salePrice: variantForm.salePrice.trim() || null,
            quantityInStock: variantForm.quantityInStock ? parseInt(variantForm.quantityInStock, 10) : null,
            weight: variantForm.weight.trim() || null,
            isDefault: variantForm.isDefault,
            isActive: variantForm.isActive,
          },
        },
      });
    } catch (err) {
      // Error handled in onError
    }
  };

  const handleEditVariant = (variant: Variant) => {
    setEditingVariantId(variant.id);
    setShowCreateVariant(false);
    
    // Populate form with variant data
    const optionValues: Record<string, string> = {};
    variant.optionValues?.forEach((ov) => {
      if (ov.option?.id) {
        optionValues[ov.option.id] = ov.value;
      }
    });

    setVariantForm({
      sku: variant.sku || '',
      price: variant.price || '',
      salePrice: variant.salePrice || '',
      quantityInStock: variant.quantityInStock?.toString() || '',
      weight: '',
      isDefault: variant.isDefault || false,
      isActive: variant.isActive !== false,
      optionValues,
    });
    setError('');
    setSuccess('');
  };

  const handleUpdateVariant = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingVariantId) return;

    try {
      await updateVariant({
        variables: {
          variantId: parseInt(editingVariantId, 10),
          price: variantForm.price.trim() || null,
          salePrice: variantForm.salePrice.trim() || null,
          quantityInStock: variantForm.quantityInStock ? parseInt(variantForm.quantityInStock, 10) : null,
          isActive: variantForm.isActive,
          isDefault: variantForm.isDefault,
        },
      });
    } catch (err) {
      // Error handled in onError
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) return;

    try {
      await deleteVariant({
        variables: {
          variantId: parseInt(variantId, 10),
        },
      });
    } catch (err) {
      // Error handled in onError
    }
  };

  const formatPrice = (price?: string) => {
    if (!price) return '—';
    return `AED ${parseFloat(price).toFixed(2)}`;
  };

  const getVariantDisplayName = (variant: Variant) => {
    if (!variant.optionValues || variant.optionValues.length === 0) {
      return variant.sku;
    }
    return variant.optionValues.map((ov) => ov.value).join(' / ');
  };

  if (productsLoading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  if (queryError) {
    return (
      <div className="admin-error-message">
        Error loading products: {queryError.message}
      </div>
    );
  }

  return (
    <div className="admin-variants">
      <div className="admin-variants-header">
        <h2>Variants Management</h2>
        <div className="admin-variants-stats">
          <div className="admin-stat-badge total">
            Total Products: {products.length}
          </div>
          <div className="admin-stat-badge with-variants">
            With Variants: {productsWithVariants.length}
          </div>
          <div className="admin-stat-badge without-variants">
            Without Variants: {productsWithoutVariants}
          </div>
        </div>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-success-message">{success}</div>}

      <div className="admin-variants-content">
        {/* Product List */}
        <div className="admin-variants-products-list">
          <div className="admin-filter-group">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-products-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`admin-product-card ${selectedProductId === product.id ? 'active' : ''}`}
                onClick={() => handleSelectProduct(product.id)}
              >
                <div className="admin-product-card-header">
                  <strong>{product.name}</strong>
                  <span className="admin-product-card-sku">{product.sku}</span>
                </div>
                <div className="admin-product-card-info">
                  {product.brand?.name && <span>Brand: {product.brand.name}</span>}
                  {product.variants && product.variants.length > 0 && (
                    <span className="admin-variant-count">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Product Details */}
        {selectedProductId && (
          <div className="admin-variants-details">
            {productLoading ? (
              <div className="admin-loading">Loading product details...</div>
            ) : selectedProduct ? (
              <>
                <div className="admin-product-details-header">
                  <h3>{selectedProduct.name}</h3>
                  <span className="admin-product-sku">{selectedProduct.sku}</span>
                  <button
                    className="admin-close-button"
                    onClick={() => {
                      setSelectedProductId(null);
                      setShowCreateOptions(false);
                      setShowCreateVariant(false);
                      setEditingVariantId(null);
                    }}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Variant Options Section */}
                {!selectedProduct.variantOptions || selectedProduct.variantOptions.length === 0 ? (
                  <div className="admin-section-card">
                    <div className="admin-section-header">
                      <h4>Variant Options</h4>
                      <button
                        className="admin-add-button"
                        onClick={() => setShowCreateOptions(!showCreateOptions)}
                      >
                        {showCreateOptions ? 'Cancel' : '+ Create Options'}
                      </button>
                    </div>
                    {showCreateOptions && (
                      <form className="admin-options-form" onSubmit={handleCreateOptions}>
                        <p className="admin-form-help">
                          Define the options customers can choose from (e.g., Color, Size, Weight)
                        </p>
                        {optionsForm.map((option, optIdx) => (
                          <div key={optIdx} className="admin-option-group">
                            <div className="admin-form-row">
                              <div className="admin-form-group">
                                <label>Option Name (e.g., Color, Size)</label>
                                <input
                                  type="text"
                                  value={option.name}
                                  onChange={(e) => {
                                    const newForm = [...optionsForm];
                                    const currentOption = newForm[optIdx];
                                    if (currentOption) {
                                      currentOption.name = e.target.value;
                                      setOptionsForm(newForm);
                                    }
                                  }}
                                  placeholder="e.g., Color"
                                  required
                                />
                              </div>
                              <div className="admin-form-group">
                                <label>Display Order</label>
                                <input
                                  type="number"
                                  value={option.displayOrder}
                                  onChange={(e) => {
                                    const newForm = [...optionsForm];
                                    const currentOption = newForm[optIdx];
                                    if (currentOption) {
                                      currentOption.displayOrder = parseInt(e.target.value, 10) || 0;
                                      setOptionsForm(newForm);
                                    }
                                  }}
                                  min="0"
                                />
                              </div>
                            </div>
                            <div className="admin-form-group">
                              <label>Values (one per line or comma-separated)</label>
                              {option.values.map((value, valIdx) => (
                                <input
                                  key={valIdx}
                                  type="text"
                                  value={value}
                                  onChange={(e) => {
                                    const newForm = [...optionsForm];
                                    const currentOption = newForm[optIdx];
                                    if (currentOption && currentOption.values[valIdx] !== undefined) {
                                      currentOption.values[valIdx] = e.target.value;
                                      setOptionsForm(newForm);
                                    }
                                  }}
                                  placeholder={`Value ${valIdx + 1}`}
                                  onBlur={() => {
                                    if (option.values.length > 0) {
                                      const lastValue = option.values[option.values.length - 1];
                                      if (lastValue && lastValue.trim()) {
                                        const newForm = [...optionsForm];
                                        const currentOption = newForm[optIdx];
                                        if (currentOption) {
                                          currentOption.values.push('');
                                          setOptionsForm(newForm);
                                        }
                                      }
                                    }
                                  }}
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              className="admin-remove-button"
                              onClick={() => {
                                setOptionsForm(optionsForm.filter((_, i) => i !== optIdx));
                              }}
                            >
                              Remove Option
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="admin-add-button"
                          onClick={() => {
                            setOptionsForm([
                              ...optionsForm,
                              { name: '', values: [''], displayOrder: optionsForm.length },
                            ]);
                          }}
                        >
                          + Add Another Option
                        </button>
                        <div className="admin-form-actions">
                          <button
                            type="submit"
                            className="admin-submit-button"
                            disabled={creatingOptions}
                          >
                            {creatingOptions ? 'Creating...' : 'Create Options'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="admin-section-card">
                    <div className="admin-section-header">
                      <h4>Variant Options</h4>
                    </div>
                    <div className="admin-options-list">
                      {selectedProduct.variantOptions.map((option) => (
                        <div key={option.id} className="admin-option-item">
                          <strong>{option.name}:</strong>
                          <span>
                            {option.values?.map((v) => v.value).join(', ') || 'No values'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants Section */}
                <div className="admin-section-card">
                  <div className="admin-section-header">
                    <h4>Variants</h4>
                    {selectedProduct.variantOptions && selectedProduct.variantOptions.length > 0 && (
                      <button
                        className="admin-add-button"
                        onClick={() => {
                          setShowCreateVariant(!showCreateVariant);
                          setEditingVariantId(null);
                          resetVariantForm();
                        }}
                      >
                        {showCreateVariant ? 'Cancel' : '+ Create Variant'}
                      </button>
                    )}
                  </div>

                  {(showCreateVariant || editingVariantId) && (
                    <form
                      className="admin-variant-form"
                      onSubmit={editingVariantId ? handleUpdateVariant : handleCreateVariant}
                    >
                      <div className="admin-form-header">
                        <h5>{editingVariantId ? 'Edit Variant' : 'Create New Variant'}</h5>
                      </div>

                      {!editingVariantId && (
                        <>
                          <div className="admin-form-group">
                            <label>SKU *</label>
                            <input
                              type="text"
                              value={variantForm.sku}
                              onChange={(e) =>
                                setVariantForm({ ...variantForm, sku: e.target.value })
                              }
                              required
                              placeholder="e.g., COCO-WHITE-500"
                            />
                          </div>

                          {selectedProduct.variantOptions?.map((option) => (
                            <div key={option.id} className="admin-form-group">
                              <label>{option.name} *</label>
                              <select
                                value={variantForm.optionValues[option.id] || ''}
                                onChange={(e) =>
                                  setVariantForm({
                                    ...variantForm,
                                    optionValues: {
                                      ...variantForm.optionValues,
                                      [option.id]: e.target.value,
                                    },
                                  })
                                }
                                required
                              >
                                <option value="">Select {option.name}</option>
                                {option.values?.map((val) => (
                                  <option key={val.id} value={val.value}>
                                    {val.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </>
                      )}

                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>Price (AED) *</label>
                          <input
                            type="text"
                            value={variantForm.price}
                            onChange={(e) =>
                              setVariantForm({ ...variantForm, price: e.target.value })
                            }
                            required
                            placeholder="e.g., 25.00"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Sale Price (AED)</label>
                          <input
                            type="text"
                            value={variantForm.salePrice}
                            onChange={(e) =>
                              setVariantForm({ ...variantForm, salePrice: e.target.value })
                            }
                            placeholder="e.g., 24.99"
                          />
                        </div>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>Quantity in Stock</label>
                          <input
                            type="number"
                            value={variantForm.quantityInStock}
                            onChange={(e) =>
                              setVariantForm({ ...variantForm, quantityInStock: e.target.value })
                            }
                            min="0"
                            placeholder="e.g., 150"
                          />
                        </div>
                        {!editingVariantId && (
                          <div className="admin-form-group">
                            <label>Weight</label>
                            <input
                              type="text"
                              value={variantForm.weight}
                              onChange={(e) =>
                                setVariantForm({ ...variantForm, weight: e.target.value })
                              }
                              placeholder="e.g., 500"
                            />
                          </div>
                        )}
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-group admin-checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={variantForm.isDefault}
                              onChange={(e) =>
                                setVariantForm({ ...variantForm, isDefault: e.target.checked })
                              }
                            />
                            Set as Default Variant
                          </label>
                        </div>
                        <div className="admin-form-group admin-checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={variantForm.isActive}
                              onChange={(e) =>
                                setVariantForm({ ...variantForm, isActive: e.target.checked })
                              }
                            />
                            Active
                          </label>
                        </div>
                      </div>

                      <div className="admin-form-actions">
                        <button
                          type="submit"
                          className="admin-submit-button"
                          disabled={creatingVariant || updatingVariant}
                        >
                          {creatingVariant || updatingVariant
                            ? editingVariantId
                              ? 'Updating...'
                              : 'Creating...'
                            : editingVariantId
                            ? 'Update Variant'
                            : 'Create Variant'}
                        </button>
                        {editingVariantId && (
                          <button
                            type="button"
                            className="admin-cancel-button"
                            onClick={() => {
                              setEditingVariantId(null);
                              resetVariantForm();
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                    <div className="admin-variants-list">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Options</th>
                            <th>Price</th>
                            <th>Sale Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProduct.variants.map((variant) => (
                            <tr key={variant.id}>
                              <td className="admin-table-sku">{variant.sku}</td>
                              <td>{getVariantDisplayName(variant)}</td>
                              <td>{formatPrice(variant.price)}</td>
                              <td className={variant.salePrice ? 'admin-sale-price' : ''}>
                                {formatPrice(variant.salePrice)}
                              </td>
                              <td>
                                {variant.quantityInStock ?? 0}
                                {variant.isDefault && (
                                  <span className="admin-default-badge">Default</span>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`admin-status-badge ${
                                    variant.isActive !== false ? 'active' : 'inactive'
                                  }`}
                                >
                                  {variant.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <div className="admin-action-buttons">
                                  <button
                                    className="admin-edit-button"
                                    onClick={() => handleEditVariant(variant)}
                                    title="Edit Variant"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    className="admin-delete-button"
                                    onClick={() => handleDeleteVariant(variant.id)}
                                    disabled={deletingVariant}
                                    title="Delete Variant"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="admin-empty-state">
                      {selectedProduct.variantOptions && selectedProduct.variantOptions.length > 0
                        ? 'No variants created yet. Create your first variant above.'
                        : 'Create variant options first, then create variants.'}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="admin-loading">Loading product details...</div>
            )}
          </div>
        )}

        {!selectedProductId && (
          <div className="admin-variants-placeholder">
            <p>Select a product from the list to manage its variants</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantsManagement;

