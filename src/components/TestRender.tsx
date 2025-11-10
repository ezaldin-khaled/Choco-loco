import React, { useEffect } from 'react';

const TestRender: React.FC = () => {
  useEffect(() => {
    console.log('✅ TestRender component mounted');
    return () => {
      console.log('✅ TestRender component unmounted');
    };
  }, []);

  console.log('✅ TestRender component is rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#e3f2fd', 
      border: '2px solid #1976d2',
      margin: '20px',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#1976d2', marginBottom: '10px' }}>✅ React is working!</h2>
      <p style={{ marginBottom: '5px' }}>If you see this, React is rendering correctly.</p>
      <p style={{ fontSize: '14px', color: '#666' }}>Time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestRender;

