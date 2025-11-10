import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { useEffect } from 'react';
import { apolloClient, getSessionKey } from './lib/graphqlClient';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';
import ProductPage from './components/ProductPage';
import Cart from './components/Cart';
import Brands from './components/Brands';
import BrandPage from './components/BrandPage';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import PaymentFailure from './components/PaymentFailure';
import './App.css';

function App() {
  // Initialize cart session on app load
  useEffect(() => {
    getSessionKey();
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <Routes>
              <Route path="/" element={
                <>
                  <Header />
                  <Hero />
                  <Categories />
                  <Products />
                  <Footer />
                </>
              } />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/category/:categoryId" element={
                <>
                  <Header />
                  <Products />
                  <Footer />
                </>
              } />
              <Route path="/brands" element={<Brands />} />
              <Route path="/brand/:brandName" element={<BrandPage />} />
              <Route path="/search" element={
                <>
                  <Header />
                  <Products />
                  <Footer />
                </>
              } />
              <Route path="/cart" element={
                <>
                  <Header />
                  <Cart />
                  <Footer />
                </>
              } />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/payment/failure" element={<PaymentFailure />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
