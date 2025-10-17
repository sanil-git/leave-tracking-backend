import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format: (date, formatStr) => {
    // Custom format for month display to show 3-letter month
    if (formatStr === 'MMMM yyyy' || formatStr === 'MMMM') {
      return format(date, 'MMM yyyy', { locale: enUS });
    }
    return format(date, formatStr, { locale: enUS });
  },
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = memo(({ holidays, vacations, onNavigate, currentDate, onViewChange, isLoading = false }) => {
  const [view, setView] = useState('month');
  // Use currentDate from parent, fallback to current date if not provided
  const date = useMemo(() => {
    if (currentDate && currentDate instanceof Date) {
      return currentDate;
    }
    return new Date();
  }, [currentDate]);



  // Create stable keys for holidays and vacations to prevent unnecessary re-renders
  const holidaysKey = useMemo(() => {
    if (!holidays || !Array.isArray(holidays)) return '';
    return holidays.map(h => `${h._id || h.name}-${h.date}`).join('|');
  }, [holidays]);

  const vacationsKey = useMemo(() => {
    if (!vacations || !Array.isArray(vacations)) return '';
    return vacations.map(v => `${v._id || v.name}-${v.startDate}-${v.endDate}`).join('|');
  }, [vacations]);

  // Combine holidays and vacations into calendar events - optimized to prevent unnecessary re-renders
  const events = useMemo(() => {
    const calendarEvents = [];
    
    // Add holidays - only process if holidays array actually changed
    if (holidays && Array.isArray(holidays)) {
      holidays.forEach(holiday => {
        if (holiday.date) {
          calendarEvents.push({
            id: `holiday-${holiday._id || holiday.name}-${holiday.date}`,
            title: holiday.name,
            start: new Date(holiday.date),
            end: new Date(holiday.date),
            type: 'holiday',
            allDay: true,
            resource: holiday
          });
        }
      });
    }
    
    // Add vacations - only process if vacations array actually changed
    if (vacations && Array.isArray(vacations)) {
      vacations.forEach(vacation => {
        if (vacation.startDate && vacation.endDate) {
          calendarEvents.push({
            id: `vacation-${vacation._id || vacation.name}-${vacation.startDate}`,
            title: vacation.name,
            start: new Date(vacation.startDate),
            end: new Date(vacation.endDate),
            type: 'vacation',
            allDay: true,
            resource: vacation
          });
        }
      });
    }
    
    return calendarEvents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidaysKey, vacationsKey]); // Use stable keys to prevent unnecessary re-renders

  // Memoized event style getter to prevent recreation on every render
  const eventStyleGetter = useCallback((event) => {
    let style = {
      backgroundColor: '#3B82F6', // Blue for holidays
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '3px 6px',
      fontSize: '11px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      transition: 'all 0.2s ease'
    };
    
    if (event.type === 'vacation') {
      style.backgroundColor = '#10B981'; // Green for vacations
    }
    
    return { style };
  }, []);

  // Custom day cell wrapper to add data-day attribute for weekend detection and event styling
  const dayCellWrapper = useCallback(({ children, value }) => {
    const dayOfWeek = value.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if this date has any events
    const dateString = value.toISOString().split('T')[0];
    const hasHoliday = events.some(event => {
      const eventDate = new Date(event.start);
      return eventDate.toISOString().split('T')[0] === dateString && event.type === 'holiday';
    });
    const hasVacation = events.some(event => {
      const eventDate = new Date(event.start);
      return eventDate.toISOString().split('T')[0] === dateString && event.type === 'vacation';
    });
    
    // Determine background color based on events (but preserve weekend styling)
    let backgroundColor = '';
    let eventBorder = '';
    let eventBorderColor = '';
    
    // Only apply event styling if it's not a weekend
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      if (hasHoliday && hasVacation) {
        backgroundColor = 'bg-gradient-to-br from-blue-100 to-green-100'; // Both holiday and vacation
        eventBorder = '3px solid';
        eventBorderColor = '#8b5cf6';
      } else if (hasHoliday) {
        backgroundColor = 'bg-blue-50'; // Holiday only
        eventBorder = '3px solid';
        eventBorderColor = '#3b82f6';
      } else if (hasVacation) {
        backgroundColor = 'bg-green-50'; // Vacation only
        eventBorder = '3px solid';
        eventBorderColor = '#10b981';
      }
    }
    
    return (
      <div 
        data-day={dayOfWeek} 
        className={`rbc-date-cell ${backgroundColor}`}
        style={{ 
          background: backgroundColor ? undefined : 'transparent',
          borderLeft: eventBorder || 'none',
          borderLeftColor: eventBorderColor || 'transparent'
        }}
      >
        {children}
      </div>
    );
  }, [events]);

  // Custom event component with tooltip for truncated events
  const EventComponent = useCallback(({ event }) => {
    const isTruncated = event.title && event.title.length > 15;
    return (
      <div
        title={isTruncated ? event.title : undefined}
        className="rbc-event-content"
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%'
        }}
      >
        {event.title}
      </div>
    );
  }, []);

  // Handle navigation - memoized to prevent recreation
  const handleNavigate = useCallback((newDate, view, action) => {
    if (onNavigate) {
      onNavigate(newDate, view, action);
    }
  }, [onNavigate]);

  // Handle view change - memoized to prevent recreation
  const handleViewChange = useCallback((newView) => {
    // Only allow view changes from the header buttons, not from date clicks
    if (newView === 'month') {
      setView(newView);
      if (onViewChange) {
        onViewChange(newView);
      }
    }
  }, [onViewChange]);

  // Prevent date selection from changing view
  const handleSelectSlot = useCallback(() => {
    // Do nothing - prevent view change on date click
  }, []);

  // Prevent event selection from changing view
  const handleSelectEvent = useCallback(() => {
    // Do nothing - prevent view change on event click
  }, []);



  // Debug logging - only log when view or date changes (development only)
  // Removed debug logging for cleaner console output

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
                {date ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() : 'CALENDAR'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (date) {
                  const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                  handleNavigate(newDate, view, 'PREV');
                }
              }}
              className="p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-sm touch-manipulation"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                const today = new Date();
                handleNavigate(today, view, 'TODAY');
              }}
              className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all duration-200 hover:shadow-sm transform hover:scale-105 text-sm md:text-base touch-manipulation"
              title="Go to Today"
            >
              Today
            </button>
            
            <button
              onClick={() => {
                if (date) {
                  const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                  handleNavigate(newDate, view, 'NEXT');
                }
              }}
              className="p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-sm touch-manipulation"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
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
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: window.innerWidth < 768 ? 400 : 600 }}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          toolbar={false}
          eventPropGetter={eventStyleGetter}
          popup
          defaultView="month"
          views={['month']}
          components={{
            dateCellWrapper: dayCellWrapper,
            event: EventComponent
          }}
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            noEventsInRange: "No events in this range."
          }}
          formats={{
            monthHeaderFormat: (date) => format(date, 'MMM yyyy', { locale: enUS }),
            dayHeaderFormat: (date) => format(date, 'EEE', { locale: enUS }),
            dayFormat: (date) => format(date, 'd', { locale: enUS }),
          }}
          step={60}
          timeslots={1}
          showMultiDayTimes={false}
          doShowMoreDrillDown={true}
          popupOffset={{ x: 10, y: 10 }}
        />
      )}
    </div>
  );
});

export default Calendar;
