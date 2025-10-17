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
- **Phase 1**: Vacation destination analyzer ✅ COMPLETED
- **Phase 2**: Real-time flight price scraper 🚀 IN PROGRESS
- **Phase 3**: Dynamic weather forecast integration 🚀 IN PROGRESS
- **Phase 4**: Combined flight + weather AI insights
- **Phase 5**: Multi-source data optimization engine

## 🎯 Next Implementation Plan

### **⚡ NEXT STEP: Redis Cloud Caching (High Priority)**
**Problem**: AI insights re-compute on every page refresh (slow, wasteful)  
**Solution**: Cache insights in Redis, archive to MongoDB after vacation ends

#### **Why Redis + MongoDB Hybrid?**
```
Redis (Active Vacations):
- Ultra-fast lookups (0.5ms vs 2000ms Python execution)
- TTL = Until vacation ends
- Auto-cleanup

MongoDB (Historical Archive):
- Permanent storage for past trips
- Analytics & trends ("Your avg trip rating: 8.2/10")
- Low-cost long-term storage
```

#### **Setup Instructions (Redis Cloud - Free Tier)**

**1. Create Free Redis Cloud Account:**
```
Visit: https://redis.com/try-free/
- Sign up with email (no credit card needed)
- Free Tier: 30MB RAM (enough for 15,000 AI insights!)
- Takes 3 minutes
```

**2. Create Database:**
```
1. Click "New Database"
2. Choose "Redis Stack"
3. Select region closest to your app
4. Click "Create"
```

**3. Get Connection Info:**
```
1. Click on database → "Configuration"
2. Copy "Public endpoint"
3. Copy "Default user password"
```

**4. Add to Backend `.env`:**
```bash
REDIS_URL=redis://default:YOUR_PASSWORD@redis-12345.c123.us-east-1.ec2.cloud.redislabs.com:12345
```

**5. Install Redis Client:**
```bash
cd leave-tracking-backend
npm install ioredis
```

**6. Implementation (100 lines of code):**
- Redis cache layer (30 lines)
- Archival cron job (40 lines)
- Unified lookup function (30 lines)

#### **Expected Performance Gains:**
```
Before: 2-5 seconds per page load (Python runs every time)
After:  50ms per page load (Redis cache hit)
Result: 96% faster! 🚀
```

---

### **Priority 1: Flight Price Scraper**
- **Target Sites**: Skyscanner, Kayak, Google Flights
- **Python Libraries**: `requests`, `beautifulsoup4`, `selenium`
- **Output**: Cheapest flight prices, price trends, savings tips
- **Integration**: New API endpoint `/api/flight-prices`
- **Note**: Will require Redis caching (rate limits on flight APIs)

### **Priority 2: Weather Forecast Integration**
- **Data Sources**: OpenWeatherMap API, Weather.com scraping
- **Python Libraries**: `requests`, `python-dateutil`
- **Output**: 7-day forecast, rain probability, temperature trends
- **Integration**: Enhanced AI insights with weather data

### **Priority 3: Combined Analysis**
- **Smart Recommendations**: Based on flight prices + weather
- **Cost Optimization**: Best timing for price + weather
- **Frontend Enhancement**: Display both flight and weather data

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
