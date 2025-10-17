'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Calendar, CheckCircle, Camera, BookOpen, Plus, ChevronDown, Clock } from 'lucide-react';

const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Pune', state: 'Maharashtra' },
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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{ city: string; state: string } | null>(null);
  const [moveDate, setMoveDate] = useState<string>('');
  const [countdown, setCountdown] = useState<{ days: number } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Load city from localStorage or user data
    const storedCity = localStorage.getItem('relocatewise_destination');
    if (storedCity) {
      setSelectedCity(JSON.parse(storedCity));
    } else if (user?.destinationCity) {
      setSelectedCity(user.destinationCity);
    } else {
      // If no city selected, redirect to city selection
      router.push('/select-city');
    }

    // Load move date from localStorage or user data
    const storedMoveDate = localStorage.getItem('relocatewise_move_date');
    if (storedMoveDate) {
      setMoveDate(storedMoveDate);
    } else if (user?.moveDate) {
      setMoveDate(user.moveDate);
    }
  }, [user, loading, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.dropdown-container')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Countdown calculation
  useEffect(() => {
    if (!moveDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const targetDate = new Date(moveDate);
      const timeDiff = targetDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        setCountdown({ days });
      } else {
        setCountdown({ days: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [moveDate]);

  const handleCitySelect = (city: { city: string; state: string }) => {
    setSelectedCity(city);
    setIsDropdownOpen(false);
    localStorage.setItem('relocatewise_destination', JSON.stringify(city));
    // TODO: Update user's destination city in backend
  };

  const handleChangeCity = () => {
    router.push('/select-city');
  };

  const handleMoveDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setMoveDate(newDate);
    localStorage.setItem('relocatewise_move_date', newDate);
    // TODO: Update user's move date in backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header - BookMyShow Style */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-red-600">
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
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* City Selector - BookMyShow Position */}
              {selectedCity && (
                <button
                  onClick={() => router.push('/select-city')}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors rounded-md"
                >
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {selectedCity.city}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <button 
                onClick={() => {
                  localStorage.removeItem('relocatewise_token');
                  window.location.href = '/';
                }}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Moving to City - Centered Section */}
      {selectedCity && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900 text-center">
              Moving to {selectedCity.city}
            </h2>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Move Date Selector and Countdown - BookMyShow Style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <input
              type="date"
              value={moveDate}
              onChange={handleMoveDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Countdown Widget */}
          {countdown && moveDate && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-red-700 font-medium text-sm">
                {countdown.days} days
              </span>
            </div>
          )}
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => router.push('/checklists')}
            className="group p-8 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left w-full"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-800 transition-colors">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Checklists</h3>
                <p className="text-gray-600">Organize your tasks</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Create and manage your relocation checklists</p>
          </button>

          <button className="group p-8 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-800 transition-colors">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Photos</h3>
                <p className="text-gray-600">Document your journey</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Upload and organize important documents</p>
          </button>

          <button className="group p-8 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-800 transition-colors">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">City Tips</h3>
                <p className="text-gray-600">Local insights</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Get suggestions for your destination</p>
          </button>

          <button className="group p-8 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-800 transition-colors">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Journal</h3>
                <p className="text-gray-600">Record memories</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Keep track of your relocation journey</p>
          </button>
        </div>

        {/* Quick Start */}
        <div className="text-center">
          <button className="inline-flex items-center px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Start Planning
          </button>
        </div>
      </main>
    </div>
  );
}
