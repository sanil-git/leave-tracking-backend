import React from 'react';

/**
 * IndianFlag - Optimized SVG component for the Indian flag
 * Replaces emoji 🇮🇳 with proper SVG for better performance and rendering
 */
const IndianFlag = ({ 
  width = 24, 
  height = 16, 
  className = '',
  ...props 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 16"
      className={`inline-block ${className}`}
      role="img"
      aria-label="Indian Flag"
      {...props}
    >
      {/* Saffron stripe */}
      <rect
        x="0"
        y="0"
        width="24"
        height="5.33"
        fill="#FF9933"
      />
      
      {/* White stripe */}
      <rect
        x="0"
        y="5.33"
        width="24"
        height="5.33"
        fill="#FFFFFF"
      />
      
      {/* Green stripe */}
      <rect
        x="0"
        y="10.67"
        width="24"
        height="5.33"
        fill="#138808"
      />
      
      {/* Ashoka Chakra (simplified) */}
      <circle
        cx="12"
        cy="8"
        r="2.5"
        fill="none"
        stroke="#000080"
        strokeWidth="0.3"
      />
      
      {/* Chakra spokes (simplified to 8 main spokes) */}
      <g stroke="#000080" strokeWidth="0.2" fill="none">
        <line x1="12" y1="5.5" x2="12" y2="10.5" />
        <line x1="14.5" y1="8" x2="9.5" y2="8" />
        <line x1="13.77" y1="6.23" x2="10.23" y2="9.77" />
        <line x1="13.77" y1="9.77" x2="10.23" y2="6.23" />
      </g>
      
      {/* Center dot */}
      <circle
        cx="12"
        cy="8"
        r="0.4"
        fill="#000080"
      />
    </svg>
  );
};

export default IndianFlag;
