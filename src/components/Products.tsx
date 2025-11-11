import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAddToCart } from '../hooks/useCart';
import { useCategories } from '../hooks/useCategories';
import { getImageUrl } from '../config/api';
import './Products.css';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  const searchQuery = queryParams.get('q');
  
  // Use categoryId from URL params or query string
  const activeCategoryId = categoryId || categoryParam || undefined;
  
  const { products, loading, error } = useProducts({ 
    limit: 100, 
    ...(activeCategoryId && { category: activeCategoryId }),
    ...(searchQuery && { search: searchQuery })
  });
  const { categories } = useCategories();
  const { addToCart, loading: addingToCart } = useAddToCart();
  
  // Get category name for display
  const activeCategory = categories.find(cat => cat.id === activeCategoryId);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    try {
      await addToCart(productId, undefined, 1);
      // Could show a success notification here
    } catch (err) {
      console.error('Error adding to cart:', err);
      // Could show an error notification here
    }
  };

  if (loading) {
    return (
      <section className="products section">
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <div className="section-subtitle">
                <div className="section-indicator"></div>
                <span className="section-indicator-text">Our Products</span>
              </div>
              <h2 className="section-title">Explore Our Products</h2>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="products section">
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <div className="section-subtitle">
                <div className="section-indicator"></div>
                <span className="section-indicator-text">Our Products</span>
              </div>
              <h2 className="section-title">Explore Our Products</h2>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            Error: {error}
          </div>
        </div>
      </section>
    );
  }

  // Format price display
  const formatPrice = (product: typeof products[0]) => {
    if (!product.prices || product.prices.length === 0) {
      return 'Price on request';
    }
    const price = product.prices[0];
    if (!price) return 'Price on request';
    const displayPrice = price.salePrice || price.basePrice;
    if (!displayPrice) return 'Price on request';
    return `${displayPrice} AED`;
  };

  return (
    <section className="products section">
      <div className="container">
        <div className="section-header">
          <div className="section-header-left">
            <div className="section-subtitle">
              <div className="section-indicator"></div>
              <span className="section-indicator-text">
                {activeCategory ? activeCategory.name : 'Our Products'}
              </span>
            </div>
            <h2 className="section-title">
              {searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : activeCategory 
                  ? `${activeCategory.name} Products` 
                  : 'Explore Our Products'}
            </h2>
            {(activeCategory || searchQuery) && (
              <button 
                onClick={() => navigate('/')}
                style={{ 
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← View All Products
              </button>
            )}
          </div>
          <div className="section-controls">
            <button className="btn-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="products-grid">
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>
              No products found
            </div>
          ) : (
            products.map((product) => {
              // Sort images by displayOrder
              const sortedImages = product.images
                ? [...product.images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                : [];
              const primaryImage = sortedImages.find(img => img.isPrimary)?.image || 
                                   sortedImages[0]?.image || '';
              const primaryImageObj = sortedImages.find(img => img.isPrimary) || sortedImages[0];
              
              return (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    <img 
                      src={getImageUrl(primaryImage)} 
                      alt={primaryImageObj?.altText || product.name}
                      onError={(e) => {
                        e.currentTarget.src = '/Assets/logo.png';
                      }}
                    />
                  <div className="product-actions">
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                      title="View Product"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="action-btn"
                      onClick={(e) => handleAddToCart(e, product.id)}
                      disabled={addingToCart}
                      title="Add to Cart"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-brand">{product.brand?.name || 'N/A'}</p>
                  <p className="product-description">{product.description || ''}</p>
                  <div className="product-price">{formatPrice(product)}</div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;
