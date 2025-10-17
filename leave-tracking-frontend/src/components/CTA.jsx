import React from 'react';

/**
 * CTA component - Full-width gradient call-to-action section with prominent button
 * @param {Object} props - Component props
 * @param {string} props.title - CTA headline
 * @param {string} props.subtitle - CTA supporting text
 * @param {string} props.buttonText - Button text
 * @param {Function} props.onButtonClick - Callback for button click
 */
const CTA = ({ 
  title = "Ready to manage your leave?",
  subtitle = "Join thousands of employees who track their leave efficiently",
  buttonText = "Get Started Now",
  onButtonClick
}) => {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-20" aria-labelledby="cta-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 id="cta-title" className="text-2xl font-bold text-white mb-6">
            {title}
          </h3>
          <p className="text-lg text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <button 
            onClick={onButtonClick}
            className="inline-flex items-center px-10 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-purple-600 transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl min-h-[44px]"
            aria-label={`${buttonText} - Start using PlanWise for leave management`}
          >
            {buttonText}
            <svg 
              className="ml-2 w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
