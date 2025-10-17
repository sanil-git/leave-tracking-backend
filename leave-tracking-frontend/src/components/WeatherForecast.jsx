import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets } from 'lucide-react';

const WeatherForecast = ({ vacation, weatherData, loading, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Add safety checks for undefined weatherData
  if (!weatherData || !weatherData.forecast || !Array.isArray(weatherData.forecast)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-gray-400" />
            Weather Forecast - {vacation?.destination || 'Unknown Location'}
          </h4>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-500 text-sm">
            {weatherData?.forecast_message || 'No weather data available'}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Weather Forecast
          </h4>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-gray-400" />
            Weather Forecast
          </h4>
        </div>
        <div className="text-red-500 text-sm">
          ⚠️ Weather data unavailable
        </div>
      </div>
    );
  }

  if (!weatherData || !weatherData.forecast) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return <Sun className="w-6 h-6 text-yellow-500" />;
    } else if (conditionLower.includes('cloud')) {
      return <Cloud className="w-6 h-6 text-gray-500" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('storm')) {
      return <CloudRain className="w-6 h-6 text-blue-600" />;
    } else {
      return <Cloud className="w-6 h-6 text-gray-400" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-500" />
          Weather Forecast
        </h4>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(weatherData.overall_score)}`}>
            {weatherData.overall_score}/10 {getScoreLabel(weatherData.overall_score)}
          </span>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-1">
            {weatherData.destination} • {weatherData.destination_type.replace('_', ' ')} destination
          </div>
          <div className="text-xs text-gray-600 mb-2">
            {weatherData.data_sources?.forecast_days || 0} days forecast
            {weatherData.data_sources?.historical_days > 0 && ` • ${weatherData.data_sources.historical_days} days historical data`}
            {' • Generated ' + new Date(weatherData.generated_at).toLocaleTimeString()}
          </div>
          {weatherData.forecast_message && (
            <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
              {weatherData.forecast_message}
            </div>
          )}
        </div>
      </div>

      {/* Weather Days */}
      <div className="space-y-3">
        {(weatherData.forecast || []).slice(0, isExpanded ? (weatherData.forecast || []).length : 3).map((day, index) => (
          <div key={`${day.date}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getWeatherIcon(day.condition)}
              </div>
              <div>
                <div className="font-medium text-sm">{formatDate(day.date)}</div>
                <div className="text-xs text-gray-600 capitalize">{day.condition}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span>{day.temperature.min}°-{day.temperature.max}°C</span>
              </div>
              
              {day.rain_probability > 20 && (
                <div className="flex items-center gap-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>{day.rain_probability}%</span>
                </div>
              )}
              
              {day.wind_speed > 15 && (
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <span>{day.wind_speed}km/h</span>
                </div>
              )}
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(day.suitability_score)}`}>
                {day.suitability_score}/10
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less */}
      {(weatherData.forecast || []).length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? 'Show Less' : `Show All ${(weatherData.forecast || []).length} Days`}
        </button>
      )}

      {/* AI Analysis Section */}
      {weatherData.ai_analysis && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 text-sm">🤖</span>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-800">AI Weather Intelligence</div>
              <div className="text-xs text-blue-600">Powered by AI Analysis Engine</div>
            </div>
          </div>
          
          {/* AI Recommendation */}
          <div className="mb-3 p-3 bg-white rounded-lg border border-blue-100">
            <div className="text-xs font-medium text-blue-700 mb-1">🎯 AI Recommendation</div>
            <div className="text-sm text-gray-800">{weatherData.ai_analysis.recommendation}</div>
          </div>

          {/* AI Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-2 bg-white rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700">Confidence</div>
              <div className={`text-sm font-medium ${
                weatherData.ai_analysis.confidence_level === 'high' ? 'text-green-600' :
                weatherData.ai_analysis.confidence_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {weatherData.ai_analysis.confidence_level.toUpperCase()}
              </div>
            </div>
            <div className="p-2 bg-white rounded border border-blue-100">
              <div className="text-xs font-medium text-blue-700">Risk Level</div>
              <div className={`text-sm font-medium ${
                weatherData.ai_analysis.risk_assessment === 'low' ? 'text-green-600' :
                weatherData.ai_analysis.risk_assessment === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {weatherData.ai_analysis.risk_assessment.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Weather Pattern */}
          <div className="mb-3">
            <div className="text-xs font-medium text-blue-700 mb-1">📊 Weather Pattern</div>
            <div className="text-sm text-gray-800 capitalize">{weatherData.ai_analysis.weather_pattern}</div>
          </div>

          {/* Risk Factors */}
          {(weatherData.ai_analysis.risk_factors || []).length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-red-700 mb-1">⚠️ Risk Factors</div>
              <div className="space-y-1">
                {(weatherData.ai_analysis.risk_factors || []).map((factor, index) => (
                  <div key={index} className="text-xs text-red-600">• {factor}</div>
                ))}
              </div>
            </div>
          )}

          {/* Destination Insights */}
          {(weatherData.ai_analysis.destination_insights || []).length > 0 && (
            <div>
              <div className="text-xs font-medium text-purple-700 mb-1">🏔️ Destination Insights</div>
              <div className="space-y-1">
                {(weatherData.ai_analysis.destination_insights || []).map((insight, index) => (
                  <div key={index} className="text-xs text-purple-600">• {insight}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weather Tips */}
      {(weatherData.weather_tips || []).length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm font-medium text-gray-800 mb-2">💡 Weather Tips</div>
          <div className="space-y-1">
            {(weatherData.weather_tips || []).map((tip, index) => (
              <div key={index} className="text-xs text-gray-700">{tip}</div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Data Comparison */}
      {(weatherData.historical_data || []).length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm font-medium text-purple-800 mb-2">📊 Historical Comparison (Last Year)</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-purple-700 font-medium">Historical Average</div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getScoreColor(weatherData.historical_average)}`}>
                {weatherData.historical_average}/10
              </div>
            </div>
            <div>
              <div className="text-purple-700 font-medium">Data Points</div>
              <div className="text-purple-600">{(weatherData.historical_data || []).length} days</div>
            </div>
          </div>
          {weatherData.overall_score > 0 && weatherData.historical_average > 0 && (
            <div className="mt-2 text-xs text-purple-700">
              {weatherData.overall_score > weatherData.historical_average ? '📈' : '📉'} 
              {' '}Current forecast is {Math.abs(weatherData.overall_score - weatherData.historical_average).toFixed(1)} points 
              {weatherData.overall_score > weatherData.historical_average ? ' better' : ' worse'} than last year
            </div>
          )}
        </div>
      )}

      {/* Best/Worst Days */}
      {((weatherData.best_days || []).length > 0 || (weatherData.worst_days || []).length > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(weatherData.best_days || []).length > 0 && (
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="text-xs font-medium text-green-800 mb-1">☀️ Best Days</div>
              <div className="text-xs text-green-700">
                {(weatherData.best_days || []).map(date => formatDate(date)).join(', ')}
              </div>
            </div>
          )}
          
          {(weatherData.worst_days || []).length > 0 && (
            <div className="p-2 bg-red-50 rounded-lg">
              <div className="text-xs font-medium text-red-800 mb-1">🌧️ Challenging Days</div>
              <div className="text-xs text-red-700">
                {(weatherData.worst_days || []).map(date => formatDate(date)).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attribution */}
      {weatherData.attribution && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {weatherData.attribution}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;
