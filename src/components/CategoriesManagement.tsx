import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES, CREATE_CATEGORY } from '../lib/queries';
import './CategoriesManagement.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

const CategoriesManagement: React.FC = () => {
  // Authorization is handled entirely by the backend via JWT token
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    displayOrder: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, error: queryError } = useQuery(GET_CATEGORIES);
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
    onCompleted: () => {
      setSuccess('Category created successfully!');
      setError('');
      setFormData({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        displayOrder: 1,
      });
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      console.error('Category creation error:', err);
      let errorMessage = 'Failed to create category';
      
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

  const categories: Category[] = data?.categories ? [...data.categories] : [];

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

    console.log('[Category] Creating category - authorization handled by backend via JWT token');

    try {
      // The authLink in graphqlClient.ts already adds the Authorization header
      // So we don't need to add it again in context
      await createCategory({
        variables: {
          input: {
            name: formData.name.trim(),
            slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
            description: formData.description.trim() || null,
            isActive: formData.isActive,
            displayOrder: formData.displayOrder,
          },
        },
      });
    } catch (err: any) {
      // Error handled in onError callback
      console.error('Create category error:', err);
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
    return <div className="admin-loading">Loading categories...</div>;
  }

  return (
    <div className="admin-categories">
      <div className="admin-categories-header">
        <h2>Categories Management</h2>
        <button
          className="admin-add-button"
          onClick={() => setShowForm(!showForm)}
          disabled={creating}
        >
          {showForm ? 'Cancel' : '+ Add New Category'}
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-success-message">{success}</div>}

      {showForm && (
        <form className="admin-category-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                placeholder="e.g., Dark Chocolate"
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
                placeholder="e.g., dark-chocolate"
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
              placeholder="Category description (optional)"
            />
          </div>

          <div className="admin-form-row">
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
            <button type="submit" className="admin-submit-button" disabled={creating}>
              {creating ? 'Creating...' : 'Create Category'}
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
          Error loading categories: {queryError.message}
        </div>
      )}

      <div className="admin-categories-list">
        {categories.length === 0 ? (
          <div className="admin-empty-state">No categories found. Create your first category above.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Display Order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {categories
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((category) => (
                  <tr key={category.id}>
                    <td className="admin-table-name">{category.name}</td>
                    <td className="admin-table-slug">{category.slug}</td>
                    <td className="admin-table-description">
                      {category.description || <span className="admin-table-empty">—</span>}
                    </td>
                    <td className="admin-table-order">{category.displayOrder || 0}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          category.isActive !== false ? 'active' : 'inactive'
                        }`}
                      >
                        {category.isActive !== false ? 'Active' : 'Inactive'}
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

export default CategoriesManagement;

