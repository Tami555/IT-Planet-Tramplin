import React from 'react';
import './FormContainer.css';

const FormContainer = ({ 
  children, 
  title, 
  subtitle, 
  onSubmit,
  className = '' 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className={`form-container ${className}`}>
      <div className="form-card">
        {title && <h2 className="form-title">{title}</h2>}
        {subtitle && <p className="form-subtitle">{subtitle}</p>}
        <form onSubmit={handleSubmit} className="form-content">
          {children}
        </form>
      </div>
    </div>
  );
};

export default FormContainer;