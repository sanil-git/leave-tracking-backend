import React, { useMemo } from 'react';

/**
 * Hero component - Main hero section with two-column layout, headline, CTAs, and dashboard mock
 * @param {Object} props - Component props
 * @param {string} props.headline - Main hero headline
 * @param {string} props.subtext - Hero subtext/description
 * @param {Function} props.onGetStarted - Callback for primary CTA click
 * @param {Function} props.onSeeDemo - Callback for secondary CTA click
 */
const Hero = ({ 
  headline = "Smart Leave Planning",
  subtext = "Track holidays, plan vacations, and discover long weekends with AI-powered insights. Save time and money with intelligent leave management.",
  onGetStarted,
  onSeeDemo
}) => {
  // Function to scroll to the ProductDemo section
  const handleSeeDemo = () => {
    const productDemoElement = document.getElementById('product-demo');
    if (productDemoElement) {
      productDemoElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else if (onSeeDemo) {
      onSeeDemo();
    }
  };
  // Generate current month calendar data
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get first day of month and how many days to show from previous month
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    
    // Generate 35 days (5 weeks) to fill the calendar grid
    for (let i = 0; i < 35; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const dayNumber = currentDate.getDate();
      
      days.push({
        dayNumber,
        isCurrentMonth,
        isToday,
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      monthName: now.toLocaleDateString('en-US', { month: 'long' }),
      year: year,
      days: days
    };
  }, []);
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:items-center">
          {/* Left Column - Content */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight animate-fade-in">
              Smart <span className="text-purple-700">Leave Planning</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0 animate-fade-in-delay">
              {subtext}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-6 lg:mb-8">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-8 py-4 font-semibold text-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 min-h-[44px]"
                aria-label="Get started with PlanWise for free"
              >
                Get Started Free
              </button>
              <button
                onClick={handleSeeDemo}
                className="border-2 border-purple-600 text-purple-600 rounded-full px-8 py-4 font-semibold text-lg hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 min-h-[44px]"
                aria-label="Watch a demo of PlanWise"
              >
                See Demo
              </button>
            </div>
            
            {/* Microcopy */}
            <p className="text-sm text-gray-500 text-center md:text-left">
              No credit card required • Free forever plan available
            </p>
          </div>

          {/* Right Column - Minimal Calendar Preview */}
          <div className="flex justify-center w-full lg:w-auto lg:justify-end">
            <div className="relative animate-fade-in-delay-2 w-full max-w-xs sm:max-w-sm" role="img" aria-label="PlanWise calendar preview">
              {/* Minimal Calendar Card */}
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                {/* Calendar Header */}
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500 mb-2">PlanWise Calendar</div>
                  <h3 className="text-lg font-semibold text-gray-800">{currentMonthData.monthName} {currentMonthData.year}</h3>
                </div>

                {/* Simple Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-gray-400 py-1 font-medium text-xs">{day}</div>
                  ))}
                  {currentMonthData.days.map((day, i) => (
                    <div key={i} className={`text-center py-1 rounded text-xs ${
                      day.isToday ? 'bg-purple-600 text-white font-bold' :
                      !day.isCurrentMonth ? 'text-gray-300' :
                      day.isWeekend ? 'text-gray-400 bg-gray-50' :
                      'text-gray-600 hover:bg-gray-50'
                    }`}>
                      {day.isCurrentMonth ? day.dayNumber : ''}
                    </div>
                  ))}
                </div>

                {/* Simple Status Indicator */}
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Smart Planning Active
                  </div>
                </div>
              </div>

              {/* Subtle Floating Element */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs text-white">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
