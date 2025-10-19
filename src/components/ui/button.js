import React from 'react';

export const Button = ({ children, onClick, className, ...props }) => {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};