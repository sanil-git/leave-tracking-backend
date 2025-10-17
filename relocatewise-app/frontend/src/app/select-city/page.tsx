'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building, Mountain, Waves, Sun, TreePine, Castle, Landmark, Home, Anchor, Flower2, Zap, Factory, Ship, Crown, Gavel, Minus } from 'lucide-react';

const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Kanpur', state: 'Uttar Pradesh' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Thane', state: 'Maharashtra' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { city: 'Pimpri-Chinchwad', state: 'Maharashtra' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Vadodara', state: 'Gujarat' }
];

const getCityIcon = (cityName: string) => {
  const iconStyle = "w-8 h-8 object-contain";
  
  switch (cityName) {
    case 'Mumbai':
      return <img src="https://imgur.com/8cMumbai.png" alt="Mumbai Indians" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwN0JGRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzAwN0JGRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Delhi':
      return <img src="https://imgur.com/6cDelhi.png" alt="Delhi Capitals" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0VGMzQzNSIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI0VGMzQzNSIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Bangalore':
      return <img src="https://imgur.com/2aRCB.png" alt="Royal Challengers Bangalore" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0VGMzQzNSIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI0VGMzQzNSIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Hyderabad':
      return <img src="https://imgur.com/81SRH.png" alt="Sunrisers Hyderabad" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0ZGNjEwMCIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI0ZGNjEwMCIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Chennai':
      return <img src="https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg" alt="Chennai Super Kings" className={iconStyle} />;
    case 'Kolkata':
      return <img src="https://upload.wikimedia.org/wikipedia/en/4/4c/Kolkata_Knight_Riders_Logo.svg" alt="Kolkata Knight Riders" className={iconStyle} />;
    case 'Pune':
      return <img src="https://imgur.com/9aRPS.png" alt="Rising Pune Supergiant" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzYzNjZGRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzYzNjZGRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Chandigarh':
      return <img src="https://upload.wikimedia.org/wikipedia/en/d/d4/Punjab_Kings_Logo.svg" alt="Punjab Kings" className={iconStyle} />;
    case 'Ahmedabad':
      return <img src="https://imgur.com/0bGT.png" alt="Gujarat Titans" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwN0JGRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzAwN0JGRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Jaipur':
      return <img src="https://imgur.com/60RR.png" alt="Rajasthan Royals" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0VCNzNBRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI0VCNzNBRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Kochi':
      return <img src="https://imgur.com/8cKTK.png" alt="Kochi Tuskers Kerala" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzEwQjk4MSIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzEwQjk4MSIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Surat':
      return <img src="https://imgur.com/0bGT.png" alt="Gujarat Titans" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwN0JGRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzAwN0JGRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Lucknow':
      return <img src="https://imgur.com/9bLSG.png" alt="Lucknow Super Giants" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzEwQjk4MSIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzEwQjk4MSIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Kanpur':
      return <img src="https://imgur.com/9bLSG.png" alt="Lucknow Super Giants" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzEwQjk4MSIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzEwQjk4MSIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Nagpur':
      return <img src="https://imgur.com/60RR.png" alt="Rajasthan Royals" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0VCNzNBRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI0VCNzNBRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Indore':
      return <img src="https://imgur.com/60RR.png" alt="Rajasthan Royals" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0VCNzNBRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI0VCNzNBRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Thane':
      return <img src="https://imgur.com/8cMumbai.png" alt="Mumbai Indians" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwN0JGRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzAwN0JGRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Bhopal':
      return <img src="https://imgur.com/60RR.png" alt="Rajasthan Royals" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0VCNzNBRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI0VCNzNBRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Visakhapatnam':
      return <img src="https://imgur.com/81SRH.png" alt="Sunrisers Hyderabad" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0ZGNjEwMCIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI0ZGNjEwMCIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Pimpri-Chinchwad':
      return <img src="https://imgur.com/9aRPS.png" alt="Rising Pune Supergiant" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzYzNjZGRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzYzNjZGRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Patna':
      return <img src="https://imgur.com/9bLSG.png" alt="Lucknow Super Giants" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzEwQjk4MSIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzEwQjk4MSIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    case 'Vadodara':
      return <img src="https://imgur.com/0bGT.png" alt="Gujarat Titans" className={iconStyle} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwN0JGRiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0id2hpdGUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iIzAwN0JGRiIvPgo8L3N2Zz4KPC9zdmc+'; }} />;
    default:
      return <MapPin className="text-gray-600" />;
  }
};

