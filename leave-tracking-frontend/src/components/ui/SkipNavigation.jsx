import React from 'react';

/**
 * SkipNavigation - Accessibility component for keyboard navigation
 * Provides skip links for users navigating with screen readers or keyboard
 */
const SkipNavigation = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-0 left-0 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-md transform -translate-y-full focus:translate-y-0 transition-transform duration-200"
        tabIndex={1}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="absolute top-0 left-24 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-md transform -translate-y-full focus:translate-y-0 transition-transform duration-200"
        tabIndex={2}
      >
        Skip to navigation
      </a>
    </div>
  );
};

export default SkipNavigation;
