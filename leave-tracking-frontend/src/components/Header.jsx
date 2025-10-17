import React, { useState } from 'react';

/**
 * Header component - Contains the navigation bar with logo and auth buttons
 * @param {Object} props - Component props
 * @param {Function} props.onSignIn - Callback for sign in button click
 * @param {Function} props.onGetStarted - Callback for get started button click
 * @param {Function} props.onBackToHome - Callback for back to home button click
 * @param {boolean} props.showBackButton - Whether to show back button instead of auth buttons
 */
const Header = ({ onSignIn, onGetStarted, onBackToHome, showBackButton = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              {/* Calendar SVG Icon */}
              <svg 
                className="w-8 h-8 text-purple-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <h1 className="text-2xl font-bold text-purple-600">
                PlanWise
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {showBackButton ? (
              <button
                onClick={onBackToHome}
                className="flex items-center text-gray-600 hover:text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors"
                aria-label="Go back to home page"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="text-gray-600 hover:text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors hover:underline"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </button>
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-6 py-2 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 min-h-[44px]"
                  aria-label="Get started with PlanWise"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md p-2 min-h-[44px]"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Slide-over */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-40">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-25" 
                onClick={closeMobileMenu}
                aria-hidden="true"
              />
              
              {/* Slide-over Panel */}
              <div id="mobile-menu" className="relative ml-auto w-64 h-full bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <svg 
                        className="w-6 h-6 text-purple-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      <span id="mobile-menu-title" className="text-lg font-bold text-purple-600">PlanWise</span>
                    </div>
                    <button
                      onClick={closeMobileMenu}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md p-1"
                      aria-label="Close mobile menu"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Mobile Menu Content */}
                  <div className="flex-1 px-4 py-6 space-y-4">
                    {showBackButton ? (
                      <button
                        onClick={() => {
                          onBackToHome();
                          closeMobileMenu();
                        }}
                        className="flex items-center w-full text-left text-gray-600 hover:text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md px-3 py-2 transition-colors"
                        aria-label="Go back to home page"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onSignIn();
                            closeMobileMenu();
                          }}
                          className="block w-full text-left text-gray-600 hover:text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md px-3 py-2 transition-colors hover:underline"
                          aria-label="Sign in to your account"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            onGetStarted();
                            closeMobileMenu();
                          }}
                          className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-center min-h-[44px]"
                          aria-label="Get started with PlanWise"
                        >
                          Get Started
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
