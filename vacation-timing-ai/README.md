# AI-Powered Destination Insights

Intelligent destination and timing analysis for existing PlanWise vacations using external APIs and seasonal data.

## 🎯 Use Case: Smart Vacation Analysis
**Problem**: Users plan vacations but don't know if their timing/destination choices are optimal  
**Solution**: AI analyzes their existing vacation dates and provides intelligent destination recommendations

## 🧠 How It Works
1. **User creates vacation**: "Summer Break - June 15-25, 2025" 
2. **Python script analyzes**: Date range, season, duration, weather patterns
3. **AI recommends**: "Perfect timing for Kashmir (escape summer heat)" or "Consider Bali (great weather, reasonable flights)"
4. **Displays in PlanWise**: Smart insights tile shows recommendations automatically

## 📋 Project Structure
- **Phase 1**: Vacation destination analyzer (Current)
- **Phase 2**: Weather intelligence integration  
- **Phase 3**: Flight price analysis
- **Phase 4**: Multi-factor optimization engine
- **Phase 5**: Integration with PlanWise AI Insights

## 🔄 Integration Flow
```
PlanWise Vacation Data → Python Analysis → Smart Recommendations → AI Insights Tile
```

## 🚀 Setup
```bash
cd vacation-timing-ai
pip install -r requirements.txt
python vacation_destination_analyzer.py --dates "2025-06-15,2025-06-25" --duration 11
```

## 🌐 APIs Used
- Weather Data: OpenWeatherMap (seasonal analysis)
- Flight Prices: Skyscanner/Amadeus (pricing trends)
- Holiday Data: Public APIs (avoid conflicts)
- Destination Data: Travel advisories and seasonal guides

## 📱 Frontend Integration
- **Location**: PlanWise Dashboard → AI Insights → "Perfect Destination" tile
- **Display**: Orange gradient tile with MapPin icon
- **Content**: Dynamic recommendations based on user's vacation data

## 🎯 Example Outputs
```python
# Summer vacation analysis
{
    "destination_analysis": {
        "current_choice": "Goa",
        "recommendation": "Consider Kashmir instead",
        "reasoning": "Escape Indian summer heat, better weather",
        "alternatives": ["Himachal", "Ladakh", "International: Bali"]
    },
    "timing_analysis": {
        "score": 8.5,
        "insights": "Perfect timing for hill stations",
        "avoid": "Plains will be very hot"
    }
}
```

## 📊 Status: Development (Local Testing Only)
Part of PlanWise backend infrastructure - provides intelligent insights for existing vacation planning decisions.
