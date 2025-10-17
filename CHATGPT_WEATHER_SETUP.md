# ChatGPT Weather Integration Setup

## Overview
This system integrates ChatGPT's weather knowledge with OpenWeatherMap data to provide AI-powered weather forecasts for vacation planning.

## Features
- **Smart Fallback**: Uses ChatGPT when OpenWeatherMap data is unavailable
- **Beyond 5-Day Limit**: Provides weather insights for vacations weeks/months away
- **AI-Powered Analysis**: Intelligent recommendations based on historical patterns
- **Confidence Scoring**: Rates the reliability of weather predictions

## Setup Instructions

### 1. Get ChatGPT API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Configure Environment Variables
Add to your `.env` file:
```bash
CHATGPT_API_KEY=sk-your_chatgpt_api_key_here
```

### 3. Test the Integration
The system will automatically:
- Try OpenWeatherMap first (for 0-5 day forecasts)
- Fallback to ChatGPT for longer-term predictions
- Combine both sources for comprehensive analysis

## How It Works

### Data Flow
1. **Request**: User requests weather for vacation destination
2. **OpenWeatherMap**: Try to get real-time forecast (0-5 days)
3. **ChatGPT Fallback**: If unavailable, get historical patterns from ChatGPT
4. **AI Analysis**: Process and analyze the data
5. **Response**: Return structured weather forecast with recommendations

### ChatGPT Data Structure
```json
{
  "destination": "Kashmir, India",
  "typical_temperature_range": {
    "min_celsius": 5,
    "max_celsius": 15,
    "average_celsius": 10
  },
  "precipitation": {
    "rain_probability_percentage": 40,
    "typical_rainfall_mm": 25,
    "rainy_days_expected": 5
  },
  "weather_patterns": ["Cool temperatures", "Moderate rainfall"],
  "travel_recommendations": ["Pack warm clothing", "Bring rain gear"],
  "confidence_score": 8
}
```

### Cost Considerations
- ChatGPT API costs approximately $0.002 per request
- Typical vacation planning uses 1-2 requests per destination
- Monthly cost for moderate usage: $5-10

## API Endpoints

### Weather Forecast
```
POST /api/weather-forecast
{
  "destination": "Toronto, CA",
  "startDate": "2024-11-09",
  "endDate": "2024-11-15"
}
```

### Response Format
```json
{
  "success": true,
  "destination": "Toronto, CA",
  "forecast_message": "🤖 AI-powered forecast based on historical patterns (8/10 confidence)",
  "overall_score": 7.5,
  "ai_analysis": {
    "recommendation": "Good weather conditions with some variability expected.",
    "confidence_level": "HIGH",
    "risk_level": "MEDIUM",
    "weather_pattern": "Cool temperatures",
    "destination_insights": ["Pack warm clothing", "Bring rain gear"]
  },
  "data_sources": {
    "forecast_available": false,
    "historical_available": false,
    "chatgpt_available": true
  }
}
```

## Troubleshooting

### Common Issues
1. **"ChatGPT client not available"**: Check your API key configuration
2. **Rate limiting**: ChatGPT has rate limits (3 requests/minute for free tier)
3. **Invalid API key**: Verify your key starts with `sk-`

### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG=weather:chatgpt
```

## Next Steps
This is Step 1 of the ML Weather Forecasting system. Future steps include:
- Step 2: ML Model Training on ChatGPT data
- Step 3: Prediction Accuracy Improvement
- Step 4: Real-time Model Updates
