// SuccessNotification.js - Let's try a different approach
import React, { useEffect } from 'react';

const SuccessNotification = ({ successInfo, onClose }) => {
  useEffect(() => {
    if (successInfo?.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successInfo?.show, onClose]);

  if (!successInfo?.show) return null;

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: '80px', // Position it below the header/overlay
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999, // Extremely high z-index
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '16px 24px',
        borderRadius: '6px',
        border: '1px solid #c3e6cb',
        minWidth: '350px',
        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        fontWeight: '500'
      }}
    >
      <span style={{ marginRight: '12px', fontSize: '20px', color: '#28a745' }}>
        ✓
      </span>
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: '17px' }}>Success!</strong> 
        <span style={{ marginLeft: '8px' }}>
          {successInfo.message || "Question added successfully."} 
        </span>
      </div>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          marginLeft: '16px',
          cursor: 'pointer',
          fontSize: '20px',
          color: '#155724',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        ×
      </button>
    </div>
  );
};

export default SuccessNotification;