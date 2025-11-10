import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrands } from '../hooks/useBrands';
import Header from './Header';
import './Brands.css';

const Brands: React.FC = () => {
  const navigate = useNavigate();
  const { brands, loading, error } = useBrands();

  const handleBrandClick = (brandSlug: string) => {
    navigate(`/brand/${brandSlug}`);
  };

  return (
    <div className="brands-page">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="brands-main">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-content">
              <div className="page-subtitle">
                <div className="page-indicator"></div>
                <span className="page-indicator-text">Our Brands</span>
              </div>
              <h1 className="page-title">Discover Our Premium Chocolate Brands</h1>
              <p className="page-description">
                Explore our carefully curated collection of world-class chocolate brands, 
                each offering unique flavors and exceptional quality for every chocolate lover.
              </p>
            </div>
          </div>

          {/* Brands Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading brands...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              Error: {error}
            </div>
          ) : (
            <div className="brands-grid">
              {brands.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>No brands found</div>
              ) : (
                brands.map((brand) => (
                  <div 
                    key={brand.id} 
                    className="brand-card"
                    onClick={() => handleBrandClick(brand.slug)}
                  >
                    <div className="brand-card-header">
                      <div className="brand-logo">
                        <img 
                          src="/Assets/logo.png" 
                          alt={`${brand.name} logo`}
                        />
                      </div>
                      <div className="brand-info">
                        <h3 className="brand-name">{brand.name}</h3>
                        {brand.countryOfOrigin && (
                          <div className="brand-meta">
                            <span className="brand-origin">{brand.countryOfOrigin}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="brand-card-content">
                      {brand.description && (
                        <p className="brand-description">{brand.description}</p>
                      )}
                    </div>
                    
                    <div className="brand-card-footer">
                      <button className="brand-action-btn">
                        View Products
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Brands;
