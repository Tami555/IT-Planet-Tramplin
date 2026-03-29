import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  onClick, 
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  ...props 
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      <span className="btn-text">{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </button>
  );
};

export default Button;