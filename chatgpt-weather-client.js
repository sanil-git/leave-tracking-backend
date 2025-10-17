const axios = require('axios');

/**
 * ChatGPT Weather Data Client
 * Fetches weather knowledge and historical patterns from ChatGPT API
 */
class ChatGPTWeatherClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo'; // or 'gpt-4' for better accuracy
  }

  /**
   * Get weather knowledge for a specific destination and time period
   */
  async getWeatherKnowledge(destination, startDate, endDate) {
    try {
      console.log(`🤖 Fetching ChatGPT weather knowledge for ${destination} (${startDate} to ${endDate})`);
      
      const prompt = this.buildWeatherPrompt(destination, startDate, endDate);
      
      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a weather expert with extensive knowledge of global climate patterns, seasonal trends, and regional weather characteristics. Provide detailed, accurate weather information based on your training data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const weatherData = this.parseWeatherResponse(response.data.choices[0].message.content);
      
      console.log(`✅ ChatGPT weather data retrieved for ${destination}`);
      return weatherData;

    } catch (error) {
      console.error(`❌ ChatGPT weather fetch error for ${destination}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Build structured prompt for weather data
   */
  buildWeatherPrompt(destination, startDate, endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const month = startDateObj.toLocaleString('default', { month: 'long' });
    const year = startDateObj.getFullYear();

    return `
Please provide detailed weather information for ${destination} during ${month} ${year} (${startDate} to ${endDate}).

Please respond in the following JSON format:
{
  "destination": "${destination}",
  "period": "${startDate} to ${endDate}",
  "typical_temperature_range": {
    "min_celsius": number,
    "max_celsius": number,
    "average_celsius": number
  },
  "precipitation": {
    "rain_probability_percentage": number,
    "typical_rainfall_mm": number,
    "rainy_days_expected": number
  },
  "weather_patterns": [
    "pattern1", "pattern2", "pattern3"
  ],
  "seasonal_characteristics": [
    "characteristic1", "characteristic2", "characteristic3"
  ],
  "travel_recommendations": [
    "recommendation1", "recommendation2", "recommendation3"
  ],
  "clothing_suggestions": [
    "suggestion1", "suggestion2", "suggestion3"
  ],
  "weather_risks": [
    "risk1", "risk2"
  ],
  "confidence_score": number (0-10),
  "data_source": "ChatGPT knowledge base"
}

Focus on:
1. Historical weather patterns for this location and time period
2. Seasonal characteristics and typical conditions
3. Practical travel and packing advice
4. Potential weather risks or concerns
5. Overall suitability for vacation travel

Be specific and practical in your recommendations.
    `.trim();
  }

  /**
   * Parse ChatGPT response into structured weather data
   */
  parseWeatherResponse(responseText) {
    try {
      // Extract JSON from response (ChatGPT sometimes includes extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const weatherData = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the data
      return this.validateWeatherData(weatherData);
      
    } catch (error) {
      console.error('Error parsing ChatGPT weather response:', error.message);
      
      // Fallback: extract key information manually
      return this.extractWeatherInfoFromText(responseText);
    }
  }

  /**
   * Validate and clean weather data from ChatGPT
   */
  validateWeatherData(data) {
    const cleaned = {
      destination: data.destination || 'Unknown',
      period: data.period || 'Unknown period',
      typical_temperature_range: {
        min_celsius: Math.round(data.typical_temperature_range?.min_celsius || 15),
        max_celsius: Math.round(data.typical_temperature_range?.max_celsius || 25),
        average_celsius: Math.round(data.typical_temperature_range?.average_celsius || 20)
      },
      precipitation: {
        rain_probability_percentage: Math.min(100, Math.max(0, data.precipitation?.rain_probability_percentage || 30)),
        typical_rainfall_mm: Math.max(0, data.precipitation?.typical_rainfall_mm || 10),
        rainy_days_expected: Math.max(0, data.precipitation?.rainy_days_expected || 3)
      },
      weather_patterns: Array.isArray(data.weather_patterns) ? data.weather_patterns : ['Variable conditions'],
      seasonal_characteristics: Array.isArray(data.seasonal_characteristics) ? data.seasonal_characteristics : ['Seasonal weather'],
      travel_recommendations: Array.isArray(data.travel_recommendations) ? data.travel_recommendations : ['Check weather before travel'],
      clothing_suggestions: Array.isArray(data.clothing_suggestions) ? data.clothing_suggestions : ['Pack layers'],
      weather_risks: Array.isArray(data.weather_risks) ? data.weather_risks : [],
      confidence_score: Math.min(10, Math.max(0, data.confidence_score || 7)),
      data_source: 'ChatGPT knowledge base',
      timestamp: new Date().toISOString()
    };

    return cleaned;
  }

  /**
   * Fallback: Extract weather info from unstructured text
   */
  extractWeatherInfoFromText(text) {
    // Simple text extraction for fallback
    const temperatureMatch = text.match(/(\d+)[°-]?(\d+)?\s*(?:°C|celsius|degrees)/i);
    const rainMatch = text.match(/(\d+)%?\s*(?:rain|precipitation)/i);
    
    return {
      destination: 'Unknown',
      period: 'Unknown period',
      typical_temperature_range: {
        min_celsius: temperatureMatch ? parseInt(temperatureMatch[1]) : 15,
        max_celsius: temperatureMatch ? parseInt(temperatureMatch[2] || temperatureMatch[1]) : 25,
        average_celsius: temperatureMatch ? Math.round((parseInt(temperatureMatch[1]) + parseInt(temperatureMatch[2] || temperatureMatch[1])) / 2) : 20
      },
      precipitation: {
        rain_probability_percentage: rainMatch ? parseInt(rainMatch[1]) : 30,
        typical_rainfall_mm: 10,
        rainy_days_expected: 3
      },
      weather_patterns: ['Variable conditions'],
      seasonal_characteristics: ['Seasonal weather'],
      travel_recommendations: ['Check weather before travel'],
      clothing_suggestions: ['Pack layers'],
      weather_risks: [],
      confidence_score: 5,
      data_source: 'ChatGPT knowledge base (fallback)',
      timestamp: new Date().toISOString(),
      raw_response: text.substring(0, 500) // Keep first 500 chars for debugging
    };
  }

  /**
   * Get weather insights for multiple destinations (batch processing)
   */
  async getBatchWeatherKnowledge(destinations) {
    const results = {};
    
    for (const destination of destinations) {
      try {
        const weatherData = await this.getWeatherKnowledge(
          destination.name,
          destination.startDate,
          destination.endDate
        );
        
        if (weatherData) {
          results[destination.name] = weatherData;
        }
        
        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Batch processing error for ${destination.name}:`, error.message);
        results[destination.name] = null;
      }
    }
    
    return results;
  }

  /**
   * Get seasonal weather trends for a destination
   */
  async getSeasonalTrends(destination, month) {
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${month.toString().padStart(2, '0')}-28`;
    
    return await this.getWeatherKnowledge(destination, startDate, endDate);
  }
}

module.exports = ChatGPTWeatherClient;
