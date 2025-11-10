import React from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './BrandPage.css';

const BrandPage: React.FC = () => {
  const { brandName } = useParams<{ brandName: string }>();

  // Sample brand data - in a real app, this would come from an API
  const brandData = {
    'vita-belgian': {
      name: 'vita Belgian',
      icon: '🌿',
      description: 'Vité is a premium manufacturer of chocolate chips and cream solutions. We offer three high-quality varieties: dark, milk, and white chocolate chips, along with multi-functional cream products.',
      products: [
        {
          id: 1,
          name: 'DARK CHOCOLATE CHIPS 70%',
          supplier: 'BY vita',
          details: 'Belgium Blend Butter 31AED per kg Bucket Wight 10kg',
          origin: 'Belgian',
          price: 'Per KG 50 AED',
          image: '/Assets/Products/Products (1).png'
        },
        {
          id: 2,
          name: 'WHITE CHOCOLATE CHIPS 29%',
          supplier: 'BY vita',
          details: 'Belgium Blend Butter 31AED per kg Bucket Wight 10kg',
          origin: 'Belgian',
          price: 'Per KG 50 AED',
          image: '/Assets/Products/Products (2).png'
        },
        {
          id: 3,
          name: 'PINK CHOCOLATE CHIPS 70%',
          supplier: 'BY vita',
          details: 'Belgium Blend Butter 31AED per kg Bucket Wight 10kg',
          origin: 'Belgian',
          price: 'Per KG 50 AED',
          image: '/Assets/Products/Products (3).png'
        },
        {
          id: 4,
          name: 'WHITE CHOCOLATE CHIPS 29%',
          supplier: 'BY vita',
          details: 'Belgium Blend Butter 31AED per kg Bucket Wight 10kg',
          origin: 'Belgian',
          price: 'Per KG 50 AED',
          image: '/Assets/Products/Products (4).png'
        }
      ]
    }
  };

  const brand = brandData[brandName as keyof typeof brandData] || brandData['vita-belgian'];

  return (
    <div className="brand-page">
      <Header />
      
      <main className="brand-main">
        <div className="container">
          {/* Brand Introduction Section */}
          <section className="brand-intro">
            <div className="brand-header">
              <div className="brand-icon">
                <span className="icon-text">Vite</span>
                <span className="leaf-icon">🌿</span>
              </div>
              <h1 className="brand-title">{brand.name}</h1>
            </div>
            
            <div className="brand-description">
              <p>{brand.description}</p>
              <p>{brand.description}</p>
            </div>
          </section>

          {/* Products Section */}
          <section className="products-section">
            <div className="products-grid">
              {brand.products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-supplier">{product.supplier}</p>
                    <p className="product-details">{product.details}</p>
                    <p className="product-origin">{product.origin}</p>
                    <p className="product-price">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrandPage;
