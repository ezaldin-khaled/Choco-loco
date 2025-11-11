import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { API_URL, BACKEND_URL, MEDIA_URL } from './config/api';

// Add initialization logging
console.log('🚀 Starting app initialization...');
console.log('Environment:', process.env['NODE_ENV']);
console.log('Page protocol:', typeof window !== 'undefined' ? window.location.protocol : 'N/A');
console.log('API URL (resolved):', API_URL);
console.log('Backend URL (resolved):', BACKEND_URL);
console.log('Media URL (resolved):', MEDIA_URL);
console.log('API URL (env):', process.env['REACT_APP_API_URL'] || 'not set (using auto-detection)');
console.log('Backend URL (env):', process.env['REACT_APP_BACKEND_URL'] || 'not set (using auto-detection)');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ CRITICAL: Root element not found!');
  document.body.innerHTML = '<h1 style="padding: 40px; color: red; text-align: center;">Error: Root element not found!</h1>';
} else {
  console.log('✅ Root element found');
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ CRITICAL: Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: red; margin-bottom: 20px;">Failed to render app</h1>
        <pre style="background: #f5f5f5; padding: 20px; border-radius: 4px; text-align: left; max-width: 800px; margin: 0 auto;">${error}</pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; font-size: 16px; cursor: pointer; background: #1976d2; color: white; border: none; border-radius: 4px;">Reload Page</button>
      </div>
    `;
  }
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error filename:', event.filename);
  console.error('Error lineno:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});
