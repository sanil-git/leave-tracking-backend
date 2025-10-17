import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, User, TrendingUp, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VacationForm = ({ onAddVacation, leaveBalances, existingVacations = [], holidays = [] }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('EL');
  
  // Refs for auto-focusing
  const endDateRef = useRef(null);

  // Auto-focus end date when start date is selected
  useEffect(() => {
    if (startDate && endDateRef.current) {
      // Small delay to ensure the input is ready
      setTimeout(() => {
        endDateRef.current.focus();
      }, 100);
    }
  }, [startDate]);

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  // Calculate working days excluding weekends and holidays
  const calculateWorkingDays = (start, end) => {
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const holidayDates = holidays.map(holiday => new Date(holiday.date).toDateString());
    
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toDateString();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Skip holidays
        if (!holidayDates.includes(dateString)) {
          workingDays++;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Clear end date if it's now before the new start date
    if (endDate && new Date(endDate) < new Date(newStartDate)) {
      setEndDate('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !destination.trim() || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('End date must be after start date');
      return;
    }

    const totalDays = calculateDuration(startDate, endDate);
    const workingDays = calculateWorkingDays(startDate, endDate);
    
    // Check if user has enough leave balance (use working days for balance check)
    const currentBalance = leaveBalances?.[leaveType] || 0;
    if (workingDays > currentBalance) {
      alert(`Insufficient ${leaveType} balance. You have ${currentBalance} days but requesting ${workingDays} working days (${totalDays} total days including weekends/holidays).`);
      return;
    }

    // Check for duplicate vacations based on overlapping dates
    const isDuplicate = existingVacations.some(vacation => {
      // Check for overlapping date ranges
      const vacationStart = new Date(vacation.startDate || vacation.fromDate);
      const vacationEnd = new Date(vacation.endDate || vacation.toDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      
      // Check if date ranges overlap
      return (newStart <= vacationEnd && newEnd >= vacationStart);
    });

    if (isDuplicate) {
      alert('A vacation with overlapping dates already exists. Please choose a different date range.');
      return;
    }

    onAddVacation({
      name: name.trim(),
      destination: destination.trim(),
      fromDate: startDate,
      toDate: endDate,
      days: workingDays, // Use working days for leave balance deduction
      totalDays: totalDays, // Store total days for display
      leaveType: leaveType
    });

    // Reset form
    setName('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setLeaveType('EL');
  };

  const totalDays = calculateDuration(startDate, endDate);
  const workingDays = calculateWorkingDays(startDate, endDate);
  const currentBalance = leaveBalances?.[leaveType] || 0;
  const remainingBalance = currentBalance - workingDays;

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Get start date for end date min attribute
  const minEndDate = startDate || today;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="vacationName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('vacation.vacationName')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="vacationName"
                name="vacationName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="e.g., Summer Vacation"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              {t('vacation.destination')}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
              >
                <option value="">{t('vacation.selectDestination')}</option>
                <optgroup label="Indian Beaches">
                  <option value="Goa (IN)">Goa (IN)</option>
                  <option value="Kerala (IN)">Kerala (IN)</option>
                  <option value="Andaman (IN)">Andaman (IN)</option>
                  <option value="Puducherry (IN)">Puducherry (IN)</option>
                </optgroup>
                <optgroup label="Indian Hill Stations">
                  <option value="Srinagar (IN)">Srinagar (IN)</option>
                  <option value="Manali (IN)">Manali (IN)</option>
                  <option value="Shimla (IN)">Shimla (IN)</option>
                  <option value="Dehradun (IN)">Dehradun (IN)</option>
                  <option value="Coorg (IN)">Coorg (IN)</option>
                  <option value="Munnar (IN)">Munnar (IN)</option>
                </optgroup>
                <optgroup label="Indian Heritage & Cities">
                  <option value="Agra (IN)">Agra (IN)</option>
                  <option value="Delhi (IN)">Delhi (IN)</option>
                  <option value="Jaipur (IN)">Jaipur (IN)</option>
                </optgroup>
                <optgroup label="Indian Adventure">
                  <option value="Leh Ladakh (IN)">Leh Ladakh (IN)</option>
                  <option value="Spiti Valley (IN)">Spiti Valley (IN)</option>
                </optgroup>
                <optgroup label="International">
                  <option value="Singapore">Singapore</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Bangkok (TH)">Bangkok (TH)</option>
                  <option value="NYC (US)">NYC (US)</option>
                  <option value="Toronto (CA)">Toronto (CA)</option>
                  <option value="Atlanta (US)">Atlanta (US)</option>
                  <option value="London (UK)">London (UK)</option>
                </optgroup>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
              {t('vacation.leaveType')}
            </label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
              >
                <option value="EL">{t('vacation.earnedLeave')} (EL) - {leaveBalances?.EL || 0} days available</option>
                <option value="CL">{t('vacation.casualLeave')} (CL) - {leaveBalances?.CL || 0} days available</option>
                <option value="SL">{t('vacation.sickLeave')} (SL) - {leaveBalances?.SL || 0} days available</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">
              Submit
            </label>
            <button
              type="submit"
              disabled={workingDays > currentBalance}
              className={`w-full flex items-center justify-center px-4 py-2 md:py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                workingDays > currentBalance
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {t('vacation.submit')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              {t('vacation.startDate')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                min={today}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              {t('vacation.endDate')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                ref={endDateRef}
                min={minEndDate}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
                disabled={!startDate}
              />
            </div>
          </div>
        </div>

        {totalDays > 0 && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
            <div className="flex items-center text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <div className="flex flex-col">
                <span><strong>{workingDays} working day{workingDays !== 1 ? 's' : ''}</strong> (leave balance)</span>
                {totalDays !== workingDays && (
                  <span className="text-xs text-gray-500">
                    {totalDays} total days (includes {totalDays - workingDays} weekend/holiday{totalDays - workingDays !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              remainingBalance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {remainingBalance >= 0 ? `${remainingBalance} remaining` : 'Insufficient balance'}
            </div>
          </div>
        )}
        
      </form>
    </div>
  );
};

export default VacationForm;
