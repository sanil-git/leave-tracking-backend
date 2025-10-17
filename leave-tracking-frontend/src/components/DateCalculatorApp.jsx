import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Calculator, Plus, Trash2, RotateCcw } from 'lucide-react';

const DateCalculatorApp = () => {
  const [absenteePeriods, setAbsenteePeriods] = useState([
    { id: 1, startDate: '2021-10-16', endDate: '2021-11-14', days: 30 },
    { id: 2, startDate: '2022-05-13', endDate: '2022-06-19', days: 38 },
    { id: 3, startDate: '2022-07-30', endDate: '2022-08-08', days: 10 },
    { id: 4, startDate: '2022-11-26', endDate: '2022-12-26', days: 31 },
    { id: 5, startDate: '2023-03-29', endDate: '2025-07-15', days: 840 },
    { id: 6, startDate: '2025-07-15', endDate: '2025-07-15', days: 1 }
  ]);

  const [referenceDate, setReferenceDate] = useState('');
  const [totalPeriodStart, setTotalPeriodStart] = useState('2020-07-15');
  const [totalPeriodEnd, setTotalPeriodEnd] = useState('');
  const [calculations, setCalculations] = useState({
    totalAbsentDays: 0,
    totalAbsentYears: 0,
    totalPeriodDays: 0,
    actualPresentDays: 0,
    actualPresentYears: 0
  });

  // Calculate days between two dates
  const calculateDaysBetween = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return 0;
    
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    
    return daysDiff;
  }, []);

  // Update individual period days
  const updatePeriodDays = useCallback((id, startDate, endDate) => {
    const days = calculateDaysBetween(startDate, endDate);
    
    setAbsenteePeriods(prev => 
      prev.map(period => 
        period.id === id 
          ? { ...period, startDate, endDate, days }
          : period
      )
    );
  }, [calculateDaysBetween]);

  // Handle date input changes
  const handleDateChange = useCallback((id, field, value) => {
    const period = absenteePeriods.find(p => p.id === id);
    if (!period) return;

    const newStartDate = field === 'startDate' ? value : period.startDate;
    const newEndDate = field === 'endDate' ? value : period.endDate;

    updatePeriodDays(id, newStartDate, newEndDate);
  }, [absenteePeriods, updatePeriodDays]);

  // Calculate totals
  useEffect(() => {
    if (!totalPeriodStart || !totalPeriodEnd) return;
    
    // Filter absentee periods to only include those within the 5-year period (start to today)
    const periodStart = new Date(totalPeriodStart);
    const periodEnd = new Date(totalPeriodEnd);
    
    const filteredAbsenteePeriods = absenteePeriods.filter(period => {
      if (!period.startDate || !period.endDate) return false;
      
      const absenceStart = new Date(period.startDate);
      const absenceEnd = new Date(period.endDate);
      
      // Only include periods that overlap with our 5-year window
      return absenceStart <= periodEnd && absenceEnd >= periodStart;
    });
    
    // Calculate total absent days (only within the 5-year period)
    let totalAbsentDays = 0;
    filteredAbsenteePeriods.forEach(period => {
      if (!period.startDate || !period.endDate) return;
      
      const absenceStart = new Date(Math.max(new Date(period.startDate), periodStart));
      const absenceEnd = new Date(Math.min(new Date(period.endDate), periodEnd));
      
      if (absenceEnd >= absenceStart) {
        const days = Math.ceil((absenceEnd - absenceStart) / (1000 * 60 * 60 * 24)) + 1;
        totalAbsentDays += days;
      }
    });
    
    const totalAbsentYears = parseFloat((totalAbsentDays / 365.25).toFixed(2));
    
    // Calculate total period days (5 years ago to today)
    const totalPeriodDays = calculateDaysBetween(totalPeriodStart, totalPeriodEnd);
    
    // Actual present days = Total period days - Total absent days
    const actualPresentDays = totalPeriodDays > 0 ? Math.max(0, totalPeriodDays - totalAbsentDays) : 0;
    const actualPresentYears = parseFloat((actualPresentDays / 365.25).toFixed(2));

    setCalculations({
      totalAbsentDays,
      totalAbsentYears,
      totalPeriodDays,
      actualPresentDays,
      actualPresentYears
    });
    
    // Debug logging to verify calculations
    console.log('Calculation Debug:', {
      totalPeriodStart,
      totalPeriodEnd,
      totalPeriodDays,
      totalAbsentDays,
      actualPresentDays,
      actualPresentYears,
      filteredPeriodsCount: filteredAbsenteePeriods.length
    });
  }, [absenteePeriods, totalPeriodStart, totalPeriodEnd, calculateDaysBetween]);

  // Set reference date and period end date based on today's date
  useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Calculate 5 years ago from today
    const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
    const fiveYearsAgoString = fiveYearsAgo.toISOString().split('T')[0];
    
    setReferenceDate(fiveYearsAgoString);
    setTotalPeriodStart(fiveYearsAgoString);
    setTotalPeriodEnd(todayString); // Set end date to today
  }, []);

  // Reset all data
  const resetAll = useCallback(() => {
    setAbsenteePeriods(prev => 
      prev.map(period => ({ ...period, startDate: '', endDate: '', days: 0 }))
    );
    setTotalPeriodStart('');
    setTotalPeriodEnd('');
  }, []);

  // Add new period
  const addPeriod = useCallback(() => {
    if (absenteePeriods.length < 10) {
      const newId = Math.max(...absenteePeriods.map(p => p.id)) + 1;
      setAbsenteePeriods(prev => [...prev, { id: newId, startDate: '', endDate: '', days: 0 }]);
    }
  }, [absenteePeriods]);

  // Remove period
  const removePeriod = useCallback((id) => {
    if (absenteePeriods.length > 1) {
      setAbsenteePeriods(prev => prev.filter(period => period.id !== id));
    }
  }, [absenteePeriods.length]);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Date Calculator</h1>
        </div>
        
        {/* Reference Date Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-lg font-medium text-blue-800">
            Calculating period: <span className="font-mono">{referenceDate}</span> to <span className="font-mono">{totalPeriodEnd}</span>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            (5 years ago from today until now)
          </p>
        </div>

        {/* Total Period Selection */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Overall Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Period Start:</label>
              <input
                type="date"
                value={totalPeriodStart}
                onChange={(e) => setTotalPeriodStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Period End:</label>
              <input
                type="date"
                value={totalPeriodEnd}
                onChange={(e) => setTotalPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Period Days:</div>
              <div className="text-xl font-bold text-blue-600">{calculations.totalPeriodDays}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Absentee Periods Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Enter up to {absenteePeriods.length} Absentee Periods</h2>
          <div className="flex gap-2">
            <button
              onClick={addPeriod}
              disabled={absenteePeriods.length >= 10}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
              Add Period
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={16} />
              Reset All
            </button>
          </div>
        </div>

        {/* Absentee Periods List */}
        <div className="space-y-4">
          {absenteePeriods.map((period, index) => (
            <div key={period.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Absentee {index + 1} Start:
                  </label>
                  <input
                    type="date"
                    value={period.startDate}
                    onChange={(e) => handleDateChange(period.id, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End:</label>
                  <input
                    type="date"
                    value={period.endDate}
                    onChange={(e) => handleDateChange(period.id, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600">Days:</div>
                  <div className="text-2xl font-bold text-blue-600">{period.days}</div>
                </div>

                <div className="text-center text-xs text-gray-500">
                  {period.startDate && (
                    <div>Start: {formatDateForDisplay(period.startDate)}</div>
                  )}
                  {period.endDate && (
                    <div>End: {formatDateForDisplay(period.endDate)}</div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => removePeriod(period.id)}
                    disabled={absenteePeriods.length <= 1}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Remove this period"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      <div className="text-center mb-8">
        <button
          onClick={() => {/* Calculations happen automatically */}}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Calculator size={20} />
          Calculate Actual Days
        </button>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Results</h3>
        
        {/* Main Results Display - Matching Screenshot Format */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <div className="text-lg font-bold text-gray-800 space-y-2">
            <div className="text-red-600">
              Total Absentee Days: {calculations.totalAbsentDays} days ({calculations.totalAbsentYears} years)
            </div>
            <div className="text-green-600">
              Actual Days Present: {calculations.actualPresentDays} days ({calculations.actualPresentYears} years)
            </div>
            {calculations.totalPeriodDays > 0 && (
              <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded">
                <strong>Calculation:</strong> {calculations.totalPeriodDays} total days - {calculations.totalAbsentDays} absent days = {calculations.actualPresentDays} present days
              </div>
            )}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <h4 className="font-semibold text-blue-600 mb-2">Total Period</h4>
            <p className="text-xl font-bold text-blue-700">
              {calculations.totalPeriodDays} days
            </p>
            <p className="text-sm text-blue-600">
              ({(calculations.totalPeriodDays / 365.25).toFixed(2)} years)
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <h4 className="font-semibold text-red-600 mb-2">Total Absentee</h4>
            <p className="text-xl font-bold text-red-700">
              {calculations.totalAbsentDays} days
            </p>
            <p className="text-sm text-red-600">
              ({calculations.totalAbsentYears} years)
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <h4 className="font-semibold text-green-600 mb-2">Actual Present</h4>
            <p className="text-xl font-bold text-green-700">
              {calculations.actualPresentDays} days
            </p>
            <p className="text-sm text-green-600">
              ({calculations.actualPresentYears} years)
            </p>
          </div>
        </div>

        {calculations.totalPeriodDays > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-blue-600 mb-3">Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Period Duration:</span> {formatDateForDisplay(totalPeriodStart)} to {formatDateForDisplay(totalPeriodEnd)}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Total Days:</span> {calculations.totalPeriodDays} days ({(calculations.totalPeriodDays / 365.25).toFixed(2)} years)
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Attendance Rate:</span> 
                  <span className="font-bold text-blue-600 ml-1">
                    {calculations.totalPeriodDays > 0 
                      ? ((calculations.actualPresentDays / calculations.totalPeriodDays) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Absence Rate:</span> 
                  <span className="font-bold text-red-600 ml-1">
                    {calculations.totalPeriodDays > 0 
                      ? ((calculations.totalAbsentDays / calculations.totalPeriodDays) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Date Calculator - Calculate days between dates and track absentee periods</p>
      </div>
    </div>
  );
};

export default DateCalculatorApp;
