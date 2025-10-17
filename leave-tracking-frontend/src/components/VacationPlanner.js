import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Plane, TrendingUp, Clock, MapPin } from 'lucide-react';

const VacationPlanner = ({ holidays, vacations, leaveBalances: initialLeaveBalances, onUpdateLeaveBalances, onNavigateToDate, isLoading = false }) => {
  const [leaveBalances, setLeaveBalances] = useState(initialLeaveBalances || { EL: 30, SL: 6, CL: 3 });
  const [isEditingBalances, setIsEditingBalances] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    if (initialLeaveBalances && Object.keys(initialLeaveBalances).length > 0 && !isEditingBalances) {
      setLeaveBalances(initialLeaveBalances);
    }
  }, [initialLeaveBalances, isEditingBalances]);

  const handleSaveBalances = async () => {
    if (!onUpdateLeaveBalances || isSaving) return;
    setIsSaving(true);
    try {
      await onUpdateLeaveBalances(leaveBalances);
      setIsEditingBalances(false);
    } catch (error) {
      // keep editing state to let user retry
    } finally {
      setIsSaving(false);
    }
  };
  // Find long weekend opportunities (holidays on Monday/Friday) - only future dates
  const longWeekendOpportunities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const filtered = holidays.filter(holiday => {
      const date = new Date(holiday.date);
      const dayOfWeek = date.getDay();
      // Only show Monday (1) or Friday (5) holidays that are in the future
      return (dayOfWeek === 1 || dayOfWeek === 5) && date >= today;
    });
    
    // Remove duplicates based on name and date
    const uniqueHolidays = [];
    const seen = new Set();
    
    filtered.forEach(holiday => {
      const key = `${holiday.name}-${holiday.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueHolidays.push(holiday);
      }
    });
    
    // Sort by date (earliest first)
    return uniqueHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [holidays]);

  // Calculate total vacation days
  const totalVacationDays = useMemo(() => {
    return vacations.reduce((total, vacation) => {
      // Handle both old and new field names
      const start = new Date(vacation.fromDate || vacation.startDate);
      const end = new Date(vacation.toDate || vacation.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
  }, [vacations]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get day name
  const getDayName = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleDateClick = (dateString) => {
    if (onNavigateToDate) {
      onNavigateToDate(new Date(dateString));
    }
  };

  return (
    <div className="space-y-6">
      {/* Leave Balance Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Leave Balance
          </div>
          <button
            onClick={isEditingBalances ? handleSaveBalances : () => setIsEditingBalances(true)}
            disabled={isSaving}
            className={`text-sm px-3 py-1 rounded-lg transition-colors duration-200 ${
              isSaving
                ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {isEditingBalances ? (isSaving ? 'Saving…' : 'Save') : 'Edit'}
          </button>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
            {isLoading ? (
              <div className="text-2xl font-bold text-blue-600">
                <div className="animate-pulse bg-blue-200 h-8 w-16 mx-auto rounded"></div>
              </div>
            ) : isEditingBalances ? (
              <label htmlFor="el-balance" className="sr-only">
                Edit Earned Leave balance
              </label>
              <input
                id="el-balance"
                type="number"
                value={leaveBalances?.EL || 0}
                onChange={(e) => {
                  const value = e.target.value;
                  setLeaveBalances(prev => ({ 
                    ...prev, 
                    EL: value === '' ? 0 : parseInt(value) || 0 
                  }));
                }}
                disabled={isSaving}
                className="w-full text-xl md:text-2xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 text-center disabled:opacity-60 touch-manipulation"
                min="0"
              />
            ) : (
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {parseInt(leaveBalances?.EL) || 30}
              </div>
            )}
            <div className="text-sm text-blue-800">Earned Leave</div>
          </div>
          
          <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
            {isEditingBalances ? (
              <label htmlFor="sl-balance" className="sr-only">
                Edit Sick Leave balance
              </label>
              <input
                id="sl-balance"
                type="number"
                value={leaveBalances?.SL || 0}
                onChange={(e) => {
                  const value = e.target.value;
                  setLeaveBalances(prev => ({ 
                    ...prev, 
                    SL: value === '' ? 0 : parseInt(value) || 0 
                  }));
                }}
                disabled={isSaving}
                className="w-full text-xl md:text-2xl font-bold text-green-600 bg-transparent border-b-2 border-green-300 focus:outline-none focus:border-green-500 text-center disabled:opacity-60 touch-manipulation"
                min="0"
              />
            ) : (
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {parseInt(leaveBalances?.SL) || 6}
              </div>
            )}
            <div className="text-sm text-green-800">Sick Leave</div>
          </div>
          
          <div className="text-center p-3 md:p-4 bg-yellow-50 rounded-lg">
            {isEditingBalances ? (
              <label htmlFor="cl-balance" className="sr-only">
                Edit Casual Leave balance
              </label>
              <input
                id="cl-balance"
                type="number"
                value={leaveBalances?.CL || 0}
                onChange={(e) => {
                  const value = e.target.value;
                  setLeaveBalances(prev => ({ 
                    ...prev, 
                    CL: value === '' ? 0 : parseInt(value) || 0 
                  }));
                }}
                disabled={isSaving}
                className="w-full text-xl md:text-2xl font-bold text-yellow-600 bg-transparent border-b-2 border-yellow-300 focus:outline-none focus:border-yellow-500 text-center disabled:opacity-60 touch-manipulation"
                min="0"

              />
            ) : (
              <div className="text-xl md:text-2xl font-bold text-yellow-600">
                {parseInt(leaveBalances?.CL) || 3}
              </div>
            )}
            <div className="text-sm text-yellow-800">Casual Leave</div>
          </div>
        </div>
      </div>

      {/* Long Weekend Opportunities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
          Long Weekend Opportunities
        </h3>
        
        {longWeekendOpportunities.length === 0 ? (
          <p className="text-gray-500 text-sm">No long weekend opportunities found.</p>
        ) : (
          <div className="space-y-3">
            {longWeekendOpportunities.map((holiday) => (
              <div
                key={holiday._id}
                className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-orange-900">{holiday.name}</h4>
                    <p className="text-sm text-orange-700">
                      <span 
                        onClick={() => handleDateClick(holiday.date)}
                        className="cursor-pointer hover:text-orange-800 hover:underline transition-colors duration-200"
                        title="Click to navigate to this date on calendar"
                      >
                        {getDayName(holiday.date)} • {formatDate(holiday.date)}
                      </span>
                    </p>
                  </div>
                  <div className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                    {getDayName(holiday.date).substring(0, 3)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Planned Vacations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Plane className="w-5 h-5 mr-2 text-green-600" />
          Planned Vacations
        </h3>
        
        {vacations.length === 0 ? (
          <p className="text-gray-500 text-sm">No vacations planned yet.</p>
        ) : (
          <div className="space-y-3">
            {vacations.map((vacation) => (
              <div
                key={vacation._id}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-900">{vacation.name}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-green-700">
                      <Clock className="w-3 h-3 mr-1" />
                      {vacation.days || vacation.duration || 'N/A'} days
                    </div>
                    {vacation.leaveType && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        vacation.leaveType === 'EL' ? 'bg-blue-100 text-blue-800' :
                        vacation.leaveType === 'SL' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vacation.leaveType}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-green-700">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span 
                    onClick={() => handleDateClick(vacation.fromDate || vacation.startDate)}
                    className="cursor-pointer hover:text-green-800 hover:underline transition-colors duration-200"
                    title="Click to navigate to start date"
                  >
                    {formatDate(vacation.fromDate || vacation.startDate)}
                  </span>
                  <span className="mx-2">-</span>
                  <span 
                    onClick={() => handleDateClick(vacation.toDate || vacation.endDate)}
                    className="cursor-pointer hover:text-green-800 hover:underline transition-colors duration-200"
                    title="Click to navigate to end date"
                  >
                    {formatDate(vacation.toDate || vacation.endDate)}
                  </span>
                </div>
                
                {vacation.description && (
                  <p className="text-sm text-green-600 mt-2 italic">
                    "{vacation.description}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
          Quick Stats & Historical Data
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700 mb-1">{holidays.length}</div>
            <div className="text-sm text-blue-600 font-medium">Total Holidays</div>
            <div className="text-xs text-blue-500 mt-1">📅</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700 mb-1">{vacations.length}</div>
            <div className="text-sm text-green-600 font-medium">Total Vacations</div>
            <div className="text-xs text-green-500 mt-1">✈️</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-700 mb-1">{longWeekendOpportunities.length}</div>
            <div className="text-sm text-orange-600 font-medium">Future Long Weekends</div>
            <div className="text-xs text-orange-500 mt-1">🎯</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-700 mb-1">{totalVacationDays}</div>
            <div className="text-sm text-purple-600 font-medium">Total Vacation Days</div>
            <div className="text-xs text-purple-500 mt-1">📊</div>
          </div>
        </div>

        {/* Historical Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Leave Balance History
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-indigo-700">EL Used:</span>
                <span className="font-medium text-indigo-800">
                  {Math.max(0, 30 - (leaveBalances?.EL || 30))} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700">SL Used:</span>
                <span className="font-medium text-indigo-800">
                  {Math.max(0, 6 - (leaveBalances?.SL || 6))} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700">CL Used:</span>
                <span className="font-medium text-indigo-800">
                  {Math.max(0, 3 - (leaveBalances?.CL || 3))} days
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Vacation Patterns
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-700">Avg Duration:</span>
                <span className="font-medium text-emerald-800">
                  {vacations.length > 0 ? Math.round(totalVacationDays / vacations.length) : 0} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Longest Trip:</span>
                <span className="font-medium text-emerald-800">
                  {vacations.length > 0 ? Math.max(...vacations.map(v => v.days || 0)) : 0} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Shortest Trip:</span>
                <span className="font-medium text-emerald-800">
                  {vacations.length > 0 ? Math.min(...vacations.map(v => v.days || 0)) : 0} days
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Time Insights
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">This Month:</span>
                <span className="font-medium text-amber-800">
                  {vacations.filter(v => {
                    const vacationDate = new Date(v.fromDate || v.startDate);
                    const now = new Date();
                    return vacationDate.getMonth() === now.getMonth() && 
                           vacationDate.getFullYear() === now.getFullYear();
                  }).length} trips
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Next Month:</span>
                <span className="font-medium text-amber-800">
                  {vacations.filter(v => {
                    const vacationDate = new Date(v.fromDate || v.startDate);
                    const now = new Date();
                    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
                    return vacationDate.getMonth() === nextMonth.getMonth() && 
                           vacationDate.getFullYear() === nextMonth.getFullYear();
                  }).length} trips
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Upcoming:</span>
                <span className="font-medium text-amber-800">
                  {vacations.filter(v => {
                    const vacationDate = new Date(v.fromDate || v.startDate);
                    const now = new Date();
                    return vacationDate > now;
                  }).length} trips
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationPlanner;
