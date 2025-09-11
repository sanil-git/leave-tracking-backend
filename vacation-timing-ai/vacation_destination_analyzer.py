#!/usr/bin/env python3
"""
AI-Powered Destination Insights for PlanWise
Analyzes vacation dates and recommends optimal destinations based on:
- Seasonal weather patterns
- Duration suitability  
- Travel trends and preferences
- Regional climate considerations
"""

import argparse
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

class VacationDestinationAnalyzer:
    def __init__(self):
        """Initialize the analyzer with destination and seasonal data"""
        self.destinations = {
            # Hill Stations - Best for Summer (Apr-Jun)
            "hill_stations": {
                "destinations": ["Kashmir", "Manali", "Shimla", "Darjeeling", "Coorg", "Munnar"],
                "best_months": [4, 5, 6, 7, 8, 9],  # Apr-Sep
                "climate": "cool",
                "duration_fit": {"short": 8, "medium": 9, "long": 10}
            },
            
            # Beaches - Best for Winter (Oct-Mar) 
            "beaches": {
                "destinations": ["Goa", "Kerala", "Andaman", "Puducherry"],
                "best_months": [10, 11, 12, 1, 2, 3],  # Oct-Mar
                "climate": "tropical",
                "duration_fit": {"short": 9, "medium": 10, "long": 9}
            },
            
            # Desert/Heritage - Best for Winter (Nov-Feb)
            "desert_heritage": {
                "destinations": ["Rajasthan", "Agra", "Delhi", "Jaipur"],
                "best_months": [11, 12, 1, 2],  # Nov-Feb
                "climate": "arid",
                "duration_fit": {"short": 7, "medium": 9, "long": 8}
            },
            
            # Adventure/Trekking - Best for specific seasons
            "adventure": {
                "destinations": ["Leh Ladakh", "Rishikesh", "Spiti Valley"],
                "best_months": [5, 6, 7, 8, 9],  # May-Sep
                "climate": "mountain",
                "duration_fit": {"short": 6, "medium": 8, "long": 10}
            },
            
            # International - Year-round with seasonal preferences
            "international": {
                "destinations": ["Bali", "Thailand", "Singapore", "Dubai", "Nepal"],
                "best_months": [1, 2, 3, 4, 5, 10, 11, 12],  # Avoid monsoon
                "climate": "varied",
                "duration_fit": {"short": 7, "medium": 9, "long": 10}
            }
        }
    
    def analyze_vacation_timing(self, start_date: str, end_date: str, current_destination: str = None) -> Dict:
        """
        Analyze vacation dates and recommend optimal destinations
        
        Args:
            start_date: YYYY-MM-DD format
            end_date: YYYY-MM-DD format  
            current_destination: User's current choice (optional)
            
        Returns:
            Dictionary with recommendations and analysis
        """
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            duration = (end - start).days + 1
            
            # Determine duration category
            if duration <= 5:
                duration_category = "short"
            elif duration <= 10:
                duration_category = "medium"  
            else:
                duration_category = "long"
            
            # Get season analysis
            season_info = self._analyze_season(start)
            
            # Get destination recommendations
            recommendations = self._get_destination_recommendations(
                start.month, duration_category, season_info
            )
            
            # Analyze current choice if provided
            current_analysis = None
            if current_destination:
                current_analysis = self._analyze_current_choice(
                    current_destination, start.month, duration_category
                )
            
            return {
                "vacation_analysis": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "duration": duration,
                    "duration_category": duration_category,
                    "season": season_info["name"],
                    "month": start.month
                },
                "destination_recommendations": recommendations,
                "current_destination_analysis": current_analysis,
                "ai_insights": self._generate_ai_insights(
                    season_info, duration_category, recommendations, current_analysis
                )
            }
            
        except Exception as e:
            return {"error": f"Analysis failed: {str(e)}"}
    
    def _analyze_season(self, date: datetime) -> Dict:
        """Analyze the season and travel characteristics for given date"""
        month = date.month
        
        if month in [12, 1, 2]:
            return {
                "name": "Winter",
                "characteristics": "Cool and dry, perfect for beaches and heritage sites",
                "avoid": "Hill stations might be too cold",
                "ideal_for": ["beaches", "desert_heritage", "international"]
            }
        elif month in [3, 4, 5]:
            return {
                "name": "Summer",
                "characteristics": "Hot in plains, perfect for hill stations",
                "avoid": "Desert areas and plains will be very hot",
                "ideal_for": ["hill_stations", "international"]
            }
        elif month in [6, 7, 8, 9]:
            return {
                "name": "Monsoon/Post-Monsoon",
                "characteristics": "Rainy season, lush greenery, cooler temperatures",
                "avoid": "Coastal areas might have heavy rains",
                "ideal_for": ["hill_stations", "adventure"]
            }
        else:
            return {
                "name": "Post-Monsoon",
                "characteristics": "Pleasant weather begins, transition period", 
                "avoid": "Still humid in some coastal areas",
                "ideal_for": ["hill_stations", "beaches"]
            }
    
    def _get_destination_recommendations(self, month: int, duration: str, season_info: Dict) -> List[Dict]:
        """Get ranked destination recommendations based on timing and duration"""
        recommendations = []
        
        for category, data in self.destinations.items():
            if category in season_info["ideal_for"]:
                # Calculate score based on month match and duration fit
                month_score = 10 if month in data["best_months"] else 5
                duration_score = data["duration_fit"][duration]
                total_score = (month_score + duration_score) / 2
                
                # Pick top destination from category
                top_destination = data["destinations"][0]
                
                recommendations.append({
                    "destination": top_destination,
                    "category": category.replace("_", " ").title(),
                    "score": total_score,
                    "reasoning": self._get_recommendation_reasoning(category, month, duration),
                    "climate": data["climate"]
                })
        
        # Sort by score and return top 3
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:3]
    
    def _analyze_current_choice(self, destination: str, month: int, duration: str) -> Dict:
        """Analyze user's current destination choice"""
        # Find which category the destination belongs to
        destination_category = None
        category_data = None
        
        for category, data in self.destinations.items():
            if destination in data["destinations"]:
                destination_category = category
                category_data = data
                break
        
        if not destination_category:
            return {
                "destination": destination,
                "analysis": "Unknown destination",
                "score": 5,
                "recommendation": "Consider researching seasonal weather patterns"
            }
        
        # Calculate suitability score
        month_score = 10 if month in category_data["best_months"] else 3
        duration_score = category_data["duration_fit"][duration]
        total_score = (month_score + duration_score) / 2
        
        if total_score >= 8:
            verdict = "Excellent choice!"
        elif total_score >= 6:
            verdict = "Good choice, but consider alternatives"
        else:
            verdict = "Consider other destinations for better experience"
        
        return {
            "destination": destination,
            "category": destination_category.replace("_", " ").title(),
            "score": total_score,
            "verdict": verdict,
            "analysis": self._get_choice_analysis(destination_category, month, duration)
        }
    
    def _get_recommendation_reasoning(self, category: str, month: int, duration: str) -> str:
        """Generate reasoning for destination recommendation"""
        reasons = {
            "hill_stations": f"Perfect weather to escape summer heat, ideal for {duration} trips",
            "beaches": f"Cool and dry season, best time for coastal destinations",
            "desert_heritage": f"Pleasant temperatures for sightseeing and heritage exploration",
            "adventure": f"Clear skies and accessible routes for adventure activities",
            "international": f"Good weather window and reasonable flight prices"
        }
        return reasons.get(category, "Suitable for your travel dates")
    
    def _get_choice_analysis(self, category: str, month: int, duration: str) -> str:
        """Generate analysis for user's current choice"""
        seasonal_advice = {
            "hill_stations": "Great for summer months (Apr-Sep), might be cold in winter",
            "beaches": "Perfect in winter (Oct-Mar), avoid monsoon season",
            "desert_heritage": "Best in winter (Nov-Feb), too hot in summer",
            "adventure": "Ideal in summer/post-monsoon (May-Sep), weather dependent",
            "international": "Year-round options, check specific destination weather"
        }
        return seasonal_advice.get(category, "Check local weather patterns for optimal experience")
    
    def _generate_ai_insights(self, season_info: Dict, duration: str, recommendations: List, current_analysis: Dict) -> Dict:
        """Generate AI-powered insights and suggestions"""
        insights = {
            "season_insight": f"{season_info['name']} season: {season_info['characteristics']}",
            "duration_insight": f"{duration.title()} trip ({duration}) - good for {'quick getaways' if duration == 'short' else 'comprehensive exploration' if duration == 'long' else 'balanced vacation'}",
            "top_recommendation": recommendations[0] if recommendations else None,
            "weather_tip": season_info.get("avoid", "Check weather forecasts before travel"),
            "smart_suggestion": self._generate_smart_suggestion(recommendations, current_analysis)
        }
        
        return insights
    
    def _generate_smart_suggestion(self, recommendations: List, current_analysis: Dict) -> str:
        """Generate a smart, actionable suggestion"""
        if not recommendations:
            return "Consider researching destination weather patterns for your travel dates"
        
        top_rec = recommendations[0]
        
        if current_analysis and current_analysis.get("score", 0) >= 8:
            return f"Your choice looks great! {top_rec['destination']} is also excellent for similar reasons."
        elif current_analysis and current_analysis.get("score", 0) < 6:
            return f"Consider {top_rec['destination']} instead - {top_rec['reasoning']}"
        else:
            return f"Perfect timing for {top_rec['destination']} - {top_rec['reasoning']}"

