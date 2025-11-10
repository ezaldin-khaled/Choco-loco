import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CategoriesManagement from './CategoriesManagement';
import BrandsManagement from './BrandsManagement';
import ProductsManagement from './ProductsManagement';
import InventoryManagement from './InventoryManagement';
import PriceCatalogManagement from './PriceCatalogManagement';
import VariantsManagement from './VariantsManagement';
import OrdersManagement from './OrdersManagement';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'products' | 'categories' | 'brands' | 'orders' | 'inventory' | 'priceCatalog' | 'variants'>('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '🍫' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'brands', label: 'Brands', icon: '🏷️' },
    { id: 'variants', label: 'Variants', icon: '🎨' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'priceCatalog', label: 'Price Catalog', icon: '💰' },
    { id: 'orders', label: 'Orders', icon: '🚚' },
  ];

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src="/Assets/logo.png" alt="Logo" className="admin-sidebar-logo" />
          <h2 className="admin-sidebar-title">Admin Panel</h2>
        </div>

        <nav className="admin-sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`admin-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
            >
              <span className="admin-sidebar-icon">{section.icon}</span>
              <span className="admin-sidebar-label">{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-button">
            <span className="admin-sidebar-icon">🚪</span>
            <span className="admin-sidebar-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">
              {sections.find(s => s.id === activeSection)?.label || 'Dashboard'}
            </h1>
            {user && (
              <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
                Logged in as: <strong>{user.username}</strong> ({user.email})
              </p>
            )}
          </div>
          <div className="admin-header-actions">
            <a href="/" className="admin-store-link" target="_blank" rel="noopener noreferrer">
              View Store →
            </a>
          </div>
        </header>

        <div className="admin-content">
          {activeSection === 'dashboard' && (
            <div className="admin-dashboard">
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">🍫</div>
                  <div className="admin-stat-content">
                    <h3 className="admin-stat-label">Total Products</h3>
                    <p className="admin-stat-value">0</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">📁</div>
                  <div className="admin-stat-content">
                    <h3 className="admin-stat-label">Categories</h3>
                    <p className="admin-stat-value">0</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">🏷️</div>
                  <div className="admin-stat-content">
                    <h3 className="admin-stat-label">Brands</h3>
                    <p className="admin-stat-value">0</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">📦</div>
                  <div className="admin-stat-content">
                    <h3 className="admin-stat-label">Total Orders</h3>
                    <p className="admin-stat-value">0</p>
                  </div>
                </div>
              </div>

              <div className="admin-welcome-section">
                <h2>Welcome to the Admin Panel</h2>
                <p>Use the navigation menu to manage your store's products, categories, brands, and orders.</p>
              </div>
            </div>
          )}

          {activeSection === 'products' && (
            <div className="admin-section">
              <ProductsManagement />
            </div>
          )}

          {activeSection === 'categories' && (
            <div className="admin-section">
              <CategoriesManagement />
            </div>
          )}

          {activeSection === 'brands' && (
            <div className="admin-section">
              <BrandsManagement />
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className="admin-section">
              <InventoryManagement />
            </div>
          )}

          {activeSection === 'priceCatalog' && (
            <div className="admin-section">
              <PriceCatalogManagement />
            </div>
          )}

          {activeSection === 'variants' && (
            <div className="admin-section">
              <VariantsManagement />
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="admin-section">
              <OrdersManagement />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
