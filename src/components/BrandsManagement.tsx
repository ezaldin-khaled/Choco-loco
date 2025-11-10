import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BRANDS, CREATE_BRAND } from '../lib/queries';
import './BrandsManagement.css';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  countryOfOrigin?: string;
  isActive?: boolean;
  displayOrder?: number;
}

const BrandsManagement: React.FC = () => {
  // Authorization is handled entirely by the backend via JWT token
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    countryOfOrigin: '',
    isActive: true,
    displayOrder: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, error: queryError } = useQuery(GET_BRANDS);
  const [createBrand, { loading: creating }] = useMutation(CREATE_BRAND, {
    refetchQueries: [{ query: GET_BRANDS }],
    onCompleted: () => {
      setSuccess('Brand created successfully!');
      setError('');
      setFormData({
        name: '',
        slug: '',
        description: '',
        countryOfOrigin: '',
        isActive: true,
        displayOrder: 1,
      });
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Brand creation error:', err);
      let errorMessage = 'Failed to create brand';
      
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

  const brands: Brand[] = data?.brands ? [...data.brands] : [];

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

    console.log('[Brand] Creating brand - authorization handled by backend via JWT token');

    try {
      // The authLink in graphqlClient.ts already adds the Authorization header
      // So we don't need to add it again in context
      await createBrand({
        variables: {
          input: {
            name: formData.name.trim(),
            slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
            description: formData.description.trim() || null,
            countryOfOrigin: formData.countryOfOrigin.trim() || null,
            isActive: formData.isActive,
            displayOrder: formData.displayOrder,
          },
        },
      });
    } catch (err: any) {
      // Error handled in onError callback
      console.error('Create brand error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
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

  if (loading) {
    return <div className="admin-loading">Loading brands...</div>;
  }

  return (
    <div className="admin-brands">
      <div className="admin-brands-header">
        <h2>Brands Management</h2>
        <button
          className="admin-add-button"
          onClick={() => setShowForm(!showForm)}
          disabled={creating}
        >
          {showForm ? 'Cancel' : '+ Add New Brand'}
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-success-message">{success}</div>}

      {showForm && (
        <form className="admin-brand-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="name">Brand Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                placeholder="e.g., Lindt"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="slug">Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                placeholder="e.g., lindt"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="countryOfOrigin">Country of Origin</label>
              <input
                type="text"
                id="countryOfOrigin"
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleInputChange}
                placeholder="e.g., Switzerland"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="displayOrder">Display Order</label>
              <input
                type="number"
                id="displayOrder"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brand description (optional)"
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

          <div className="admin-form-actions">
            <button type="submit" className="admin-submit-button" disabled={creating}>
              {creating ? 'Creating...' : 'Create Brand'}
            </button>
            <button
              type="button"
              className="admin-cancel-button"
              onClick={() => {
                setShowForm(false);
                setError('');
                setFormData({
                  name: '',
                  slug: '',
                  description: '',
                  countryOfOrigin: '',
                  isActive: true,
                  displayOrder: 1,
                });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {queryError && (
        <div className="admin-error-message">
          Error loading brands: {queryError.message}
        </div>
      )}

      <div className="admin-brands-list">
        {brands.length === 0 ? (
          <div className="admin-empty-state">No brands found. Create your first brand above.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Country</th>
                <th>Description</th>
                <th>Display Order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {brands
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((brand) => (
                  <tr key={brand.id}>
                    <td className="admin-table-name">{brand.name}</td>
                    <td className="admin-table-slug">{brand.slug}</td>
                    <td className="admin-table-country">{brand.countryOfOrigin || <span className="admin-table-empty">—</span>}</td>
                    <td className="admin-table-description">
                      {brand.description || <span className="admin-table-empty">—</span>}
                    </td>
                    <td className="admin-table-order">{brand.displayOrder || 0}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          brand.isActive !== false ? 'active' : 'inactive'
                        }`}
                      >
                        {brand.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
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

export default BrandsManagement;

