import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS, CREATE_PRODUCT, UPDATE_PRODUCT, GET_BRANDS, GET_CATEGORIES, UPLOAD_PRODUCT_IMAGE, UPLOAD_PRODUCT_USECASE_IMAGE } from '../lib/queries';
import './ProductsManagement.css';

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  weight?: number;
  unitType?: string;
  isActive?: boolean;
  featured?: boolean;
  brand?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

const UNIT_TYPES = ['KG', 'GRAM', 'LITER', 'BOTTLE', 'PIECE', 'BOX', 'PACK'];

const ProductsManagement: React.FC = () => {
  // Authorization is handled entirely by the backend via JWT token
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    slug: '',
    brandId: '',
    categoryId: '',
    description: '',
    shortDescription: '',
    weight: '',
    unitType: 'GRAM',
    isActive: true,
    featured: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Image upload state
  const [mainImages, setMainImages] = useState<Array<{ file: File; altText: string; isPrimary: boolean; preview: string }>>([]);
  const [useCaseImages, setUseCaseImages] = useState<Array<{ file: File; altText: string; preview: string }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_PRODUCTS);
  const { data: brandsData, loading: brandsLoading } = useQuery(GET_BRANDS);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  
  const [uploadProductImage] = useMutation(UPLOAD_PRODUCT_IMAGE);
  const [uploadUseCaseImage] = useMutation(UPLOAD_PRODUCT_USECASE_IMAGE);

  // Upload all images for a product
  const uploadAllImages = async (productId: number) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Upload main images
    for (let i = 0; i < mainImages.length; i++) {
      const img = mainImages[i];
      if (!img) continue; // Skip if image is undefined
      try {
        await uploadProductImage({
          variables: {
            productId,
            image: img.file,
            altText: img.altText || formData.name,
            isPrimary: img.isPrimary,
            displayOrder: i + 1,
          },
          context: {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        });
      } catch (err) {
        console.error(`Error uploading main image ${i + 1}:`, err);
        throw err;
      }
    }

    // Upload use case images
    for (let i = 0; i < useCaseImages.length; i++) {
      const img = useCaseImages[i];
      if (!img) continue; // Skip if image is undefined
      try {
        await uploadUseCaseImage({
          variables: {
            productId,
            image: img.file,
            altText: img.altText || `${formData.name} use case ${i + 1}`,
            displayOrder: i + 1,
          },
          context: {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        });
      } catch (err) {
        console.error(`Error uploading use case image ${i + 1}:`, err);
        throw err;
      }
    }
  };
  
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: async (data) => {
      const productId = data?.createProduct?.product?.id;
      
      // Upload images if product was created successfully and images are selected
      if (productId && (mainImages.length > 0 || useCaseImages.length > 0)) {
        setUploadingImages(true);
        try {
          await uploadAllImages(parseInt(productId, 10));
          setSuccess('Product created successfully with images!');
        } catch (err) {
          console.error('Error uploading images:', err);
          setSuccess('Product created successfully, but some images failed to upload.');
        } finally {
          setUploadingImages(false);
        }
      } else {
        setSuccess('Product created successfully!');
      }
      
      setError('');
      resetForm();
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Product creation error:', err);
      let errorMessage = 'Failed to create product';
      
      // Check for specific GraphQL errors
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const graphQLError = err.graphQLErrors[0];
        if (graphQLError) {
          errorMessage = graphQLError.message || errorMessage;
          
          // Handle "Not authorized" error
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

  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => {
      setSuccess('Product updated successfully!');
      setError('');
      resetForm();
      setEditingProductId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Product update error:', err);
      let errorMessage = 'Failed to update product';
      
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

  const products: Product[] = productsData?.products ? [...productsData.products] : [];
  const brands = brandsData?.brands || [];
  const categories = categoriesData?.categories || [];

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      slug: '',
      brandId: '',
      categoryId: '',
      description: '',
      shortDescription: '',
      weight: '',
      unitType: 'GRAM',
      isActive: true,
      featured: false,
    });
    // Clear image previews
    mainImages.forEach(img => URL.revokeObjectURL(img.preview));
    useCaseImages.forEach(img => URL.revokeObjectURL(img.preview));
    setMainImages([]);
    setUseCaseImages([]);
  };


  // Handle main image file selection
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = files.slice(0, 3 - mainImages.length).map((file, index) => ({
      file,
      altText: formData.name || '',
      isPrimary: mainImages.length === 0 && index === 0, // First image is primary by default
      preview: URL.createObjectURL(file),
    }));

    setMainImages(prev => [...prev, ...newImages]);
  };

  // Handle use case image file selection
  const handleUseCaseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = files.slice(0, 4 - useCaseImages.length).map((file) => ({
      file,
      altText: `${formData.name || 'Product'} use case`,
      preview: URL.createObjectURL(file),
    }));

    setUseCaseImages(prev => [...prev, ...newImages]);
  };

  // Remove main image
  const removeMainImage = (index: number) => {
    setMainImages(prev => {
      const newImages = [...prev];
      const imageToRemove = newImages[index];
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      newImages.splice(index, 1);
      // If we removed the primary image, make the first one primary
      if (newImages.length > 0 && prev[index]?.isPrimary && newImages[0]) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  // Remove use case image
  const removeUseCaseImage = (index: number) => {
    setUseCaseImages(prev => {
      const newImages = [...prev];
      const imageToRemove = newImages[index];
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Update image alt text
  const updateMainImageAltText = (index: number, altText: string) => {
    setMainImages(prev => {
      const newImages = [...prev];
      newImages[index].altText = altText;
      return newImages;
    });
  };

  const updateUseCaseImageAltText = (index: number, altText: string) => {
    setUseCaseImages(prev => {
      const newImages = [...prev];
      newImages[index].altText = altText;
      return newImages;
    });
  };

  // Toggle primary image
  const setPrimaryImage = (index: number) => {
    setMainImages(prev => {
      const newImages = prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      return newImages;
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      sku: product.sku || '',
      name: product.name || '',
      slug: product.slug || '',
      brandId: product.brand?.id || '',
      categoryId: product.category?.id || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      weight: product.weight?.toString() || '',
      unitType: product.unitType || 'GRAM',
      isActive: product.isActive !== false,
      featured: product.featured || false,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    resetForm();
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Verify token exists - backend will handle all authorization
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }

    const inputData = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
      brandId: parseInt(formData.brandId, 10),
      categoryId: parseInt(formData.categoryId, 10),
      description: formData.description.trim() || null,
      shortDescription: formData.shortDescription.trim() || null,
      weight: formData.weight.trim() || null,
      unitType: formData.unitType || null,
      isActive: formData.isActive,
      featured: formData.featured,
    };

    try {
      if (editingProductId) {
        console.log('[Product] Updating product - authorization handled by backend via JWT token');
        await updateProduct({
          variables: {
            id: parseInt(editingProductId, 10),
            input: inputData,
          },
        });
      } else {
        console.log('[Product] Creating product - authorization handled by backend via JWT token');
        await createProduct({
          variables: {
            input: inputData,
          },
        });
      }
    } catch (err: any) {
      // Error handled in onError callback
      console.error('Product operation error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  };

  if (productsLoading || brandsLoading || categoriesLoading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h2>Products Management</h2>
        <button
          className="admin-add-button"
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
              setEditingProductId(null);
              resetForm();
            }
          }}
          disabled={creating || updating}
        >
          {showForm ? 'Cancel' : '+ Add New Product'}
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-success-message">{success}</div>}

      {showForm && (
        <form className="admin-product-form" onSubmit={handleSubmit}>
          {editingProductId && (
            <div className="admin-form-header">
              <h3>Edit Product</h3>
            </div>
          )}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="sku">SKU *</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                placeholder="e.g., LINDT-DARK-85"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                placeholder="e.g., Lindt Excellence Dark 85%"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="slug">Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                placeholder="e.g., lindt-excellence-dark-85"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="brandId">Brand *</label>
              <select
                id="brandId"
                name="brandId"
                value={formData.brandId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a brand</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label htmlFor="unitType">Unit Type</label>
              <select
                id="unitType"
                name="unitType"
                value={formData.unitType}
                onChange={handleInputChange}
              >
                {UNIT_TYPES.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="weight">Weight</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 100.0"
              />
            </div>
            <div className="admin-form-group admin-checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                Featured
              </label>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="shortDescription">Short Description</label>
            <input
              type="text"
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              placeholder="Brief product description"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Full product description (optional)"
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

          {/* Main Product Images Section */}
          <div className="admin-form-group">
            <label>Main Product Images (up to 3)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMainImageChange}
              disabled={mainImages.length >= 3}
              style={{ marginBottom: '1rem' }}
            />
            {mainImages.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {mainImages.map((img, index) => (
                  <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem', position: 'relative' }}>
                    <img
                      src={img.preview}
                      alt={img.altText}
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Alt text"
                        value={img.altText}
                        onChange={(e) => updateMainImageAltText(index, e.target.value)}
                        style={{ width: '100%', padding: '0.25rem', marginBottom: '0.25rem', fontSize: '0.875rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input
                            type="radio"
                            name="primaryImage"
                            checked={img.isPrimary}
                            onChange={() => setPrimaryImage(index)}
                          />
                          Primary
                        </label>
                        <button
                          type="button"
                          onClick={() => removeMainImage(index)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {mainImages.length >= 3 && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Maximum 3 main images. Remove an image to add more.
              </p>
            )}
          </div>

          {/* Use Case Images Section */}
          <div className="admin-form-group">
            <label>Use Case Images (up to 4)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUseCaseImageChange}
              disabled={useCaseImages.length >= 4}
              style={{ marginBottom: '1rem' }}
            />
            {useCaseImages.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {useCaseImages.map((img, index) => (
                  <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem', position: 'relative' }}>
                    <img
                      src={img.preview}
                      alt={img.altText}
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Alt text"
                        value={img.altText}
                        onChange={(e) => updateUseCaseImageAltText(index, e.target.value)}
                        style={{ width: '100%', padding: '0.25rem', marginBottom: '0.25rem', fontSize: '0.875rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeUseCaseImage(index)}
                        style={{
                          width: '100%',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {useCaseImages.length >= 4 && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Maximum 4 use case images. Remove an image to add more.
              </p>
            )}
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-submit-button" disabled={creating || updating || uploadingImages}>
              {uploadingImages ? 'Uploading Images...' : creating || updating ? (editingProductId ? 'Updating...' : 'Creating...') : (editingProductId ? 'Update Product' : 'Create Product')}
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

      {productsError && (
        <div className="admin-error-message">
          Error loading products: {productsError.message}
        </div>
      )}

      <div className="admin-products-list">
        {products.length === 0 ? (
          <div className="admin-empty-state">No products found. Create your first product above.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="admin-table-sku">{product.sku}</td>
                  <td className="admin-table-name">{product.name}</td>
                  <td>{product.brand?.name || <span className="admin-table-empty">—</span>}</td>
                  <td>{product.category?.name || <span className="admin-table-empty">—</span>}</td>
                  <td>
                    {product.weight ? `${product.weight} ${product.unitType || ''}` : <span className="admin-table-empty">—</span>}
                  </td>
                  <td>
                    <span
                      className={`admin-status-badge ${
                        product.isActive !== false ? 'active' : 'inactive'
                      }`}
                    >
                      {product.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {product.featured ? (
                      <span className="admin-status-badge active">Yes</span>
                    ) : (
                      <span className="admin-table-empty">—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="admin-edit-button"
                      onClick={() => handleEdit(product)}
                      title="Edit Product"
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;