const getCityColor = (cityName: string) => {
  switch (cityName) {
    case 'Mumbai':
      return 'bg-blue-50 border-blue-300 hover:bg-blue-100'; // Mumbai Indians - Blue
    case 'Delhi':
      return 'bg-red-50 border-red-300 hover:bg-red-100'; // Delhi Capitals - Red
    case 'Bangalore':
      return 'bg-red-50 border-red-300 hover:bg-red-100'; // RCB - Red & Gold
    case 'Hyderabad':
      return 'bg-orange-50 border-orange-300 hover:bg-orange-100'; // Sunrisers - Orange
    case 'Chennai':
      return 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'; // CSK - Yellow
    case 'Kolkata':
      return 'bg-purple-50 border-purple-300 hover:bg-purple-100'; // KKR - Purple
    case 'Pune':
      return 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'; // Rising Pune - Indigo
    case 'Chandigarh':
      return 'bg-red-50 border-red-300 hover:bg-red-100'; // Punjab Kings - Red
    case 'Ahmedabad':
      return 'bg-blue-50 border-blue-300 hover:bg-blue-100'; // Gujarat Titans - Blue
    case 'Jaipur':
      return 'bg-pink-50 border-pink-300 hover:bg-pink-100'; // Rajasthan Royals - Pink
    case 'Kochi':
      return 'bg-green-50 border-green-300 hover:bg-green-100'; // Kochi Tuskers - Green
    case 'Surat':
      return 'bg-blue-50 border-blue-300 hover:bg-blue-100'; // Gujarat Titans - Blue
    case 'Lucknow':
      return 'bg-green-50 border-green-300 hover:bg-green-100'; // Lucknow Super Giants - Green
    case 'Kanpur':
      return 'bg-green-50 border-green-300 hover:bg-green-100'; // Lucknow Super Giants - Green
    case 'Nagpur':
      return 'bg-pink-50 border-pink-300 hover:bg-pink-100'; // Rajasthan Royals - Pink
    case 'Indore':
      return 'bg-pink-50 border-pink-300 hover:bg-pink-100'; // Rajasthan Royals - Pink
    case 'Thane':
      return 'bg-blue-50 border-blue-300 hover:bg-blue-100'; // Mumbai Indians - Blue
    case 'Bhopal':
      return 'bg-pink-50 border-pink-300 hover:bg-pink-100'; // Rajasthan Royals - Pink
    case 'Visakhapatnam':
      return 'bg-orange-50 border-orange-300 hover:bg-orange-100'; // Sunrisers - Orange
    case 'Pimpri-Chinchwad':
      return 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'; // Rising Pune - Indigo
    case 'Patna':
      return 'bg-green-50 border-green-300 hover:bg-green-100'; // Lucknow Super Giants - Green
    case 'Vadodara':
      return 'bg-blue-50 border-blue-300 hover:bg-blue-100'; // Gujarat Titans - Blue
    default:
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  }
};

