import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * HistoricalData - Past vacation data component (lazy-loaded)
 * Shows completed vacation history
 */
const HistoricalData = ({ vacations, onNavigateToDate }) => {
  const { t } = useTranslation();
  // Separate past vacations
  const pastVacations = useMemo(() => {
    if (!vacations || vacations.length === 0) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const past = vacations.filter(vacation => {
      const endDate = new Date(vacation.toDate || vacation.endDate);
      endDate.setHours(0, 0, 0, 0);
      return endDate < today;
    });
    
    return past.sort((a, b) => new Date(b.toDate || b.endDate) - new Date(a.toDate || a.endDate)); // Most recent first
  }, [vacations]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDateClick = (dateString) => {
    if (onNavigateToDate) {
      onNavigateToDate(new Date(dateString));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 text-slate-600 mr-2" />
        <h4 className="font-semibold text-gray-800">{t('insights.historicalData')}</h4>
      </div>
      
      {pastVacations.length === 0 ? (
        <p className="text-gray-500 text-sm">No past vacations to show.</p>
      ) : (
        <div className="space-y-3">
          {pastVacations.map((vacation) => (
            <div
              key={vacation._id}
              className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-slate-100"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-900">{vacation.name}</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-slate-700">
                    <Clock className="w-3 h-3 mr-1" />
                    {vacation.days || vacation.duration || 'N/A'} days
                  </div>
                  {vacation.leaveType && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vacation.leaveType === 'EL' ? 'bg-blue-100 text-blue-800' :
                      vacation.leaveType === 'SL' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {vacation.leaveType}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-slate-600">
                <span 
                  onClick={() => handleDateClick(vacation.fromDate || vacation.startDate)}
                  className="cursor-pointer hover:text-slate-800 hover:underline transition-colors duration-200"
                  title="Click to navigate to start date"
                >
                  {formatDate(vacation.fromDate || vacation.startDate)}
                </span>
                <span className="mx-2">-</span>
                <span 
                  onClick={() => handleDateClick(vacation.toDate || vacation.endDate)}
                  className="cursor-pointer hover:text-slate-800 hover:underline transition-colors duration-200"
                  title="Click to navigate to end date"
                >
                  {formatDate(vacation.toDate || vacation.endDate)}
                </span>
              </div>
              
              {vacation.description && (
                <p className="text-sm text-slate-500 mt-2 italic">
                  "{vacation.description}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricalData;
