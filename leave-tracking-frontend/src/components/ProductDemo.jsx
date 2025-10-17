import React, { useMemo } from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle, Star, Plane, MapPin } from 'lucide-react';

/**
 * ProductDemo component - Interactive-looking dashboard preview showing PlanWise in action
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section subtitle
 */
const ProductDemo = ({ 
  title = "See PlanWise in Action",
  subtitle = "Experience how our AI-powered platform transforms your leave planning"
}) => {
  // Generate current month calendar data with demo events
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get first day of month and how many days to show from previous month
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    // Demo events for the current month
    const demoHolidays = [
      { name: 'Labor Day', date: new Date(year, month, 2) },
      { name: 'Thanksgiving', date: new Date(year, month, 28) }
    ];
    
    const demoVacations = [
      { name: 'Summer Break', startDate: new Date(year, month, 15), endDate: new Date(year, month, 19) },
      { name: 'Weekend Trip', startDate: new Date(year, month, 22), endDate: new Date(year, month, 24) }
    ];
    
    const days = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    
    // Generate 35 days (5 weeks) to fill the calendar grid
    for (let i = 0; i < 35; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const dayNumber = currentDate.getDate();
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      // Check for demo events on this date
      const hasHoliday = demoHolidays.some(holiday => 
        holiday.date.toDateString() === currentDate.toDateString()
      );
      const hasVacation = demoVacations.some(vacation => 
        currentDate >= vacation.startDate && currentDate <= vacation.endDate
      );
      
      days.push({
        dayNumber,
        isCurrentMonth,
        isToday,
        isWeekend,
        hasHoliday,
        hasVacation,
        holidayName: hasHoliday ? demoHolidays.find(h => h.date.toDateString() === currentDate.toDateString())?.name : null,
        vacationName: hasVacation ? demoVacations.find(v => currentDate >= v.startDate && currentDate <= v.endDate)?.name : null
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
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 md:py-20 lg:py-24" id="product-demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
            {subtitle}
          </p>
        </div>

        {/* Interactive Dashboard Preview */}
        <div className="relative scroll-animate">
          {/* Main Dashboard Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">PlanWise Dashboard</h3>
                  <p className="text-sm text-gray-500">Welcome back, Sarah!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left: Full Calendar View */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-800">{currentMonthData.monthName} {currentMonthData.year}</h4>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                        <span className="text-gray-600">‹</span>
                      </button>
                      <button className="w-8 h-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                        <span className="text-gray-600">›</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Full Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                      <div key={i} className="text-center text-gray-500 py-2 font-medium text-sm">{day}</div>
                    ))}
                    {currentMonthData.days.map((day, i) => (
                      <div 
                        key={i} 
                        className={`text-center py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 cursor-pointer relative ${
                          !day.isCurrentMonth ? 'text-gray-300' :
                          day.isToday ? 'bg-purple-600 text-white font-bold shadow-lg' :
                          day.hasHoliday && day.hasVacation ? 'bg-gradient-to-br from-orange-100 to-purple-100 text-gray-800 font-semibold' :
                          day.hasHoliday ? 'bg-orange-100 text-gray-800 font-semibold' :
                          day.hasVacation ? 'bg-purple-100 text-gray-800 font-semibold' :
                          day.isWeekend ? 'text-gray-400 bg-gray-50' :
                          'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={day.holidayName || day.vacationName || ''}
                      >
                        {day.isCurrentMonth ? day.dayNumber : ''}
                        {/* Event indicators */}
                        {day.isCurrentMonth && (day.hasHoliday || day.hasVacation) && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            {day.hasHoliday && (
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" title={day.holidayName}></div>
                            )}
                            {day.hasVacation && (
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" title={day.vacationName}></div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analytics Preview */}
                <div className="mt-5 bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">AI Insights</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                      <div className="mb-2">
                        <h4 className="font-medium text-blue-900 text-sm">Summer Break (Sep 15-19)</h4>
                      </div>
                      
                      <div className="flex items-center text-xs text-blue-700">
                        <Plane className="w-3 h-3 mr-1" />
                        <span>Perfect weather for Bali, Thailand</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                      <div className="mb-2">
                        <h4 className="font-medium text-green-900 text-sm">Long Weekend (Dec 25-27)</h4>
                      </div>
                      
                      <div className="flex items-center text-xs text-green-700">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>Great for Dubai, Singapore</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                      <div className="mb-2">
                        <h4 className="font-medium text-purple-900 text-sm">Independence Day (Aug 15)</h4>
                      </div>
                      
                      <div className="flex items-center text-xs text-purple-700">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>4-day weekend opportunity</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                      <div className="mb-2">
                        <h4 className="font-medium text-orange-900 text-sm">Team Trend</h4>
                      </div>
                      
                      <div className="flex items-center text-xs text-orange-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>5 colleagues planning Dec</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Leave Balances & Insights */}
              <div className="space-y-6">
                {/* Leave Balances - Exact DashboardPreview Styling */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                      <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                      Leave Balances
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Earned Leave Card */}
                    <div className="bg-purple-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-2">Earned Leave</div>
                        <div className="text-2xl font-bold text-purple-700">12</div>
                      </div>
                    </div>

                    {/* Sick Leave Card */}
                    <div className="bg-green-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-2">Sick Leave</div>
                        <div className="text-2xl font-bold text-green-700">8</div>
                      </div>
                    </div>

                    {/* Casual Leave Card */}
                    <div className="bg-blue-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-2">Casual Leave</div>
                        <div className="text-2xl font-bold text-blue-700">3</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Long Weekend Opportunities - Exact DashboardPreview Styling */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Long Weekend Opportunities</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-orange-900">Independence Day</h4>
                        <div className="flex items-center text-sm text-orange-700">
                          <Clock className="w-3 h-3 mr-1" />
                          4 days off
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-orange-700">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>Aug 15, 2025 (Friday)</span>
                      </div>
                      
                      <p className="text-sm text-orange-600 mt-2 italic">
                        "Take Monday off for a 4-day weekend!"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Vacations - Exact DashboardPreview Styling */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <Plane className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Upcoming Vacations</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-900">Summer Break</h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-sm text-purple-700">
                            <Clock className="w-3 h-3 mr-1" />
                            5 days
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            EL
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-purple-700">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>Sep 15, 2025 - Sep 19, 2025</span>
                      </div>
                      
                      <p className="text-sm text-purple-600 mt-2 italic">
                        "Beach vacation with family"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI Elements */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="absolute top-1/2 -right-6 w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDemo;
