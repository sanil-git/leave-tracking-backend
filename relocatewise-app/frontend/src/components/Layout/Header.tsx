'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings, Home, MapPin, Calendar, BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-red-600">
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
            </span>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/checklists" 
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Checklists</span>
              </Link>
              <Link 
                href="/timeline" 
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Timeline</span>
              </Link>
              <Link 
                href="/journal" 
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Journal</span>
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.destinationCity && (
                      <p className="text-xs text-gray-500">
                        Moving to {user.destinationCity.city}, {user.destinationCity.country}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    href="/profile"
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
