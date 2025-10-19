import React from 'react';

export const Tabs = ({ children, value, onValueChange, className }) => {
  // Create a context for sharing state
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass props to all children
          return React.cloneElement(child, {
            activeTab: value,
            onValueChange: onValueChange
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ children, className, activeTab, onValueChange }) => {
  return (
    <div className={`flex rounded-md ${className || ''}`} style={{ borderBottom: '1px solid #374151' }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass props to TabsTrigger children
          return React.cloneElement(child, {
            activeTab: activeTab,
            onValueChange: onValueChange
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsTrigger = ({ children, value, onValueChange, activeTab, className }) => {
  const isActive = activeTab === value;
  
  const handleClick = (e) => {
    e.preventDefault();
    console.log('Tab clicked:', value);
    if (onValueChange && typeof onValueChange === 'function') {
      onValueChange(value);
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      className={`px-4 py-2 flex-1 text-center ${className || ''}`}
      style={{
        color: isActive ? '#3b82f6' : 'white',
        fontWeight: 'bold',
        borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
        background: 'none',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, value, activeTab, className }) => {
  const isActive = activeTab === value;
  
  return (
    <div 
      className={className} 
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
};