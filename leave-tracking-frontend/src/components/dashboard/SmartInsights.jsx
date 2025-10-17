import React, { useState } from 'react';
import { Bell, CheckCircle, TrendingUp, Users, Cloud, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WeatherForecast from '../WeatherForecast';

/**
 * SmartInsights - AI-powered insights component (lazy-loaded)
 * Shows intelligent recommendations and trends
 */
const SmartInsights = ({ leaveBalances, holidays, vacations, aiInsights = {}, aiLoading = {}, aiError = {}, weatherData = {}, allWeatherData = {}, weatherLoading = false, weatherError = null }) => {
  const { t } = useTranslation();
  const [selectedWeatherModal, setSelectedWeatherModal] = useState(null);
  
  // Helper function to check if vacation is within 5 days
  const isVacationWithinFiveDays = (vacation) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vacationDate = new Date(vacation.fromDate || vacation.startDate);
    vacationDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((vacationDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 5;
  };

  // Helper function to get weather summary
  const getWeatherSummary = (vacation, weatherData) => {
    if (!weatherData || !weatherData.forecast || weatherData.forecast.length === 0) {
      return "Weather analysis not available";
    }
    
    const avgTemp = weatherData.forecast.reduce((sum, day) => sum + day.temperature.current, 0) / weatherData.forecast.length;
    const avgScore = weatherData.overall_score || 0;
    
    return `${Math.round(avgTemp)}°C • ${avgScore.toFixed(1)}/10 rating`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Bell className="w-5 h-5 text-green-600 mr-2" />
        <h4 className="font-semibold text-gray-800">{t('insights.smartInsights')}</h4>
      </div>
      
      <div className="space-y-3">
        {/* Long Weekend Alert - Emerald theme */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-emerald-900">Long Weekend Detected!</h4>
            <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm text-emerald-700">Check for upcoming long weekends</p>
        </div>

        {/* Optimal Booking - Indigo theme */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-indigo-900">Optimal Booking</h4>
            <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-sm text-indigo-700">Optimal booking recommendations</p>
        </div>

        {/* Team Sync - Violet theme */}
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-violet-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-violet-900">Team Sync</h4>
            <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <p className="text-sm text-violet-700">Team coordination insights</p>
        </div>

        {/* Compact Weather Links - Show for ALL vacations */}
        {vacations && vacations.length > 0 && (
          <div className="mt-4 space-y-2">
            {vacations.map((vacation, index) => {
              const vacationId = vacation._id || vacation.name || index;
              const vacationWeather = allWeatherData[vacationId] || weatherData || {};
              const isWithinFiveDays = isVacationWithinFiveDays(vacation);
              const weatherSummary = getWeatherSummary(vacation, vacationWeather);
              
              return (
                <div key={vacationId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-800">{vacation.destination}</div>
                      <div className="text-sm text-gray-600">
                        {isWithinFiveDays ? weatherSummary : "Weather analysis not available"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWeatherModal(vacation)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Weather Details Modal */}
      {selectedWeatherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Weather Forecast - {selectedWeatherModal.destination}
              </h3>
              <button
                onClick={() => setSelectedWeatherModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <WeatherForecast 
                vacation={selectedWeatherModal} 
                weatherData={allWeatherData[selectedWeatherModal._id || selectedWeatherModal.name] || weatherData || {}}
                loading={weatherLoading}
                error={weatherError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartInsights;
