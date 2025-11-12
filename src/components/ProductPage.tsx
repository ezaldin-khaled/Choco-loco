import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useAddToCart } from '../hooks/useCart';
import { getImageUrl } from '../config/api';
import Header from './Header';
import Footer from './Footer';
import './ProductPage.css';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { product, loading, error } = useProduct(id || '');
  const { products: relatedProductsData } = useProducts({ limit: 4 });
  const { addToCart, loading: addingToCart } = useAddToCart();

  // Filter out current product from related products
  const relatedProducts = relatedProductsData.filter(p => p.id !== id).slice(0, 3);

  // Get default variant or first available variant
  const defaultVariant = product?.variants?.find(v => v.isDefault) || product?.variants?.[0];
  const [selectedVariant, setSelectedVariant] = useState<typeof defaultVariant>(undefined);

  // Update selected variant when product loads
  useEffect(() => {
    if (product?.variants) {
      const defaultV = product.variants.find(v => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultV);
    }
  }, [product]);

  // Format price - prioritize variant price, then product prices
  const formatPrice = () => {
    if (selectedVariant?.effectivePrice) {
      return `${selectedVariant.effectivePrice} AED`;
    }
    if (selectedVariant?.salePrice) {
      return `${selectedVariant.salePrice} AED`;
    }
    if (selectedVariant?.price) {
      return `${selectedVariant.price} AED`;
    }
    
    if (!product?.prices || product.prices.length === 0) {
      return 'Price on request';
    }
    const price = product.prices.find(p => p.isActive) || product.prices[0];
    if (!price) {
      return 'Price on request';
    }
    const displayPrice = price.salePrice || price.basePrice;
    if (!displayPrice) {
      return 'Price on request';
    }
    return `${displayPrice} AED`;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      const variantId = selectedVariant?.id;
      await addToCart(product.id, variantId, quantity);
      // Could show a success message here
      alert('Product added to cart!');
    } catch (err) {
      alert('Failed to add product to cart');
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Get use case images from product, sorted by displayOrder
  const useCaseImages = product?.usecaseImages
    ? [...product.usecaseImages]
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .slice(0, 4)
    : [];
  
  // Get primary image - find image with isPrimary: true, or first image, sorted by displayOrder
  const sortedImages = product?.images
    ? [...product.images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : [];
  const primaryImageObj = sortedImages.find(img => img.isPrimary) || sortedImages[0];
  const primaryImage = primaryImageObj?.image || '';
  
  // State for selected image
  const [selectedImage, setSelectedImage] = useState<string>(primaryImage);
  
  // Update selected image when product loads
  useEffect(() => {
    if (primaryImage) {
      setSelectedImage(primaryImage);
    }
  }, [primaryImage]);

  if (loading) {
    return (
      <div className="product-page">
        <Header />
        <main className="product-main">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '4rem' }}>Loading product...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page">
        <Header />
        <main className="product-main">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '4rem', color: 'red' }}>
              {error || 'Product not found'}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-page">
      <Header />

      {/* Main Product Section */}
      <main className="product-main">
        <div className="container">
          <div className="product-details">
            <div className="product-image-section">
              <div className="product-images-wrapper">
                {/* Thumbnail gallery on the left */}
                {sortedImages.length > 1 && (
                  <div className="product-thumbnails">
                    {sortedImages.map((img) => (
                      <div
                        key={img.id}
                        className={`thumbnail-item ${selectedImage === img.image ? 'active' : ''}`}
                        onClick={() => setSelectedImage(img.image)}
                      >
                        <img
                          src={getImageUrl(img.image)}
                          alt={img.altText || product.name}
                          onError={(e) => {
                            e.currentTarget.src = '/Assets/logo.png';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Main image container */}
                <div className="product-image-container">
                  <img 
                    src={getImageUrl(selectedImage)} 
                    alt={sortedImages.find(img => img.image === selectedImage)?.altText || primaryImageObj?.altText || product.name} 
                    className="product-main-image"
                    onError={(e) => {
                      e.currentTarget.src = '/Assets/logo.png';
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="product-info-section">
              <h1 className="product-title">{product.name}</h1>
              {product.brand && (
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>
                  <p>Brand: {product.brand.name}</p>
                  {product.brand.countryOfOrigin && (
                    <p>Origin: {product.brand.countryOfOrigin}</p>
                  )}
                </div>
              )}
              <p className="product-description">
                {product.shortDescription || product.description || ''}
              </p>
              {product.description && product.shortDescription && product.description !== product.shortDescription && (
                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Full Description</summary>
                  <p style={{ marginTop: '0.5rem' }}>{product.description}</p>
                </details>
              )}
              {product.ingredients && (
                <div style={{ marginTop: '1rem' }}>
                  <h4>Ingredients:</h4>
                  <p>{product.ingredients}</p>
                </div>
              )}
              {product.allergenInfo && (
                <div style={{ marginTop: '1rem' }}>
                  <h4>Allergen Information:</h4>
                  <p>{product.allergenInfo}</p>
                </div>
              )}
              {(product.weight || product.volume) && (
                <div style={{ marginTop: '1rem' }}>
                  <p>
                    {product.weight && `Weight: ${product.weight}${product.unitType || 'g'}`}
                    {product.weight && product.volume && ' | '}
                    {product.volume && `Volume: ${product.volume}${product.unitType || 'ml'}`}
                  </p>
                </div>
              )}
              <div className="price-section">
                <span className="price-label">From</span>
                <span className="product-price">{formatPrice()}</span>
              </div>
              
              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Select Variant:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {product.variants.map((variant) => (
                      <label 
                        key={variant.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          border: selectedVariant?.id === variant.id ? '2px solid #007bff' : '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        <input
                          type="radio"
                          name="variant"
                          value={variant.id}
                          checked={selectedVariant?.id === variant.id}
                          onChange={() => setSelectedVariant(variant)}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold' }}>
                            {variant.optionValues?.map(ov => ov.value).join(' / ') || variant.sku}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {variant.effectivePrice || variant.salePrice || variant.price ? 
                              `Price: ${variant.effectivePrice || variant.salePrice || variant.price} AED` : 
                              'Price on request'}
                            {variant.quantityInStock !== undefined && (
                              ` | Stock: ${variant.quantityInStock}`
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="quantity-selector">
                <button 
                  className="quantity-btn minus"
                  onClick={() => handleQuantityChange(-1)}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn plus"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
              
              {/* Stock status */}
              {(selectedVariant || product.inventory) && (
                <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {selectedVariant?.isInStock === false || (product.inventory && !product.inventory.isInStock) ? (
                    <p style={{ color: 'red', fontWeight: 'bold' }}>Out of Stock</p>
                  ) : (
                    <p style={{ color: 'green' }}>
                      In Stock
                      {selectedVariant?.quantityInStock !== undefined && (
                        ` (${selectedVariant.quantityInStock} available)`
                      )}
                      {!selectedVariant && product.inventory?.quantityInStock !== undefined && (
                        ` (${product.inventory.quantityInStock} available)`
                      )}
                    </p>
                  )}
                </div>
              )}
              
              <div className="action-buttons">
                <button 
                  className="btn-add-cart" 
                  onClick={handleAddToCart}
                  disabled={addingToCart || (selectedVariant?.isInStock === false) || (product.inventory && !product.inventory.isInStock)}
                >
                  {addingToCart ? 'Adding...' : 'Add to cart'}
                </button>
                <button className="btn-wishlist">From Wishlist</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Usage Examples Section - Use case images */}
      {useCaseImages.length > 0 && (
        <section className="usage-examples">
          <div className="container">
            <div className="usage-grid">
              {useCaseImages.map((image: { id: string; image: string; altText?: string }, index: number) => (
                <div key={image.id || index} className="usage-card">
                  <div className="usage-image">
                    <img 
                      src={getImageUrl(image.image)} 
                      alt={image.altText || `${product.name} usage ${index + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = '/Assets/logo.png';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products Section */}
      <section className="related-products">
        <div className="container">
          <div className="related-header">
            <div className="related-indicator">
              <div className="indicator-bar"></div>
              <span className="indicator-text">Our Products</span>
            </div>
            <h2 className="related-title">You may also like</h2>
          </div>
          
          <div className="related-grid">
            {relatedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>
                No related products found
              </div>
            ) : (
              relatedProducts.map((relatedProduct) => {
                const relatedSortedImages = relatedProduct.images
                  ? [...relatedProduct.images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  : [];
                const relatedPrimaryImage = relatedSortedImages.find(img => img.isPrimary)?.image || 
                                           relatedSortedImages[0]?.image || '';
                const relatedPrimaryImageObj = relatedSortedImages.find(img => img.isPrimary) || relatedSortedImages[0];
                
                return (
                  <div 
                    key={relatedProduct.id} 
                    className="related-card"
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="related-image">
                      <img 
                        src={getImageUrl(relatedPrimaryImage)} 
                        alt={relatedPrimaryImageObj?.altText || relatedProduct.name}
                        onError={(e) => {
                          e.currentTarget.src = '/Assets/logo.png';
                        }}
                      />
                    </div>
                    <p className="related-name">{relatedProduct.name}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductPage;
