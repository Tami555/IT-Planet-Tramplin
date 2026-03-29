import { useState } from 'react';

export const useValidation = () => {
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = (fields, validations) => {
    setError('');
    setFieldErrors({});
    
    const errors = {};
    
    for (const [fieldName, value] of Object.entries(fields)) {
      if (validations[fieldName]) {
        const validationResult = validations[fieldName](value, fields);
        if (validationResult) {
          errors[fieldName] = validationResult;
        }
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return false;
    }
    
    return true;
  };

  const clearErrors = () => {
    setError('');
    setFieldErrors({});
  };

  return { error, fieldErrors, validate, clearErrors };
};