def main():
    """Command line interface for the analyzer"""
    parser = argparse.ArgumentParser(description="Analyze vacation timing and recommend destinations")
    parser.add_argument("--start-date", required=True, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", required=True, help="End date (YYYY-MM-DD)")
    parser.add_argument("--current-destination", help="Current destination choice (optional)")
    parser.add_argument("--output", choices=["json", "summary"], default="json", help="Output format")
    
    args = parser.parse_args()
    
    analyzer = VacationDestinationAnalyzer()
    result = analyzer.analyze_vacation_timing(
        args.start_date, 
        args.end_date, 
        args.current_destination
    )
    
    if args.output == "json":
        print(json.dumps(result, indent=2))
    else:
        # Print human-readable summary
        if "error" in result:
            print(f"Error: {result['error']}")
            return
        
        analysis = result["vacation_analysis"] 
        print(f"\n🎯 Vacation Analysis for {analysis['start_date']} to {analysis['end_date']}")
        print(f"Duration: {analysis['duration']} days ({analysis['duration_category']} trip)")
        print(f"Season: {analysis['season']}")
        
        insights = result["ai_insights"]
        print(f"\n💡 AI Insights:")
        print(f"• {insights['season_insight']}")
        print(f"• {insights['duration_insight']}")
        
        if result["destination_recommendations"]:
            print(f"\n🏆 Top Recommendations:")
            for i, rec in enumerate(result["destination_recommendations"], 1):
                print(f"{i}. {rec['destination']} (Score: {rec['score']:.1f})")
                print(f"   {rec['reasoning']}")
        
        if result["current_destination_analysis"]:
            current = result["current_destination_analysis"]
            print(f"\n📍 Your Choice Analysis: {current['destination']}")
            print(f"Score: {current['score']:.1f}/10 - {current['verdict']}")
            print(f"{current['analysis']}")
        
        print(f"\n🚀 Smart Suggestion: {insights['smart_suggestion']}")

if __name__ == "__main__":
    main()
