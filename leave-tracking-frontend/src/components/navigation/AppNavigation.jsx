import React, { useCallback, useState, useEffect } from 'react';
import { Users, Calendar, BarChart3, Settings } from 'lucide-react';
import { useComponentPreloader, useDataPrefetcher } from '../../hooks/useComponentPreloader';

// Import preload functions for MyTeam components
import { preloadMyTeamComponents } from '../dashboard/MyTeamWithPreloading';

// Navigation component with preloading support
const AppNavigation = React.memo(({ 
  activeView, 
  onViewChange, 
  user,
  token 
}) => {
  const { preloadComponent, isPreloaded } = useComponentPreloader();
  const { prefetchData, isPrefetched } = useDataPrefetcher();
  const [hoveredItem, setHoveredItem] = useState(null);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : 'https://leave-tracking-backend.onrender.com');

  // Preload MyTeam components and data when hovering over team navigation
  const handleTeamPreload = useCallback(() => {
    if (!token) return;

    console.log('🎯 Preloading MyTeam components and data...');
    
    // Preload all MyTeam components
    preloadComponent('myteam-components', async () => {
      await preloadMyTeamComponents.all();
      console.log('✅ MyTeam components preloaded');
    }, 100);

    // Prefetch team data
    const fetcher = async (url) => {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    };

    // Prefetch core team data
    prefetchData('team-data', async () => {
      const promises = [
        fetcher(`${API_BASE_URL}/api/teams/my-team`),
        fetcher(`${API_BASE_URL}/api/leaves/pending`),
        fetcher(`${API_BASE_URL}/api/users/temp-passwords`)
      ];
      
      const results = await Promise.allSettled(promises);
      console.log('✅ Team data preloaded:', results.filter(r => r.status === 'fulfilled').length, 'successful');
      
      return {
        team: results[0].status === 'fulfilled' ? results[0].value : null,
        approvals: results[1].status === 'fulfilled' ? results[1].value : null,
        pendingUsers: results[2].status === 'fulfilled' ? results[2].value : null
      };
    }, 150);
  }, [token, preloadComponent, prefetchData, API_BASE_URL]);

  // Preload calendar components and data
  const handleCalendarPreload = useCallback(() => {
    if (!token) return;

    console.log('🎯 Preloading Calendar components and data...');
    
    // Preload calendar component
    preloadComponent('calendar', async () => {
      await import('../dashboard/Calendar');
      console.log('✅ Calendar component preloaded');
    }, 100);

    // Prefetch calendar data
    prefetchData('calendar-data', async () => {
      const fetcher = async (url) => {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      };

      const promises = [
        fetcher(`${API_BASE_URL}/holidays`),
        fetcher(`${API_BASE_URL}/vacations`),
        fetcher(`${API_BASE_URL}/leave-balances`)
      ];
      
      const results = await Promise.allSettled(promises);
      console.log('✅ Calendar data preloaded');
      
      return {
        holidays: results[0].status === 'fulfilled' ? results[0].value : [],
        vacations: results[1].status === 'fulfilled' ? results[1].value : [],
        balances: results[2].status === 'fulfilled' ? results[2].value : {}
      };
    }, 150);
  }, [token, preloadComponent, prefetchData, API_BASE_URL]);

  // Navigation items with preload handlers
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Calendar,
      preloadHandler: handleCalendarPreload,
      accessLevel: 'all'
    },
    {
      id: 'team',
      label: 'My Team',
      icon: Users,
      preloadHandler: handleTeamPreload,
      accessLevel: 'manager', // Managers and admins only
      description: 'Team management and approvals'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      preloadHandler: () => {
        // Preload analytics specific components
        preloadComponent('analytics', async () => {
          await import('../dashboard/Analytics');
        });
      },
      accessLevel: 'admin'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      preloadHandler: () => {
        preloadComponent('settings', async () => {
          await import('../dashboard/Settings');
        });
      },
      accessLevel: 'all'
    }
  ];

  // Filter navigation items based on user role
  const visibleItems = navigationItems.filter(item => {
    switch (item.accessLevel) {
      case 'manager':
        return user?.role === 'manager' || user?.role === 'admin';
      case 'admin':
        return user?.role === 'admin';
      default:
        return true;
    }
  });

  // Handle mouse enter with preloading
  const handleMouseEnter = useCallback((item) => {
    setHoveredItem(item.id);
    
    // Trigger preloading
    if (item.preloadHandler) {
      item.preloadHandler();
    }
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  // Handle focus for keyboard navigation
  const handleFocus = useCallback((item) => {
    if (item.preloadHandler) {
      item.preloadHandler();
    }
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isPreloadedComponent = isPreloaded(`${item.id}-components`) || isPreloaded(item.id);
                const isPreloadedData = isPrefetched(`${item.id}-data`);
                const isHovered = hoveredItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    onMouseEnter={() => handleMouseEnter(item)}
                    onMouseLeave={handleMouseLeave}
                    onFocus={() => handleFocus(item)}
                    className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                    } ${isHovered ? 'transform scale-105' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.description}
                  >
                    <Icon 
                      size={20} 
                      className={`mr-2 transition-transform duration-200 ${
                        isHovered ? 'scale-110' : ''
                      }`} 
                    />
                    <span>{item.label}</span>
                    
                    {/* Preload status indicators */}
                    <div className="absolute -top-1 -right-1 flex space-x-1">
                      {/* Component preload indicator */}
                      {isPreloadedComponent && (
                        <div 
                          className="w-2 h-2 bg-green-500 rounded-full animate-pulse" 
                          title="Components preloaded"
                        />
                      )}
                      
                      {/* Data preload indicator */}
                      {isPreloadedData && (
                        <div 
                          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" 
                          title="Data prefetched"
                        />
                      )}
                      
                      {/* Loading indicator */}
                      {isHovered && !isPreloadedComponent && (
                        <div 
                          className="w-2 h-2 bg-orange-500 rounded-full animate-spin" 
                          title="Preloading..."
                        />
                      )}
                    </div>
                    
                    {/* Hover tooltip */}
                    {isHovered && item.description && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-50 animate-fadeIn">
                        {item.description}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Preload status summary */}
          <div className="flex items-center space-x-2">
            {(isPreloaded('myteam-components') || isPrefetched('team-data')) && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-700">Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});

AppNavigation.displayName = 'AppNavigation';

export default AppNavigation;
