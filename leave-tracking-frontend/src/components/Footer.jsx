import React from 'react';

/**
 * Footer component - Site footer with navigation links and trust indicators
 * @param {Object} props - Component props
 * @param {string} props.tagline - Footer tagline
 * @param {string} props.trustIndicator - Trust indicator text
 * @param {Array} props.links - Array of footer links
 */
const Footer = ({ 
  tagline = "Smart leave planning for modern teams",
  trustIndicator = "Used by 3,000+ employees",
  links = [
    { label: "About", href: "#about" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "#docs" },
    { label: "Contact", href: "#contact" },
    { label: "Privacy", href: "#privacy" }
  ]
}) => {
  return (
    <footer className="bg-white border-t border-gray-200" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Tagline and trust indicator */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              {tagline}
            </p>
            <div className="flex items-center space-x-2">
              <svg 
                className="w-4 h-4 text-green-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="text-sm text-gray-500 font-medium">
                {trustIndicator}
              </span>
            </div>
          </div>

          {/* Right side - Navigation links */}
          <nav className="flex flex-wrap justify-center md:justify-end items-center space-x-6" aria-label="Footer navigation">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm text-gray-500 hover:text-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md px-1 py-1"
                aria-label={`Navigate to ${link.label} page`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom section - Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-gray-400 text-center sm:text-left">
              © 2024 PlanWise. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400">
                Made with ❤️ for better leave management
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;