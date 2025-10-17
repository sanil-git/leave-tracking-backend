import React, { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { TrendingUp, Calendar, Clock, Edit3, Plane, MapPin, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Lazy load components for performance
const SmartInsights = React.lazy(() => import('./SmartInsights'));
const HistoricalData = React.lazy(() => import('./HistoricalData'));

/**
 * Insights - Main dashboard insights component
 * Contains leave balances, opportunities, planned vacations, and lazy-loaded sections
 */
const Insights = ({ 
  leaveBalances = { EL: 12, SL: 8, CL: 3 },
  holidays = [],
  vacations = [],
  onNavigateToDate,
  onUpdateLeaveBalances,
  onDeleteVacation,
  isLoading = false,
  aiInsights = {},
  aiLoading = {},
  aiError = {},
  weatherData = {},
  allWeatherData = {},
  weatherLoading = false,
  weatherError = null
}) => {
  const { t } = useTranslation();
  const [isEditingBalances, setIsEditingBalances] = useState(false);
  const [editingBalances, setEditingBalances] = useState(leaveBalances);
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredVacation, setHoveredVacation] = useState(null);
  
  // Intersection Observer for lazy loading
  const [showSmartInsights, setShowSmartInsights] = useState(false);
  const [showHistoricalData, setShowHistoricalData] = useState(false);
  const smartInsightsRef = useRef();
  const historicalDataRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === smartInsightsRef.current) {
              setShowSmartInsights(true);
            }
            if (entry.target === historicalDataRef.current) {
              setShowHistoricalData(true);
            }
          }
        });
      },
      { rootMargin: '100px' } // Load 100px before coming into view
    );

    if (smartInsightsRef.current) observer.observe(smartInsightsRef.current);
    if (historicalDataRef.current) observer.observe(historicalDataRef.current);

    return () => observer.disconnect();
  }, []);

  const handleSaveBalances = async () => {
    if (!onUpdateLeaveBalances || isSaving) return;
    setIsSaving(true);
    try {
      await onUpdateLeaveBalances(editingBalances);
      setIsEditingBalances(false);
    } catch (error) {
      console.error('Error saving leave balances:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    setEditingBalances(leaveBalances);
    setIsEditingBalances(true);
  };

  // Find long weekend opportunities (holidays on Monday/Friday) - only future dates
  const longWeekendOpportunities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filtered = holidays.filter(holiday => {
      const date = new Date(holiday.date);
      const dayOfWeek = date.getDay();
      return (dayOfWeek === 1 || dayOfWeek === 5) && date >= today;
    });
    
    // Remove duplicates
    const uniqueHolidays = [];
    const seen = new Set();
    
    filtered.forEach(holiday => {
      const key = `${holiday.name}-${holiday.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueHolidays.push(holiday);
      }
    });
    
    return uniqueHolidays;
  }, [holidays]);

  // Separate future vacations for planned section
  const futureVacations = useMemo(() => {
    if (!vacations || vacations.length === 0) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const future = vacations.filter(vacation => {
      const endDate = new Date(vacation.toDate || vacation.endDate);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= today;
    });
    
    return future.sort((a, b) => new Date(a.fromDate || a.startDate) - new Date(b.fromDate || b.startDate));
  }, [vacations]);

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleDateClick = (dateString) => {
    if (onNavigateToDate) {
      onNavigateToDate(new Date(dateString));
    }
  };

  const handleDeleteVacation = async (vacationId) => {
    if (onDeleteVacation && window.confirm('Are you sure you want to delete this vacation?')) {
      try {
        await onDeleteVacation(vacationId);
      } catch (error) {
        console.error('Error deleting vacation:', error);
        alert('Failed to delete vacation. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Leave Balances Panel */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-semibold text-gray-800">{t('dashboard.leaveBalances')}</h4>
            </div>
            <button
              onClick={isEditingBalances ? handleSaveBalances : handleEditClick}
              disabled={isSaving}
              className={`flex items-center text-sm px-3 py-1 rounded-lg transition-colors duration-200 ${
                isSaving
                  ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              aria-label={isEditingBalances ? (isSaving ? 'Saving leave balances' : 'Save leave balance changes') : 'Edit leave balances'}
              tabIndex={0}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {isEditingBalances ? (isSaving ? t('dashboard.saving') : t('dashboard.save')) : t('dashboard.edit')}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Earned Leave Card */}
            <div className="bg-purple-50 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.earnedLeave')}</div>
                {isEditingBalances ? (
                  <>
                    <label htmlFor="insights-el-balance" className="sr-only">
                      Edit Earned Leave balance
                    </label>
                    <input
                      id="insights-el-balance"
                      name="insights-el-balance"
                      type="number"
                      value={editingBalances.EL || ''}
                      onChange={(e) => setEditingBalances(prev => ({ ...prev, EL: parseInt(e.target.value) || 0 }))}
                      className="w-full text-2xl font-bold text-purple-700 text-center bg-transparent border-none outline-none"
                      min="0"
                      step="1"
                    />
                  </>
                ) : (
                  <div className="text-2xl font-bold text-purple-700">{leaveBalances.EL}</div>
                )}
              </div>
            </div>

            {/* Sick Leave Card */}
            <div className="bg-green-50 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.sickLeave')}</div>
                {isEditingBalances ? (
                  <>
                    <label htmlFor="insights-sl-balance" className="sr-only">
                      Edit Sick Leave balance
                    </label>
                    <input
                      id="insights-sl-balance"
                      name="insights-sl-balance"
                      type="number"
                      value={editingBalances.SL || ''}
                      onChange={(e) => setEditingBalances(prev => ({ ...prev, SL: parseInt(e.target.value) || 0 }))}
                      className="w-full text-2xl font-bold text-green-700 text-center bg-transparent border-none outline-none"
                      min="0"
                      step="1"
                    />
                  </>
                ) : (
                  <div className="text-2xl font-bold text-green-700">{leaveBalances.SL}</div>
                )}
              </div>
            </div>

            {/* Casual Leave Card */}
            <div className="bg-blue-50 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.casualLeave')}</div>
                {isEditingBalances ? (
                  <>
                    <label htmlFor="insights-cl-balance" className="sr-only">
                      Edit Casual Leave balance
                    </label>
                    <input
                      id="insights-cl-balance"
                      name="insights-cl-balance"
                      type="number"
                      value={editingBalances.CL || ''}
                      onChange={(e) => setEditingBalances(prev => ({ ...prev, CL: parseInt(e.target.value) || 0 }))}
                      className="w-full text-2xl font-bold text-blue-700 text-center bg-transparent border-none outline-none"
                      min="0"
                      step="1"
                    />
                  </>
                ) : (
                  <div className="text-2xl font-bold text-blue-700">{leaveBalances.CL}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Long Weekend Opportunities */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-orange-600 mr-2" />
            <h4 className="font-semibold text-gray-800">{t('opportunities.longWeekend')}</h4>
          </div>
          
          {longWeekendOpportunities.length === 0 ? (
            <p className="text-gray-500 text-sm">{t('opportunities.noOpportunities')}</p>
          ) : (
            <div className="space-y-3">
              {longWeekendOpportunities.map((holiday) => (
                <div
                  key={holiday._id}
                  className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
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
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Plane className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="font-semibold text-gray-800">{t('opportunities.planned')}</h4>
          </div>
          
          {futureVacations.length === 0 ? (
            <p className="text-gray-500 text-sm">{t('opportunities.noVacations')}</p>
          ) : (
            <div className="space-y-3">
              {futureVacations.map((vacation) => {
                const vacationId = vacation._id || vacation.name;
                const insights = aiInsights[vacationId];
                const isLoading = aiLoading[vacationId];
                const hasError = aiError[vacationId];
                const score = insights?.ai_analysis?.current_destination_analysis?.score;
                const suggestion = insights?.ai_analysis?.ai_insights?.smart_suggestion;
                const isHovered = hoveredVacation === vacationId;
                
                return (
                  <div
                    key={vacation._id}
                    className="group p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-purple-900">
                        {vacation.name}
                        {vacation.destination && (
                          <span className="font-medium text-purple-900"> ({vacation.destination})</span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {/* AI Score */}
                        {isLoading ? (
                          <div className="w-8 h-6 bg-gray-200 rounded-full"></div>
                        ) : score ? (
                          <div 
                            className={`px-2 py-1 text-xs font-bold rounded-full cursor-pointer ${
                              score >= 8 ? 'bg-green-100 text-green-800' :
                              score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                            title="Hover for AI suggestion"
                            onMouseEnter={() => {
                              setHoveredVacation(vacationId);
                            }}
                            onMouseLeave={() => {
                              setHoveredVacation(null);
                            }}
                          >
                            {parseFloat(score).toFixed(1)}/10
                          </div>
                        ) : hasError ? (
                          <div className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded-full">
                            Error
                          </div>
                        ) : null}
                        
                        <div className="flex items-center text-sm text-purple-700">
                          <Clock className="w-3 h-3 mr-1" />
                          {vacation.days || vacation.duration || 'N/A'} {t('opportunities.days')}
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
                        {/* Delete button - only visible on hover */}
                        {onDeleteVacation && (
                          <button
                            onClick={() => handleDeleteVacation(vacation._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md"
                            title="Delete vacation"
                            aria-label={`Delete vacation: ${vacation.name}`}
                            tabIndex={0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* AI Suggestion Tooltip on Hover */}
                    {isHovered && suggestion && (
                      <div 
                        className="absolute text-xs text-black bg-white border border-gray-300 rounded px-2 py-1 shadow-lg"
                        style={{
                          top: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          maxWidth: '300px',
                          zIndex: 99999
                        }}
                        onMouseEnter={() => {
                          setHoveredVacation(vacationId);
                        }}
                        onMouseLeave={() => {
                          setHoveredVacation(null);
                        }}
                      >
                        {suggestion}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-purple-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span 
                      onClick={() => handleDateClick(vacation.fromDate || vacation.startDate)}
                      className="cursor-pointer hover:text-purple-800 hover:underline transition-colors duration-200"
                      title="Click to navigate to start date"
                    >
                      {formatDate(vacation.fromDate || vacation.startDate)}
                    </span>
                    <span className="mx-2">-</span>
                    <span 
                      onClick={() => handleDateClick(vacation.toDate || vacation.endDate)}
                      className="cursor-pointer hover:text-purple-800 hover:underline transition-colors duration-200"
                      title="Click to navigate to end date"
                    >
                      {formatDate(vacation.toDate || vacation.endDate)}
                    </span>
                  </div>
                  
                    {vacation.description && (
                      <p className="text-sm text-purple-600 mt-2 italic">
                        "{vacation.description}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Smart Insights - Lazy Loaded */}
        <div ref={smartInsightsRef}>
          {showSmartInsights ? (
            <Suspense fallback={
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            }>
              <SmartInsights 
                leaveBalances={leaveBalances}
                holidays={holidays}
                vacations={vacations}
                aiInsights={aiInsights}
                aiLoading={aiLoading}
                aiError={aiError}
                weatherData={weatherData}
                allWeatherData={allWeatherData}
                weatherLoading={weatherLoading}
                weatherError={weatherError}
              />
            </Suspense>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-32 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Smart Insights loading...</div>
            </div>
          )}
        </div>

        {/* Historical Data - Lazy Loaded */}
        <div ref={historicalDataRef}>
          {showHistoricalData ? (
            <Suspense fallback={
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            }>
              <HistoricalData 
                vacations={vacations}
                onNavigateToDate={onNavigateToDate}
              />
            </Suspense>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-32 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Historical data loading...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
