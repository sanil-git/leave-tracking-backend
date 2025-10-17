import React from 'react';
import { Building2, Users, Briefcase, Globe, Zap } from 'lucide-react';

/**
 * TrustedBy component - Shows trust indicators with company logos/icons
 * @param {Object} props - Component props
 * @param {string} props.text - Trust text (default: "Trusted by 1000+ teams worldwide")
 * @param {Array} props.companies - Array of company objects with name and icon
 */
const TrustedBy = ({ 
  text = "Trusted by 1000+ teams worldwide",
  companies = [
    { name: "TechCorp", icon: Building2 },
    { name: "StartupHub", icon: Users },
    { name: "Enterprise Inc", icon: Briefcase },
    { name: "Global Solutions", icon: Globe },
    { name: "Innovation Labs", icon: Zap }
  ]
}) => {
  return (
    <div className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Text */}
        <div className="text-center mb-8">
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            {text}
          </p>
        </div>
        
        {/* Company Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {companies.map((company, index) => {
            const IconComponent = company.icon;
            return (
              <div 
                key={index}
                className="flex items-center justify-center opacity-60 hover:opacity-80 transition-opacity duration-300"
                title={company.name}
              >
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-6 h-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-400 hidden sm:block">
                    {company.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
