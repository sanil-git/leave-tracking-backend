const axios = require('axios');

/**
 * Open-Meteo Weather Client
 * Free weather API with no API key required
 * Rate limits: 10,000 requests/day, 5,000/hour, 600/minute
 * Attribution required under CC-BY 4.0 license
 */
class OpenMeteoWeatherClient {
  constructor() {
    this.baseUrl = 'https://api.open-meteo.com/v1';
    this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';
  }

  /**
   * Get coordinates for a location using Open-Meteo geocoding
   */
  async getCoordinates(location) {
    try {
      const response = await axios.get(`${this.geocodingUrl}/search`, {
        params: {
          name: location,
          count: 1,
          language: 'en',
          format: 'json'
        },
        timeout: 5000
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.latitude,
          lon: result.longitude,
          name: result.name,
          country: result.country,
          admin1: result.admin1 // State/Province
        };
      }
      
      throw new Error(`Location not found: ${location}`);
    } catch (error) {
      console.error(`Geocoding error for ${location}:`, error.message);
      throw error;
    }
  }

  /**
   * Get current weather forecast (7 days)
   */
  async getForecast(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current_weather: true,
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'temperature_2m_mean',
            'apparent_temperature_max',
            'apparent_temperature_min',
            'precipitation_sum',
            'rain_sum',
            'snowfall_sum',
            'precipitation_hours',
            'weather_code',
            'sunshine_duration',
            'wind_speed_10m_max',
            'wind_gusts_10m_max',
            'wind_direction_10m_dominant'
          ],
          timezone: 'auto'
        },
        timeout: 8000
      });

      return this.parseForecastData(response.data);
    } catch (error) {
      console.error('Forecast error:', error.message);
      throw error;
    }
  }

  /**
   * Get historical weather data
   */
  async getHistoricalWeather(lat, lon, date) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          start_date: date,
          end_date: date,
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'temperature_2m_mean',
            'precipitation_sum',
            'weather_code',
            'wind_speed_10m_max',
            'wind_direction_10m_dominant'
          ],
          timezone: 'auto'
        },
        timeout: 8000
      });

      return this.parseHistoricalData(response.data, date);
    } catch (error) {
      console.error(`Historical weather error for ${date}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse forecast data into our standard format
   */
  parseForecastData(data) {
    const daily = data.daily;
    const current = data.current_weather;
    
    const forecast = [];
    
    // Add current weather as first day
    if (current) {
      forecast.push({
        date: new Date(current.time).toISOString().split('T')[0],
        temperature: {
          current: Math.round(current.temperature),
          min: Math.round(current.temperature - 2), // Estimate
          max: Math.round(current.temperature + 2)
        },
        condition: this.getWeatherCondition(current.weathercode),
        description: this.getWeatherDescription(current.weathercode),
        wind: {
          speed: Math.round(current.windspeed * 3.6), // Convert m/s to km/h
          direction: current.winddirection,
          gust: Math.round(current.windspeed * 3.6 * 1.3) // Estimate
        },
        humidity: 65, // Default estimate
        precipitation: {
          probability: 20, // Default estimate
          amount: 0
        }
      });
    }

    // Add daily forecast (skip first day if we have current weather)
    const startIndex = current ? 1 : 0;
    for (let i = startIndex; i < Math.min(daily.time.length, 7); i++) {
      forecast.push({
        date: daily.time[i],
        temperature: {
          current: Math.round(daily.temperature_2m_mean[i]),
          min: Math.round(daily.temperature_2m_min[i]),
          max: Math.round(daily.temperature_2m_max[i])
        },
        condition: this.getWeatherCondition(daily.weather_code[i]),
        description: this.getWeatherDescription(daily.weather_code[i]),
        wind: {
          speed: Math.round(daily.wind_speed_10m_max[i] * 3.6),
          direction: daily.wind_direction_10m_dominant[i],
          gust: Math.round(daily.wind_gusts_10m_max[i] * 3.6)
        },
        humidity: 70, // Default estimate
        precipitation: {
          probability: daily.precipitation_hours[i] > 0 ? Math.min(daily.precipitation_hours[i] * 15, 100) : 10,
          amount: Math.round(daily.precipitation_sum[i] * 10) / 10 // mm
        },
        sunshine: Math.round(daily.sunshine_duration[i] / 3600) // Convert seconds to hours
      });
    }

    return {
      location: data.location || 'Unknown',
      forecast: forecast,
      attribution: 'Weather data by Open-Meteo.com (CC-BY 4.0)',
      source: 'open-meteo'
    };
  }

  /**
   * Parse historical data
   */
  parseHistoricalData(data, date) {
    const daily = data.daily;
    
    if (!daily || !daily.time || daily.time.length === 0) {
      throw new Error(`No historical data available for ${date}`);
    }

    return {
      date: date,
      temperature: {
        current: Math.round(daily.temperature_2m_mean[0]),
        min: Math.round(daily.temperature_2m_min[0]),
        max: Math.round(daily.temperature_2m_max[0])
      },
      condition: this.getWeatherCondition(daily.weather_code[0]),
      description: this.getWeatherDescription(daily.weather_code[0]),
      wind: {
        speed: Math.round(daily.wind_speed_10m_max[0] * 3.6),
        direction: daily.wind_direction_10m_dominant[0]
      },
      precipitation: {
        amount: Math.round(daily.precipitation_sum[0] * 10) / 10
      },
      attribution: 'Weather data by Open-Meteo.com (CC-BY 4.0)'
    };
  }

  /**
   * Convert Open-Meteo weather codes to our condition format
   */
  getWeatherCondition(code) {
    const weatherCodes = {
      0: 'clear',
      1: 'clear', 2: 'clear', 3: 'clear',
      45: 'fog', 48: 'fog',
      51: 'rain', 53: 'rain', 55: 'rain',
      56: 'rain', 57: 'rain',
      61: 'rain', 63: 'rain', 65: 'rain',
      66: 'rain', 67: 'rain',
      71: 'snow', 73: 'snow', 75: 'snow',
      77: 'snow',
      80: 'rain', 81: 'rain', 82: 'rain',
      85: 'snow', 86: 'snow',
      95: 'storm', 96: 'storm', 99: 'storm'
    };
    return weatherCodes[code] || 'unknown';
  }

  /**
   * Get human-readable weather description
   */
  getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      66: 'Light freezing rain', 67: 'Heavy freezing rain',
      71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
      85: 'Slight snow showers', 86: 'Heavy snow showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  }
}

module.exports = OpenMeteoWeatherClient;