export default function SelectCityPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<{ city: string; state: string } | null>(null);

  const filteredCities = INDIAN_CITIES.filter(city =>
    city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCitySelect = (city: { city: string; state: string }) => {
    setSelectedCity(city);
    // Store in localStorage for persistence
    localStorage.setItem('relocatewise_destination', JSON.stringify(city));
    // Redirect to dashboard
    router.push('/dashboard');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Background Dashboard Preview */}
      <div className="fixed inset-0 bg-gray-50 opacity-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-red-600">
                  <span className="inline-block animate-pulse">R</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.1s'}}>e</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.2s'}}>l</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.3s'}}>o</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.4s'}}>c</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.5s'}}>a</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.6s'}}>t</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.7s'}}>e</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.8s'}}>W</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.9s'}}>i</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '1.0s'}}>s</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '1.1s'}}>e</span>
                </h1>
                <p className="text-gray-600 mt-1">Welcome back, Test User</p>
              </div>
              <a href="#" className="text-red-500 hover:text-red-600 text-sm">Sign out</a>
            </div>

            {/* Moving to Section */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Moving to [City]</h2>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                  <span className="text-gray-600">📍</span>
                  <span className="text-sm font-medium text-gray-700">[City], [State]</span>
                </div>
                <a href="#" className="text-red-500 hover:text-red-600 text-sm">Change</a>
              </div>
              <p className="text-gray-600 text-sm">Move date: [Date]</p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Checklists */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Checklists</h3>
                    <p className="text-sm text-gray-600">Organize your tasks</p>
                    <p className="text-xs text-gray-500">Create and manage your relocation checklists</p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-xl">📷</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Photos</h3>
                    <p className="text-sm text-gray-600">Document your journey</p>
                    <p className="text-xs text-gray-500">Upload and organize important documents</p>
                  </div>
                </div>
              </div>

              {/* City Tips */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">City Tips</h3>
                    <p className="text-sm text-gray-600">Local insights</p>
                    <p className="text-xs text-gray-500">Get suggestions for your destination</p>
                  </div>
                </div>
              </div>

              {/* Journal */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-xl">📖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Journal</h3>
                    <p className="text-sm text-gray-600">Record memories</p>
                    <p className="text-xs text-gray-500">Keep track of your relocation journey</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Planning Button */}
            <div className="text-center">
              <button className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto">
                <span className="text-lg">+</span>
                Start Planning
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* City Selection Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-16">
        <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/20">
        {/* Top section */}
        <div className="p-4 md:p-6">
          <div className="border-2 border-blue-200 rounded-xl overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50">
            {/* Search row */}
            <div className="relative flex items-center px-4 py-4">
              <Search className="h-5 w-5 text-blue-600 absolute left-4" />
              <input
                type="text"
                placeholder="Search for your city"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 text-sm text-gray-900 placeholder-gray-600 outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Bottom section */}
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 text-center">
            {searchTerm ? '🔍 Search Results' : '🌟 Popular Cities'}
          </h2>
          <div className="flex flex-nowrap justify-center gap-3 overflow-x-auto">
            {searchTerm ? (
              // Show filtered search results
              filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={`${city.city}-${city.state}`}
                    onClick={() => handleCitySelect(city)}
                    className={`flex flex-col items-center justify-center py-3 px-3 cursor-pointer transition-all duration-300 group rounded-xl min-w-[70px] flex-shrink-0 border-2 ${getCityColor(city.city)} hover:scale-105 hover:shadow-lg`}
                  >
                    <div className="text-lg mb-2 flex items-center justify-center">
                      {getCityIcon(city.city)}
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight">{city.city}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 text-sm py-4">
                  No cities found matching "{searchTerm}"
                </div>
              )
            ) : (
              // Show popular cities when no search
              ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chandigarh', 'Ahmedabad', 'Chennai', 'Pune', 'Kolkata', 'Kochi'].map((cityName) => {
                const city = INDIAN_CITIES.find(c => c.city === cityName || c.city === 'Delhi' && cityName === 'Delhi NCR' || c.city === 'Bangalore' && cityName === 'Bengaluru');
                if (!city) return null;
                return (
                  <div
                    key={cityName}
                    onClick={() => handleCitySelect(city)}
                    className={`flex flex-col items-center justify-center py-3 px-3 cursor-pointer transition-all duration-300 group rounded-xl min-w-[70px] flex-shrink-0 border-2 ${getCityColor(city.city)} hover:scale-105 hover:shadow-lg`}
                  >
                    <div className="text-lg mb-2 flex items-center justify-center">
                      {getCityIcon(city.city)}
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight">{cityName}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

          {/* View All Cities Link */}
          <div className="text-center mt-3">
            <a href="#" className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline">
              View All Cities
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
