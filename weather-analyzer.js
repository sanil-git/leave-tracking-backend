const axios = require('axios');

// Weather AI Analysis Engine
class WeatherAnalyzer {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  // Get weather forecast for a destination
  async getWeatherForecast(destination, startDate, endDate) {
    try {
      // Get coordinates for destination
      const coordinates = await this.getCoordinates(destination);
      if (!coordinates) {
        throw new Error('Destination not found');
      }

      // Get 7-day forecast
      const forecast = await this.getForecastData(coordinates.lat, coordinates.lon);
      
      // Filter forecast for vacation dates
      const vacationForecast = this.filterForecastForDates(forecast, startDate, endDate);
      
      // AI Analysis
      const analyzedForecast = this.analyzeWeatherForecast(vacationForecast, destination);
      
      return analyzedForecast;
    } catch (error) {
      console.error('Weather forecast error:', error.message);
      throw error;
    }
  }

  // Get coordinates for a destination
  async getCoordinates(destination) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: destination,
          appid: this.apiKey,
          units: 'metric'
        }
      });
      
      return {
        lat: response.data.coord.lat,
        lon: response.data.coord.lon,
        name: response.data.name,
        country: response.data.sys.country
      };
    } catch (error) {
      console.error('Coordinates error:', error.message);
      return null;
    }
  }

  // Get forecast data from OpenWeatherMap
  async getForecastData(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });
      
      return response.data.list;
    } catch (error) {
      console.error('Forecast data error:', error.message);
      throw error;
    }
  }

  // Filter forecast for vacation dates
  filterForecastForDates(forecast, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return forecast.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate >= start && itemDate <= end;
    });
  }

  // AI Analysis of weather forecast
  analyzeWeatherForecast(forecast, destination) {
    const destinationType = this.getDestinationType(destination);
    const analyzedDays = [];
    
    let totalScore = 0;
    let bestDays = [];
    let worstDays = [];
    
    forecast.forEach((day, index) => {
      const analysis = this.analyzeDayWeather(day, destinationType);
      analyzedDays.push(analysis);
      
      totalScore += analysis.suitability_score;
      
      if (analysis.suitability_score >= 8) {
        bestDays.push(analysis.date);
      } else if (analysis.suitability_score <= 5) {
        worstDays.push(analysis.date);
      }
    });
    
    const overallScore = forecast.length > 0 ? totalScore / forecast.length : 0;
    
    return {
      destination: destination,
      destination_type: destinationType,
      forecast: analyzedDays,
      overall_score: Math.round(overallScore * 10) / 10,
      best_days: bestDays.slice(0, 3), // Top 3 best days
      worst_days: worstDays.slice(0, 2), // Top 2 worst days
      weather_tips: this.generateWeatherTips(analyzedDays, destinationType),
      generated_at: new Date().toISOString()
    };
  }

  // Analyze individual day weather
  analyzeDayWeather(dayData, destinationType) {
    const temp = dayData.main.temp;
    const humidity = dayData.main.humidity;
    const windSpeed = dayData.wind.speed;
    const rainProbability = dayData.pop * 100; // Convert to percentage
    const condition = dayData.weather[0].main.toLowerCase();
    
    let score = 5; // Base score
    
    // Temperature scoring
    const tempRange = this.getOptimalTempRange(destinationType);
    if (temp >= tempRange.min && temp <= tempRange.max) {
      score += 3; // Perfect temperature
    } else if (temp >= tempRange.min - 5 && temp <= tempRange.max + 5) {
      score += 2; // Good temperature
    } else if (temp >= tempRange.min - 10 && temp <= tempRange.max + 10) {
      score += 1; // Acceptable temperature
    }
    
    // Precipitation penalty
    if (rainProbability > 70) {
      score -= 3; // Heavy rain
    } else if (rainProbability > 40) {
      score -= 2; // Moderate rain
    } else if (rainProbability > 20) {
      score -= 1; // Light rain
    }
    
    // Wind conditions
    const maxWind = this.getMaxWindForDestination(destinationType);
    if (windSpeed > maxWind) {
      score -= 2; // Too windy
    } else if (windSpeed > maxWind * 0.7) {
      score -= 1; // Getting windy
    }
    
    // Humidity adjustment
    if (humidity > 80) {
      score -= 1; // Too humid
    } else if (humidity < 30) {
      score -= 0.5; // Too dry
    }
    
    // Weather condition bonus/penalty
    if (condition === 'clear') {
      score += 1;
    } else if (condition === 'clouds') {
      score += 0.5;
    } else if (condition === 'rain' || condition === 'thunderstorm') {
      score -= 2;
    }
    
    // Ensure score is between 1-10
    score = Math.max(1, Math.min(10, score));
    
    return {
      date: new Date(dayData.dt * 1000).toISOString().split('T')[0],
      temperature: {
        current: Math.round(temp),
        min: Math.round(dayData.main.temp_min),
        max: Math.round(dayData.main.temp_max)
      },
      humidity: humidity,
      wind_speed: Math.round(windSpeed),
      rain_probability: Math.round(rainProbability),
      condition: condition,
      suitability_score: Math.round(score * 10) / 10,
      recommendation: this.getDayRecommendation(score, condition, destinationType)
    };
  }

  // Get destination type for weather analysis
  getDestinationType(destination) {
    const destinationLower = destination.toLowerCase();
    
    if (destinationLower.includes('goa') || destinationLower.includes('beach') || 
        destinationLower.includes('coastal') || destinationLower.includes('sea')) {
      return 'beach';
    } else if (destinationLower.includes('hill') || destinationLower.includes('mountain') || 
               destinationLower.includes('kashmir') || destinationLower.includes('manali')) {
      return 'hill_station';
    } else if (destinationLower.includes('desert') || destinationLower.includes('rajasthan')) {
      return 'desert';
    } else {
      return 'general'; // Default type
    }
  }

  // Get optimal temperature range for destination type
  getOptimalTempRange(destinationType) {
    const ranges = {
      'beach': { min: 25, max: 30 },
      'hill_station': { min: 15, max: 25 },
      'desert': { min: 20, max: 35 },
      'general': { min: 20, max: 28 }
    };
    
    return ranges[destinationType] || ranges['general'];
  }

  // Get maximum wind speed for destination type
  getMaxWindForDestination(destinationType) {
    const maxWinds = {
      'beach': 15, // km/h
      'hill_station': 25,
      'desert': 20,
      'general': 20
    };
    
    return maxWinds[destinationType] || maxWinds['general'];
  }

  // Get day-specific recommendation
  getDayRecommendation(score, condition, destinationType) {
    if (score >= 8) {
      return 'Perfect weather for your vacation!';
    } else if (score >= 6) {
      return 'Good weather conditions';
    } else if (score >= 4) {
      return 'Moderate weather - plan indoor activities';
    } else {
      return 'Poor weather - consider rescheduling';
    }
  }

  // Generate weather tips based on forecast
  generateWeatherTips(forecast, destinationType) {
    const tips = [];
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature.current, 0) / forecast.length;
    const maxRain = Math.max(...forecast.map(day => day.rain_probability));
    const maxWind = Math.max(...forecast.map(day => day.wind_speed));
    
    // Temperature-based tips
    if (avgTemp > 30) {
      tips.push('🌡️ Hot weather expected - pack light clothing and sunscreen');
    } else if (avgTemp < 15) {
      tips.push('🧥 Cool weather expected - pack warm clothing');
    }
    
    // Rain-based tips
    if (maxRain > 60) {
      tips.push('☔ Heavy rain expected - pack rain gear and umbrella');
    } else if (maxRain > 30) {
      tips.push('🌦️ Light rain possible - pack light rain jacket');
    }
    
    // Wind-based tips
    if (maxWind > 20) {
      tips.push('💨 Strong winds expected - secure loose items');
    }
    
    // Destination-specific tips
    if (destinationType === 'beach') {
      tips.push('🏖️ Beach weather - pack swimwear and beach essentials');
    } else if (destinationType === 'hill_station') {
      tips.push('🏔️ Hill station weather - pack layers for temperature changes');
    }
    
    // General tips
    if (forecast.some(day => day.condition === 'clear')) {
      tips.push('☀️ Sunny days expected - perfect for outdoor activities');
    }
    
    return tips.slice(0, 4); // Limit to 4 tips
  }
}

module.exports = WeatherAnalyzer;
