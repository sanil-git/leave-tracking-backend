import React from 'react';

const LoadingSkeleton = ({ className = '', width, height, ...props }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  const combinedClasses = `${baseClasses} ${className}`;
  
  const style = {
    ...(width && { width }),
    ...(height && { height }),
    ...props.style
  };

  return (
    <div 
      className={combinedClasses}
      style={style}
      {...props}
    />
  );
};

export default LoadingSkeleton;
