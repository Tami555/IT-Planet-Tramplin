import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './InputBlock.css';

const InputBlock = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  disabled = false,
  icon = null,
  rows = 3,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const isTextarea = type === 'textarea';

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const newValue = isTextarea ? e.target.value : e.target.value;
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className={`input-block ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`input-field ${icon ? 'with-icon' : ''}`}
            {...props}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={inputType}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`input-field ${icon ? 'with-icon' : ''}`}
            {...props}
          />
        )}
        
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={togglePassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default InputBlock;