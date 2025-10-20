import React from 'react';

export const Input = ({ value, onChange, className, ...props }) => {
  return (
    <input 
      type="text" 
      value={value} 
      onChange={onChange}
      className={`w-full p-2 rounded-md ${className || ''}`}
      style={{ 
        color: 'var(--input-text)',
        backgroundColor: 'var(--input-bg)'
      }}
      {...props}
    />
  );
};