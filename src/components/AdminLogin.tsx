import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="admin-login">
        <div className="admin-login-container">
          <div className="admin-login-card">
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/admin');
      }
    } catch (err: any) {
      // Display the error message from the login function
      setError(err?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <img src="/Assets/logo.png" alt="Logo" className="admin-login-logo" />
            <h1 className="admin-login-title">Admin Login</h1>
            <p className="admin-login-subtitle">Enter your credentials to access the admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="admin-login-error">
                {error}
              </div>
            )}

            <div className="admin-login-field">
              <label htmlFor="username" className="admin-login-label">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="admin-login-input"
                placeholder="Enter your username"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="password" className="admin-login-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-login-input"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="admin-login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="admin-login-footer">
            <a href="/" className="admin-login-back-link">
              ← Back to Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
