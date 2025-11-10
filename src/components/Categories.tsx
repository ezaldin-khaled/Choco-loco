import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { getImageUrl } from '../config/api';
import './Categories.css';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(270);
  const [visibleCards, setVisibleCards] = useState(4);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      const container = sliderRef.current?.parentElement;
      const width = container?.clientWidth || window.innerWidth;
      setContainerWidth(width);
      let cards = 4;
      let cardW = 270;

      if (width < 480) {
        cards = 2;
        cardW = 160;
      } else if (width < 768) {
        cards = 2;
        cardW = 180;
      } else if (width < 1024) {
        cards = 3;
        cardW = 200;
      } else {
        cards = 4;
        cardW = 270;
      }

      setVisibleCards(cards);
      setCardWidth(cardW);
      // Reset to first slide if needed
      setCurrentIndex((prev) => {
        const maxIdx = Math.max(0, categories.length - cards);
        return Math.min(prev, maxIdx);
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    // Use ResizeObserver to track container width changes more accurately
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    if (sliderRef.current?.parentElement) {
      resizeObserver.observe(sliderRef.current.parentElement);
    }
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [categories.length]);

  const maxIndex = Math.max(0, categories.length - visibleCards);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex && categories.length > visibleCards;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    }
  };

  // Calculate transform to align cards properly
  const calculateTransform = () => {
    if (currentIndex === 0 || categories.length === 0) {
      return 0;
    }
    
    // Calculate total width of all cards including margins
    // Each card has margin: '15px 15px 0 15px' (top, right, bottom, left)
    // So: 15px left + cardWidth + 15px right = cardWidth + 30px per card
    // But margins collapse, so between cards: 15px (right) + 15px (left) = 30px gap
    // Total: first card left (15px) + all card widths + gaps between + last card right (15px)
    const totalCardsWidth = 15 + (categories.length * cardWidth) + ((categories.length - 1) * 30) + 15;
    
    // Get the actual visible width (container width)
    const visibleWidth = containerWidth || window.innerWidth;
    
    // Calculate maximum transform to prevent sliding past the last card
    const maxTransform = Math.max(0, totalCardsWidth - visibleWidth);
    
    // At the end (maxIndex), use the maximum transform
    if (currentIndex === maxIndex && categories.length > visibleCards) {
      return maxTransform;
    }
    
    // For intermediate positions, move by card width + margins
    // But ensure we never exceed the maximum transform
    const intermediateTransform = currentIndex * (cardWidth + 30);
    return Math.min(intermediateTransform, maxTransform);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <section className="categories section">
      <div className="container">
        <div className="section-header">
          <div className="section-header-left">
            <div className="section-subtitle">
              <div className="section-indicator"></div>
              <span className="section-indicator-text">Categories</span>
            </div>
            <h2 className="section-title">Browse By Category</h2>
          </div>
          <div className="section-controls">
            <button 
              className={`btn-circle ${!canGoPrev ? 'disabled' : ''}`}
              onClick={handlePrev}
              disabled={!canGoPrev}
              aria-label="Previous categories"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className={`btn-circle ${!canGoNext ? 'disabled' : ''}`}
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label="Next categories"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="categories-slider-wrapper" ref={sliderRef}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading categories...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            Error: {error}
          </div>
        ) : (
          <div 
            className="categories-grid"
            style={{
              transform: `translateX(-${calculateTransform()}px)`,
              transition: 'transform 0.4s ease-in-out',
            }}
          >
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>No categories found</div>
            ) : (
              categories.map((category) => (
                <div 
                  key={category.id} 
                  className="category-card"
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    flex: `0 0 ${cardWidth}px`,
                    minWidth: `${cardWidth}px`,
                    width: `${cardWidth}px`,
                    margin: '15px 15px 0 15px',
                  }}
                >
                  <div className="category-image">
                    <img 
                      src={getImageUrl(category.image)} 
                      alt={category.name}
                      onError={(e) => {
                        e.currentTarget.src = '/Assets/logo.png';
                      }}
                    />
                  </div>
                  <div className="category-content">
                    <h3 className="category-name">{category.name}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
