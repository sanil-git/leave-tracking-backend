import React from 'react';
import { Calendar, Plane, Lightbulb } from 'lucide-react';

/**
 * Features component - Displays the main feature cards in a grid layout with Lucide icons
 * @param {Object} props - Component props
 * @param {Array} props.features - Array of feature objects with icon, title, description, and iconComponent
 */
const Features = ({ 
  features = [
    {
      icon: Calendar,
      title: "Track Leave",
      description: "Monitor your EL, SL, and CL balances with real-time updates",
      iconColor: "text-purple-600"
    },
    {
      icon: Plane,
      title: "Plan Vacations",
      description: "Plan multi-day vacations with smart date validation",
      iconColor: "text-green-600"
    },
    {
      icon: Lightbulb,
      title: "AI Insights",
      description: "Get smart recommendations for optimal vacation timing",
      iconColor: "text-blue-600"
    }
  ]
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center group cursor-pointer"
          >
            <div 
              className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors duration-300"
              aria-label={`${feature.title} feature icon`}
            >
              <IconComponent 
                className={`w-6 h-6 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
                aria-hidden="true"
              />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {feature.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Features;
