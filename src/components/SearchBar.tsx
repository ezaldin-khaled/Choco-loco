import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductSearch } from '../hooks/useProductSearch';
import './SearchBar.css';

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { 
    searchQuery, 
    setSearchQuery, 
    results, 
    loading 
  } = useProductSearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(query.length >= 2);
  };

  const handleProductClick = (product: { id: string; slug?: string }) => {
    // Use ID for navigation as ProductPage expects ID in the route
    navigate(`/product/${product.id}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2) {
      setShowResults(true);
    }
  };

  const primaryImage = (product: typeof results[0]) => {
    return product.images?.find(img => img.isPrimary) || product.images?.[0];
  };

  return (
    <div ref={searchRef} className="search-container-wrapper">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="What are you looking for?"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="search-input"
        />
        <button type="submit" className="search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showResults && (
        <div className="search-results-dropdown">
          {loading && (
            <div className="search-loading">Searching...</div>
          )}
          
          {!loading && results.length === 0 && searchQuery.length >= 2 && (
            <div className="search-no-results">
              No products found for "{searchQuery}"
            </div>
          )}
          
          {!loading && results.length > 0 && (
            <ul className="search-results-list">
              {results.map((product) => {
                const image = primaryImage(product);
                return (
                  <li
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="search-result-item"
                  >
                    <div className="result-image">
                      {image ? (
                        <img
                          src={image.image}
                          alt={product.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="no-image" style={{ display: image ? 'none' : 'flex' }}>
                        📦
                      </div>
                    </div>
                    
                    <div className="result-details">
                      <h4>{product.name}</h4>
                      <p className="result-brand">{product.brand?.name || 'Unknown Brand'}</p>
                      <p className="result-category">{product.category?.name || 'Uncategorized'}</p>
                    </div>
                    
                    <div className="result-price">
                      <span className="price">{product.retailPrice} AED</span>
                      {product.inStock ? (
                        <span className="in-stock">✓ In Stock</span>
                      ) : (
                        <span className="out-of-stock">Out of Stock</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

