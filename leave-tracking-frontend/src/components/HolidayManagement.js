import React, { useState, useMemo, memo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

const HolidayManagement = memo(({ holidays, onAddHoliday, onDeleteHoliday, API_BASE_URL, token, isLoading = false }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isHolidaysExpanded, setIsHolidaysExpanded] = useState(false);
  const [deletingHolidays, setDeletingHolidays] = useState(new Set());

  // Optimize duplicate filtering and sorting with useMemo
  const uniqueSortedHolidays = useMemo(() => {
    if (!Array.isArray(holidays)) return [];
    
    // Remove duplicates based on name and date
    const uniqueHolidays = [];
    const seen = new Set();
    
    holidays.forEach(holiday => {
      const key = `${holiday.name}-${holiday.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueHolidays.push(holiday);
      }
    });
    
    // Sort by date (earliest first)
    uniqueHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    return uniqueHolidays;
  }, [holidays]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && date) {
      const trimmedName = name.trim();
      
      // Check for duplicate holidays
      const isDuplicate = holidays.some(holiday => 
        holiday.name === trimmedName || holiday.date === date
      );
      
      if (isDuplicate) {
        alert('A holiday with the same name or date already exists. Please choose a different name or date.');
        return;
      }
      
      onAddHoliday({ name: trimmedName, date });
      setName('');
      setDate('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      
      {/* Add Holiday Form */}
      <form onSubmit={handleSubmit} className="mb-4 md:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="holidayName" className="block text-sm font-medium text-gray-700 mb-1">
              Holiday Name
            </label>
            <input
              type="text"
              id="holidayName"
              name="holidayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base touch-manipulation"
              placeholder="e.g., Company Holiday"
              required
            />
          </div>
          
          <div>
            <label htmlFor="holidayDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="holidayDate"
              name="holidayDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base touch-manipulation"
              required
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 md:py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </button>
          </div>
        </div>
      </form>

      {/* Collapsible Current Holidays Section */}
      <div className="border border-gray-200 rounded-lg">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsHolidaysExpanded(!isHolidaysExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <h4 className="text-md font-medium text-gray-900">Current Holidays</h4>
            <span className="text-sm text-gray-500">
              {isLoading ? 'Loading...' : `(${uniqueSortedHolidays.length} unique)`}
            </span>
          </div>
          {isHolidaysExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Expandable Content */}
        {isHolidaysExpanded && (
          <div className="border-t border-gray-200 p-4">
            {holidays.length === 0 ? (
              <p className="text-gray-500 text-sm">No holidays added yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uniqueSortedHolidays.map((holiday) => (
                  <div
                    key={holiday._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{holiday.name}</h5>
                      <p className="text-sm text-gray-600">{formatDate(holiday.date)}</p>
                    </div>
                    
                    <button
                      onClick={async () => {
                        setDeletingHolidays(prev => new Set(prev).add(holiday._id));
                        try {
                          await onDeleteHoliday(holiday._id);
                        } finally {
                          setDeletingHolidays(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(holiday._id);
                            return newSet;
                          });
                        }
                      }}
                      disabled={deletingHolidays.has(holiday._id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete holiday"
                    >
                      {deletingHolidays.has(holiday._id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default HolidayManagement;
