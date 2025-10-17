import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CustomCalendar = ({ 
  holidays = [], 
  vacations = [], 
  onNavigate, 
  currentDate, 
  onViewChange, 
  isLoading = false 
}) => {
  // const [view, setView] = useState('month'); // Currently not used
  const view = 'month'; // Fixed to month view for now
  
  // Use currentDate from parent, fallback to current date if not provided
  const date = useMemo(() => {
    if (currentDate && currentDate instanceof Date) {
      return currentDate;
    }
    return new Date();
  }, [currentDate]);

  // Generate calendar data for the current month
  const calendarData = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate how many weeks we need
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const lastDayOfMonth = lastDay.getDate();
    const totalDays = firstDayOfWeek + lastDayOfMonth;
    const weeksNeeded = Math.ceil(totalDays / 7);
    
    // Start from the Sunday of the first week
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    const days = [];
    const currentDate = new Date(startDate);
    const totalCells = weeksNeeded * 7; // Only generate the weeks we need
    
    for (let i = 0; i < totalCells; i++) {
      const dayData = {
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        dayOfWeek: currentDate.getDay(),
        dayNumber: currentDate.getDate()
      };
      
      days.push(dayData);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [date]);

  // Check if a date has events
  const getDateEvents = useCallback((checkDate) => {
    // Normalize the check date to start of day to avoid timezone issues
    const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    
    const dateHolidays = holidays.filter(holiday => {
      if (!holiday.date) return false;
      const holidayDate = new Date(holiday.date);
      // Normalize holiday date to start of day
      const normalizedHolidayDate = new Date(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate());
      
      return normalizedHolidayDate.getTime() === normalizedCheckDate.getTime();
    });
    
    const dateVacations = vacations.filter(vacation => {
      // Handle both field name variations: startDate/endDate and fromDate/toDate
      const startDateStr = vacation.startDate || vacation.fromDate;
      const endDateStr = vacation.endDate || vacation.toDate;
      
      if (!startDateStr || !endDateStr) return false;
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      // Normalize vacation dates to start of day
      const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      
      return normalizedCheckDate >= normalizedStartDate && normalizedCheckDate <= normalizedEndDate;
    });
    
    return { holidays: dateHolidays, vacations: dateVacations };
  }, [holidays, vacations]);

  // Handle navigation
  const handleNavigate = useCallback((newDate, view, action) => {
    if (onNavigate) {
      onNavigate(newDate, view, action);
    }
  }, [onNavigate]);

  // Handle view change (currently not used but kept for future functionality)
  // const handleViewChange = useCallback((newView) => {
  //   setView(newView);
  //   if (onViewChange) {
  //     onViewChange(newView);
  //   }
  // }, [onViewChange]);

  // Get day styling based on events and properties
  const getDayStyling = useCallback((dayData) => {
    const { isCurrentMonth, isToday, dayOfWeek } = dayData;
    const { holidays, vacations } = getDateEvents(dayData.date);
    
    let baseClasses = "text-center py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 cursor-pointer min-h-[60px] flex flex-col justify-start";
    
    // Weekend styling
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseClasses += " text-gray-400 bg-gray-50";
    }
    // Today styling
    else if (isToday) {
      baseClasses += " bg-purple-600 text-white font-bold shadow-lg";
    }
    // Event styling - entire cell background
    else if (holidays.length > 0 || vacations.length > 0) {
      if (holidays.length > 0 && vacations.length > 0) {
        baseClasses += " bg-gradient-to-br from-orange-100 to-purple-100 text-gray-800 font-semibold";
      } else if (holidays.length > 0) {
        baseClasses += " bg-orange-100 text-gray-800 font-semibold";
      } else if (vacations.length > 0) {
        baseClasses += " bg-purple-100 text-gray-800 font-semibold";
      }
    }
    // Regular day styling
    else if (isCurrentMonth) {
      baseClasses += " text-gray-600 hover:bg-gray-100";
    }
    // Other month styling - show but greyed out
    else {
      baseClasses += " text-gray-300 bg-gray-50/50";
    }
    
    return baseClasses;
  }, [getDateEvents]);

  // Get events for a specific date - show dots with hover tooltips
  const getDateEventList = useCallback((dayData) => {
    const { holidays, vacations } = getDateEvents(dayData.date);
    const allEvents = [...holidays, ...vacations];
    
    if (allEvents.length === 0) return null;
    
    return (
      <div className="mt-1 flex justify-center space-x-1">
        {/* Show orange dots for holidays */}
        {holidays.map((holiday, index) => (
          <div 
            key={`holiday-${index}`}
            className="w-2 h-2 bg-orange-500 rounded-full"
            title={holiday.name}
          />
        ))}
        
        {/* Show purple dots for vacations */}
        {vacations.map((vacation, index) => (
          <div 
            key={`vacation-${index}`}
            className="w-2 h-2 bg-purple-500 rounded-full"
            title={vacation.name}
          />
        ))}
        
        {/* Show indicator for additional events */}
        {allEvents.length > 2 && (
          <div 
            className="w-1 h-1 bg-gray-600 rounded-full"
            title={`${allEvents.length - 2} more events`}
          />
        )}
      </div>
    );
  }, [getDateEvents]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl p-6" style={{ minHeight: '500px' }}>
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
              <CalendarIcon className="w-7 h-7 text-purple-700" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                handleNavigate(newDate, view, 'PREV');
              }}
              className="p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-sm touch-manipulation"
              title="Previous Month"
              aria-label="Go to previous month"
              tabIndex={0}
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            
            <button
              onClick={() => {
                const today = new Date();
                handleNavigate(today, view, 'TODAY');
              }}
              className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all duration-200 hover:shadow-sm transform hover:scale-105 text-sm md:text-base touch-manipulation"
              title="Go to Today"
              aria-label="Navigate to current date"
              tabIndex={0}
            >
              Today
            </button>
            
            <button
              onClick={() => {
                const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                handleNavigate(newDate, view, 'NEXT');
              }}
              className="p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-sm touch-manipulation"
              title="Next Month"
              aria-label="Go to next month"
              tabIndex={0}
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading calendar data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="text-center text-gray-500 py-2 font-medium text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((dayData, index) => (
              <div
                key={index}
                className={getDayStyling(dayData)}
                onClick={() => {
                  // Handle date click if needed
                  // Date click functionality can be added here
                }}
                role="button"
                tabIndex={dayData.isCurrentMonth ? 0 : -1}
                aria-label={`${dayData.isCurrentMonth ? '' : 'Previous/Next month, '}${dayData.dayNumber}${dayData.isToday ? ', today' : ''}${getDateEvents(dayData.date).holidays.length > 0 ? ', holiday' : ''}${getDateEvents(dayData.date).vacations.length > 0 ? ', vacation planned' : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Handle date click if needed
                  }
                }}
              >
                <div className="text-center font-semibold">
                  {dayData.dayNumber}
                </div>
                <div className="flex-1 flex items-end justify-center">
                  {getDateEventList(dayData)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
