const axios = require('axios');
const ChatGPTWeatherClient = require('./chatgpt-weather-client');
const OpenMeteoWeatherClient = require('./open-meteo-weather-client');

// Weather AI Analysis Engine
class WeatherAnalyzer {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    
    // Initialize Open-Meteo client (free, no API key required)
    this.openMeteoClient = new OpenMeteoWeatherClient();
    
    // Initialize ChatGPT client if API key provided
    this.chatgptClient = process.env.CHATGPT_API_KEY ? new ChatGPTWeatherClient(process.env.CHATGPT_API_KEY) : null;
    
    console.log('🌤️ WeatherAnalyzer initialized:');
    console.log('  📊 Open-Meteo API: ✅ Free (no key required)');
    console.log('  🌍 OpenWeatherMap API:', this.apiKey ? '✅ Present' : '❌ Missing');
    console.log('  🤖 ChatGPT Weather Client:', this.chatgptClient ? '✅ Initialized' : '❌ No API key provided');
  }

  // Get weather forecast for a destination
  async getWeatherForecast(destination, startDate, endDate) {
    try {
      console.log(`🔍 Getting weather forecast for: ${destination}`);
      
      // Try Open-Meteo first (free, reliable)
      try {
        console.log('📊 Trying Open-Meteo API...');
        
        // Get coordinates using Open-Meteo geocoding
        const coordinates = await this.openMeteoClient.getCoordinates(destination);
        console.log(`📍 Found coordinates: ${coordinates.lat}, ${coordinates.lon}`);
        
        // Get forecast from Open-Meteo
        const openMeteoData = await this.openMeteoClient.getForecast(coordinates.lat, coordinates.lon);
        
        // Filter forecast for vacation dates
        const vacationForecast = this.filterForecastForDates(openMeteoData.forecast, startDate, endDate);
        
        // Get historical weather data for same dates last year
        const historicalData = await this.getHistoricalWeatherDataOpenMeteo(coordinates.lat, coordinates.lon, startDate, endDate);
        
        // AI Analysis with both current forecast and historical data
        const analyzedForecast = this.analyzeWeatherForecast(vacationForecast, destination, historicalData);
        
        // Add Open-Meteo attribution
        analyzedForecast.attribution = openMeteoData.attribution;
        analyzedForecast.source = 'open-meteo';
        
        console.log('✅ Open-Meteo forecast successful');
        return analyzedForecast;
        
      } catch (openMeteoError) {
        console.log('⚠️ Open-Meteo failed, trying OpenWeatherMap...', openMeteoError.message);
        
        // Fallback to OpenWeatherMap if available
        if (this.apiKey) {
          const coordinates = await this.getCoordinates(destination);
          if (!coordinates) {
            throw new Error('Destination not found');
          }

          const forecast = await this.getForecastData(coordinates.lat, coordinates.lon);
          const vacationForecast = this.filterForecastForDates(forecast, startDate, endDate);
          const historicalData = await this.getHistoricalWeatherData(coordinates.lat, coordinates.lon, startDate, endDate);
          const analyzedForecast = this.analyzeWeatherForecast(vacationForecast, destination, historicalData);
          
          console.log('✅ OpenWeatherMap forecast successful');
          return analyzedForecast;
        } else {
          throw new Error('No weather API available - Open-Meteo failed and OpenWeatherMap API key missing');
        }
      }
      
    } catch (error) {
      console.error('Weather forecast error:', error.message);
      throw error;
    }
  }

  // Get ChatGPT weather knowledge when OpenWeatherMap data is limited
  async getChatGPTWeatherForecast(destination, startDate, endDate) {
    if (!this.chatgptClient) {
      console.log('🤖 ChatGPT client not available - skipping AI weather analysis');
      return null;
    }

    try {
      console.log(`🤖 Fetching ChatGPT weather knowledge for ${destination}`);
      
      const chatgptData = await this.chatgptClient.getWeatherKnowledge(destination, startDate, endDate);
      
      if (!chatgptData) {
        console.log('🤖 No ChatGPT weather data received');
        return null;
      }

      // Convert ChatGPT data to our forecast format
      const convertedForecast = this.convertChatGPTToForecast(chatgptData, startDate, endDate);
      
      // Perform AI analysis on ChatGPT data
      const analyzedForecast = this.analyzeChatGPTWeatherForecast(convertedForecast, destination, chatgptData);
      
      return analyzedForecast;
      
    } catch (error) {
      console.error('ChatGPT weather forecast error:', error.message);
      return null;
    }
  }

  // Get coordinates for a destination
  async getCoordinates(destination) {
    try {
      console.log('🔍 Looking up coordinates for destination:', destination);
      
      // Clean destination name for OpenWeather API
      const cleanDestination = this.cleanDestinationName(destination);
      console.log('🧹 Cleaned destination:', cleanDestination);
      
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: cleanDestination,
          appid: this.apiKey,
          units: 'metric'
        }
      });
      
      console.log('✅ Found coordinates for:', response.data.name, response.data.sys.country);
      return {
        lat: response.data.coord.lat,
        lon: response.data.coord.lon,
        name: response.data.name,
        country: response.data.sys.country
      };
    } catch (error) {
      console.error('❌ Coordinates error for destination:', destination, 'Error:', error.response?.status, error.response?.data?.message || error.message);
      return null;
    }
  }

  // Clean destination name for OpenWeather API
  cleanDestinationName(destination) {
    if (!destination) return destination;
    
    // Remove country codes in parentheses like "(IN)", "(CA)", etc.
    let cleaned = destination.replace(/\s*\([A-Z]{2}\)\s*$/, '');
    let countryCode = 'IN'; // Default to India
    
    // Extract country code if present
    const countryMatch = destination.match(/\(([A-Z]{2})\)$/);
    if (countryMatch) {
      countryCode = countryMatch[1];
    }
    
    // Handle common destination mappings
    const mappings = {
      'Kashmir': 'Srinagar,IN', // Kashmir -> Srinagar (main city)
      'Dehradun': 'Dehradun,IN',
      'Mumbai': 'Mumbai,IN',
      'Delhi': 'New Delhi,IN',
      'Goa': 'Panaji,IN', // Goa -> Panaji (capital)
      'Bangalore': 'Bangalore,IN',
      'Chennai': 'Chennai,IN',
      'Kolkata': 'Kolkata,IN',
      'Hyderabad': 'Hyderabad,IN',
      'Pune': 'Pune,IN',
      'Toronto': 'Toronto,CA',
      'Vancouver': 'Vancouver,CA',
      'Montreal': 'Montreal,CA',
      'Calgary': 'Calgary,CA',
      'Ottawa': 'Ottawa,CA',
      'Bangkok': 'Bangkok,TH'
    };
    
    // Check for exact matches first
    if (mappings[cleaned]) {
      return mappings[cleaned];
    }
    
    // If no mapping found, try the cleaned name with appropriate country code
    return `${cleaned},${countryCode}`;
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

  // Get historical weather data using Open-Meteo (free)
  async getHistoricalWeatherDataOpenMeteo(lat, lon, startDate, endDate) {
    try {
      console.log(`📅 Getting historical weather for ${startDate} to ${endDate} using Open-Meteo`);
      
      const historicalData = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Get data for each day in the vacation period
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        try {
          const dateStr = date.toISOString().split('T')[0];
          const lastYearDate = new Date(date);
          lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
          const lastYearDateStr = lastYearDate.toISOString().split('T')[0];
          
          // Get historical data from Open-Meteo (free)
          const historicalDay = await this.openMeteoClient.getHistoricalWeather(lat, lon, lastYearDateStr);
          
          historicalData.push({
            date: dateStr,
            temperature: historicalDay.temperature,
            condition: historicalDay.condition,
            description: historicalDay.description,
            wind: historicalDay.wind,
            precipitation: historicalDay.precipitation,
            attribution: historicalDay.attribution
          });
          
        } catch (dayError) {
          console.error(`⚠️ Historical data unavailable for ${date.toISOString().split('T')[0]}:`, dayError.message);
        }
      }
      
      console.log(`📊 Retrieved ${historicalData.length} days of historical weather data from Open-Meteo`);
      return historicalData;
      
    } catch (error) {
      console.error('Open-Meteo historical weather data error:', error.message);
      return [];
    }
  }

  // Get historical weather data for same dates last year (OpenWeatherMap - requires paid API)
  async getHistoricalWeatherData(lat, lon, startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Calculate same dates last year
      const lastYearStart = new Date(start.getFullYear() - 1, start.getMonth(), start.getDate());
      const lastYearEnd = new Date(end.getFullYear() - 1, end.getMonth(), end.getDate());
      
      console.log(`📅 Getting historical weather for ${lastYearStart.toDateString()} to ${lastYearEnd.toDateString()}`);
      
      // Get historical data for each day in the range
      const historicalData = [];
      const currentDate = new Date(lastYearStart);
      
      while (currentDate <= lastYearEnd) {
        try {
          const timestamp = Math.floor(currentDate.getTime() / 1000);
          const response = await axios.get(`${this.baseUrl}/onecall/timemachine`, {
            params: {
              lat: lat,
              lon: lon,
              dt: timestamp,
              appid: this.apiKey,
              units: 'metric'
            }
          });
          
          if (response.data && response.data.current) {
            historicalData.push({
              date: currentDate.toISOString().split('T')[0],
              timestamp: timestamp,
              ...response.data.current
            });
          }
        } catch (dayError) {
          console.warn(`⚠️ Historical data unavailable for ${currentDate.toDateString()}:`, dayError.message);
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`📊 Retrieved ${historicalData.length} days of historical weather data`);
      return historicalData;
    } catch (error) {
      console.error('Historical weather data error:', error.message);
      return []; // Return empty array if historical data fails
    }
  }

  // Smart forecast filtering based on vacation dates
  filterForecastForDates(forecast, startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vacationStart = new Date(startDate);
    vacationStart.setHours(0, 0, 0, 0);
    
    // Calculate days until vacation
    const daysUntilVacation = Math.ceil((vacationStart - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilVacation > 5) {
      console.log(`❌ Vacation is ${daysUntilVacation} days away (beyond 5-day forecast limit). No forecast available.`);
      return []; // Return empty array for vacations beyond 5 days
    } else if (daysUntilVacation >= 3) {
      // Show full 5-day forecast if vacation is 3-5 days away
      console.log(`📅 Vacation is ${daysUntilVacation} days away. Showing full 5-day forecast.`);
      return this.createDailySummary(forecast);
    } else {
      // Show 3-day forecast (today + 2 days) if vacation is within 2 days
      console.log(`📅 Vacation is ${daysUntilVacation} days away. Showing 3-day forecast (today + 2 days).`);
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 2);
      threeDaysFromNow.setHours(23, 59, 59, 999);
      
      const filteredForecast = forecast.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= today && itemDate <= threeDaysFromNow;
      });

      return this.createDailySummary(filteredForecast);
    }
  }

  // Create daily summary from hourly forecast data
  createDailySummary(forecast) {
    const dailyData = {};
    
    forecast.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          temps: [],
          humidity: [],
          wind: [],
          rain: [],
          conditions: []
        };
      }
      
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].wind.push(item.wind.speed);
      dailyData[date].rain.push((item.pop || 0) * 100);
      dailyData[date].conditions.push(item.weather[0].main);
    });
    
    // Convert to daily averages
    return Object.values(dailyData).map(day => ({
      dt: new Date(day.date).getTime() / 1000,
      main: {
        temp: Math.round((day.temps.reduce((a, b) => a + b, 0) / day.temps.length) * 10) / 10,
        temp_min: Math.min(...day.temps),
        temp_max: Math.max(...day.temps),
        humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length)
      },
      wind: {
        speed: Math.round((day.wind.reduce((a, b) => a + b, 0) / day.wind.length) * 10) / 10
      },
      pop: Math.max(...day.rain) / 100, // Use max rain probability for the day
      weather: [{
        main: this.getMostCommonCondition(day.conditions)
      }]
    }));
  }

  // Get most common weather condition for the day
  getMostCommonCondition(conditions) {
    const counts = {};
    conditions.forEach(condition => {
      counts[condition] = (counts[condition] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  // AI Analysis of weather forecast with historical data
  analyzeWeatherForecast(forecast, destination, historicalData = []) {
    const destinationType = this.getDestinationType(destination);
    const analyzedDays = [];
    const historicalInsights = [];
    
    let totalScore = 0;
    let bestDays = [];
    let worstDays = [];
    
    // Analyze current forecast
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
    
    // Analyze historical data for comparison
    if (historicalData.length > 0) {
      historicalData.forEach((day, index) => {
        const historicalAnalysis = this.analyzeDayWeather(day, destinationType);
        historicalInsights.push({
          ...historicalAnalysis,
          is_historical: true,
          year: new Date(day.date).getFullYear()
        });
      });
    }
    
    const overallScore = forecast.length > 0 ? totalScore / forecast.length : 0;
    
    // Calculate historical average for comparison
    const historicalAverage = historicalInsights.length > 0 
      ? historicalInsights.reduce((sum, day) => sum + day.suitability_score, 0) / historicalInsights.length 
      : 0;
    
    // AI-Powered Analysis
    const aiAnalysis = this.performAIWeatherAnalysis(analyzedDays, destinationType, destination);
    
    // Smart forecast message based on availability
    let forecastMessage = '';
    if (forecast.length === 0) {
      forecastMessage = '❌ Forecast unavailable - vacation is beyond 5-day forecast limit';
    } else if (forecast.length === 3) {
      forecastMessage = `📅 3-day forecast available (today + 2 days)`;
    } else if (forecast.length === 5) {
      forecastMessage = `📅 Full 5-day forecast available`;
    } else if (forecast.length < 3) {
      forecastMessage = `📅 Limited forecast data (${forecast.length} days available)`;
    } else {
      forecastMessage = `📅 ${forecast.length}-day forecast available`;
    }
    
    return {
      destination: destination,
      destination_type: destinationType,
      forecast: analyzedDays,
      historical_data: historicalInsights,
      overall_score: Math.round(overallScore * 10) / 10,
      historical_average: Math.round(historicalAverage * 10) / 10,
      best_days: bestDays.slice(0, 3), // Top 3 best days
      worst_days: worstDays.slice(0, 2), // Top 2 worst days
      weather_tips: this.generateWeatherTips(analyzedDays, destinationType, historicalInsights),
      forecast_message: forecastMessage,
      ai_analysis: aiAnalysis,
      data_sources: {
        forecast_available: forecast.length > 0,
        historical_available: historicalData.length > 0,
        forecast_days: forecast.length,
        historical_days: historicalData.length
      },
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
        destinationLower.includes('coastal') || destinationLower.includes('sea') ||
        destinationLower.includes('vancouver')) {
      return 'beach';
    } else if (destinationLower.includes('hill') || destinationLower.includes('mountain') || 
               destinationLower.includes('kashmir') || destinationLower.includes('manali') ||
               destinationLower.includes('banff') || destinationLower.includes('jasper')) {
      return 'hill_station';
    } else if (destinationLower.includes('desert') || destinationLower.includes('rajasthan')) {
      return 'desert';
    } else if (destinationLower.includes('toronto') || destinationLower.includes('montreal') ||
               destinationLower.includes('ottawa') || destinationLower.includes('calgary')) {
      return 'city'; // Major Canadian cities
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
      'city': { min: 18, max: 26 },
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
      'city': 25,
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

  // AI-Powered Weather Analysis
  performAIWeatherAnalysis(forecast, destinationType, destination) {
    if (forecast.length === 0) {
      return {
        confidence_level: 'low',
        risk_assessment: 'unknown',
        recommendation: 'Insufficient data for AI analysis',
        weather_pattern: 'unknown',
        optimal_timing: null,
        risk_factors: []
      };
    }

    // Analyze weather patterns
    const temperatures = forecast.map(day => day.temperature.current);
    const rainProbabilities = forecast.map(day => day.rain_probability);
    const windSpeeds = forecast.map(day => day.wind_speed);
    const conditions = forecast.map(day => day.condition);

    // Calculate AI metrics
    const tempVariation = Math.max(...temperatures) - Math.min(...temperatures);
    const avgRain = rainProbabilities.reduce((sum, prob) => sum + prob, 0) / rainProbabilities.length;
    const maxWind = Math.max(...windSpeeds);
    const clearDays = conditions.filter(condition => condition === 'clear').length;
    const rainyDays = conditions.filter(condition => condition.includes('rain')).length;

    // AI Confidence Level
    let confidenceLevel = 'medium';
    if (forecast.length >= 5) confidenceLevel = 'high';
    else if (forecast.length < 3) confidenceLevel = 'low';

    // Risk Assessment
    let riskAssessment = 'low';
    const riskFactors = [];

    if (avgRain > 60) {
      riskAssessment = 'high';
      riskFactors.push('Heavy rain expected');
    } else if (avgRain > 30) {
      riskAssessment = 'medium';
      riskFactors.push('Moderate rain risk');
    }

    if (maxWind > 25) {
      riskAssessment = 'high';
      riskFactors.push('Strong winds expected');
    } else if (maxWind > 15) {
      riskFactors.push('Moderate winds');
    }

    if (tempVariation > 15) {
      riskFactors.push('High temperature variation');
    }

    // Weather Pattern Analysis
    let weatherPattern = 'stable';
    if (rainyDays > clearDays) weatherPattern = 'unsettled';
    else if (clearDays > rainyDays * 2) weatherPattern = 'sunny';
    else if (tempVariation > 10) weatherPattern = 'variable';

    // Optimal Timing Recommendation
    let optimalTiming = null;
    const bestDay = forecast.reduce((best, current) => 
      current.suitability_score > best.suitability_score ? current : best
    );

    if (bestDay.suitability_score >= 7) {
      optimalTiming = {
        date: bestDay.date,
        reason: `Best weather conditions with ${bestDay.suitability_score}/10 score`,
        confidence: confidenceLevel
      };
    }

    // AI Recommendation
    let recommendation = '';
    if (riskAssessment === 'low' && overallScore >= 7) {
      recommendation = 'Excellent conditions for your vacation! Perfect time to visit.';
    } else if (riskAssessment === 'medium') {
      recommendation = 'Good conditions with some weather variability. Pack accordingly.';
    } else if (riskAssessment === 'high') {
      recommendation = 'Challenging weather expected. Consider flexible travel plans.';
    } else {
      recommendation = 'Weather conditions are moderate. Plan activities based on daily forecasts.';
    }

    // Destination-specific AI insights
    const destinationInsights = this.getDestinationAIInsights(destination, destinationType, forecast);

    return {
      confidence_level: confidenceLevel,
      risk_assessment: riskAssessment,
      recommendation: recommendation,
      weather_pattern: weatherPattern,
      optimal_timing: optimalTiming,
      risk_factors: riskFactors,
      ai_metrics: {
        temperature_variation: Math.round(tempVariation * 10) / 10,
        average_rain_probability: Math.round(avgRain),
        max_wind_speed: maxWind,
        clear_days: clearDays,
        rainy_days: rainyDays,
        weather_stability: Math.round((clearDays / forecast.length) * 100)
      },
      destination_insights: destinationInsights,
      generated_by: 'AI Weather Analysis Engine'
    };
  }

  // Get AI insights specific to destination type
  getDestinationAIInsights(destination, destinationType, forecast) {
    const insights = [];

    switch (destinationType) {
      case 'hill_station':
        insights.push('🏔️ Hill station destination detected');
        if (forecast.some(day => day.temperature.current < 10)) {
          insights.push('⚠️ Cold temperatures expected - pack warm clothing');
        }
        insights.push('💡 Layer clothing recommended for temperature changes');
        break;

      case 'beach':
        insights.push('🏖️ Beach destination detected');
        if (forecast.some(day => day.rain_probability > 40)) {
          insights.push('⚠️ Rain may affect beach activities');
        }
        insights.push('💡 Sunscreen and swimwear recommended');
        break;

      case 'desert':
        insights.push('🏜️ Desert destination detected');
        if (forecast.some(day => day.temperature.current > 35)) {
          insights.push('⚠️ Extreme heat expected - plan indoor activities');
        }
        insights.push('💡 Hydration and sun protection essential');
        break;

      case 'city':
        insights.push('🏙️ Major city destination detected');
        if (forecast.some(day => day.temperature.current < 5)) {
          insights.push('⚠️ Cold weather expected - pack warm clothing');
        } else if (forecast.some(day => day.temperature.current > 30)) {
          insights.push('⚠️ Hot weather expected - stay hydrated');
        }
        insights.push('💡 Urban exploration weather - comfortable for city activities');
        break;

      default:
        insights.push('🌍 General destination - weather conditions suitable for most activities');
    }

    return insights;
  }

  // Generate weather tips based on forecast and historical data
  generateWeatherTips(forecast, destinationType, historicalData = []) {
    const tips = [];
    
    // Combine forecast and historical data for comprehensive analysis
    const allData = [...forecast, ...historicalData];
    const forecastData = forecast.length > 0 ? forecast : historicalData;
    
    if (forecastData.length === 0) return tips;
    
    const avgTemp = forecastData.reduce((sum, day) => sum + day.temperature.current, 0) / forecastData.length;
    const maxRain = Math.max(...forecastData.map(day => day.rain_probability));
    const maxWind = Math.max(...forecastData.map(day => day.wind_speed));
    
    // Historical comparison tips
    if (historicalData.length > 0 && forecast.length > 0) {
      const historicalAvgTemp = historicalData.reduce((sum, day) => sum + day.temperature.current, 0) / historicalData.length;
      const tempDiff = avgTemp - historicalAvgTemp;
      
      if (Math.abs(tempDiff) > 3) {
        const trend = tempDiff > 0 ? 'warmer' : 'cooler';
        tips.push(`📊 Weather trend: ${Math.abs(tempDiff).toFixed(1)}°C ${trend} than last year`);
      }
    }
    
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
    if (forecastData.some(day => day.condition === 'clear')) {
      tips.push('☀️ Sunny days expected - perfect for outdoor activities');
    }
    
    // Historical reliability tip
    if (historicalData.length > 0 && forecast.length === 0) {
      tips.push('📈 Using historical data - generally reliable for seasonal patterns');
    }
    
    return tips.slice(0, 5); // Limit to 5 tips
  }

  // Convert ChatGPT weather data to our forecast format
  convertChatGPTToForecast(chatgptData, startDate, endDate) {
    const forecast = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      // Generate daily forecast based on ChatGPT data
      const dayForecast = {
        date: currentDate.toISOString().split('T')[0],
        temperature: {
          current: chatgptData.typical_temperature_range.average_celsius,
          min: chatgptData.typical_temperature_range.min_celsius,
          max: chatgptData.typical_temperature_range.max_celsius
        },
        condition: this.inferWeatherCondition(chatgptData),
        rain_probability: chatgptData.precipitation.rain_probability_percentage,
        humidity: Math.round(50 + Math.random() * 30), // Estimate humidity
        wind_speed: Math.round(5 + Math.random() * 10), // Estimate wind
        suitability_score: this.calculateChatGPTSuitabilityScore(chatgptData)
      };
      
      forecast.push(dayForecast);
    }
    
    return forecast;
  }

  // Infer weather condition from ChatGPT data
  inferWeatherCondition(chatgptData) {
    const rainProb = chatgptData.precipitation.rain_probability_percentage;
    const temp = chatgptData.typical_temperature_range.average_celsius;
    
    if (rainProb > 60) return 'Rain';
    if (rainProb > 30) return 'Clouds';
    if (temp > 25) return 'Clear';
    if (temp < 10) return 'Snow';
    return 'Partly Cloudy';
  }

  // Calculate suitability score from ChatGPT data
  calculateChatGPTSuitabilityScore(chatgptData) {
    let score = 5; // Base score
    
    // Temperature scoring
    const temp = chatgptData.typical_temperature_range.average_celsius;
    if (temp >= 18 && temp <= 28) score += 2;
    else if (temp >= 15 && temp <= 30) score += 1;
    
    // Rain probability scoring
    const rainProb = chatgptData.precipitation.rain_probability_percentage;
    if (rainProb < 20) score += 2;
    else if (rainProb < 40) score += 1;
    else if (rainProb > 70) score -= 2;
    
    // Confidence scoring
    const confidence = chatgptData.confidence_score || 7;
    score += (confidence - 5) * 0.2;
    
    return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
  }

  // Analyze ChatGPT weather forecast
  analyzeChatGPTWeatherForecast(forecast, destination, chatgptData) {
    const destinationType = this.getDestinationType(destination);
    const analyzedDays = forecast.map(day => this.analyzeDayWeather(day, destinationType));
    
    // Calculate overall metrics
    const overallScore = analyzedDays.reduce((sum, day) => sum + day.suitability_score, 0) / analyzedDays.length;
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature.current, 0) / forecast.length;
    const avgRainProb = forecast.reduce((sum, day) => sum + day.rain_probability, 0) / forecast.length;
    
    // AI Analysis for ChatGPT data
    const aiAnalysis = {
      recommendation: this.getChatGPTRecommendation(chatgptData, overallScore),
      confidence_level: chatgptData.confidence_score > 8 ? 'HIGH' : chatgptData.confidence_score > 6 ? 'MEDIUM' : 'LOW',
      risk_level: avgRainProb > 60 ? 'HIGH' : avgRainProb > 30 ? 'MEDIUM' : 'LOW',
      weather_pattern: chatgptData.weather_patterns[0] || 'Variable',
      risk_factors: chatgptData.weather_risks || [],
      destination_insights: chatgptData.travel_recommendations || []
    };
    
    return {
      destination: destination,
      destination_type: destinationType,
      forecast: analyzedDays,
      overall_score: Math.round(overallScore * 10) / 10,
      average_temperature: Math.round(avgTemp),
      average_rain_probability: Math.round(avgRainProb),
      forecast_message: `🤖 AI-powered forecast based on historical patterns (${chatgptData.confidence_score}/10 confidence)`,
      ai_analysis: aiAnalysis,
      weather_tips: chatgptData.clothing_suggestions || [],
      data_sources: {
        forecast_available: false,
        historical_available: false,
        chatgpt_available: true
      },
      chatgpt_data: chatgptData
    };
  }

  // Get ChatGPT-based recommendation
  getChatGPTRecommendation(chatgptData, overallScore) {
    if (overallScore >= 8) {
      return 'Excellent weather conditions expected for your vacation!';
    } else if (overallScore >= 6) {
      return 'Good weather conditions with some variability expected.';
    } else if (overallScore >= 4) {
      return 'Mixed weather conditions - prepare for various scenarios.';
    } else {
      return 'Challenging weather conditions expected - plan accordingly.';
    }
  }
}

module.exports = WeatherAnalyzer;
