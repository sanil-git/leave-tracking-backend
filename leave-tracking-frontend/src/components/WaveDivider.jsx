import React from 'react';

/**
 * WaveDivider component - Creates a subtle SVG wave transition between sections
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.fillColor - SVG fill color (default: light purple gradient)
 */
const WaveDivider = ({ 
  className = "",
  fillColor = "url(#waveGradient)"
}) => {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-12 sm:h-16 md:h-20 lg:h-24"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="50%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 C300,120 600,0 900,60 C1050,90 1200,30 1200,60 L1200,120 L0,120 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
