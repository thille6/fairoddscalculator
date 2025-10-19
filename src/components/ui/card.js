import React from 'react';

export const Card = ({ children, className, ...props }) => {
  return (
    <div className={`rounded-lg border ${className || ''}`} {...props}>
      {children}
    </div>
  );
};