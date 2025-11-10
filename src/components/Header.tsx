import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBrands } from '../hooks/useBrands';
import SearchBar from './SearchBar';
import './Header.css';

const Header: React.FC = () => {
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { brands, loading } = useBrands();

  // Filter and sort brands for dropdown
  const displayBrands = useMemo(() => {
    return brands
      .filter(brand => brand.isActive !== false) // Show brands that are active or don't have isActive set
      .sort((a, b) => {
        // Sort by displayOrder if available, otherwise by name
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          return a.displayOrder - b.displayOrder;
        }
        if (a.displayOrder !== undefined) return -1;
        if (b.displayOrder !== undefined) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [brands]);

  const handleBrandsMouseEnter = () => {
    // Clear any existing timeout
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsBrandsDropdownOpen(true);
  };

  const handleBrandsMouseLeave = () => {
    // Add delay before closing dropdown
    const timeout = setTimeout(() => {
      setIsBrandsDropdownOpen(false);
    }, 300); // 300ms delay
    setDropdownTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    // Clear timeout when mouse enters dropdown
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    // Add delay before closing dropdown
    const timeout = setTimeout(() => {
      setIsBrandsDropdownOpen(false);
    }, 300); // 300ms delay
    setDropdownTimeout(timeout);
  };

  const handleBrandsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/brands');
  };

  const handleBrandClick = (brandSlug: string) => {
    // Handle brand selection - navigate to brand page
    navigate(`/brand/${brandSlug}`);
    setIsBrandsDropdownOpen(false);
  };

  const handleViewAllBrandsClick = () => {
    // Navigate to brands page
    navigate('/brands');
    setIsBrandsDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <img src="/Assets/logo.png" alt="Premium Choco" className="logo-image" />
          </div>

          {/* Navigation */}
          <nav className="nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <div 
              className="nav-dropdown"
              onMouseEnter={handleBrandsMouseEnter}
              onMouseLeave={handleBrandsMouseLeave}
            >
              <a href="/brands" className={`nav-link ${location.pathname === '/brands' ? 'active' : ''}`} onClick={handleBrandsClick}>brands</a>
              {isBrandsDropdownOpen && (
                <div 
                  className="dropdown-menu"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  {loading ? (
                    <div className="dropdown-item">
                      <div className="brand-name">Loading brands...</div>
                    </div>
                  ) : displayBrands.length === 0 ? (
                    <div className="dropdown-item">
                      <div className="brand-name">No brands available</div>
                    </div>
                  ) : (
                    <>
                      {displayBrands.map((brand) => (
                        <div 
                          key={brand.id}
                          className="dropdown-item"
                          onClick={() => handleBrandClick(brand.slug)}
                        >
                          <div className="brand-name">{brand.name}</div>
                          <div className="brand-description">
                            {brand.description || brand.countryOfOrigin || ''}
                          </div>
                        </div>
                      ))}
                      <div className="dropdown-divider"></div>
                      <div 
                        className="dropdown-item dropdown-item-special"
                        onClick={handleViewAllBrandsClick}
                      >
                        <div className="brand-name">View All Brands</div>
                        <div className="brand-description">See complete brand collection</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <a href="#offers" className={`nav-link ${location.pathname.includes('offers') ? 'active' : ''}`}>offers</a>
          </nav>

          {/* Right side container */}
          <div className="header-right">
            {/* Search Bar */}
            <SearchBar />

            {/* Action Icons */}
            <div className="action-icons">
              <Link to="/cart" className="icon-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
