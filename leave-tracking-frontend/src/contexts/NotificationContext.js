import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        return data;
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Mark notification as read error:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            isRead: true, 
            readAt: new Date() 
          }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Mark all notifications as read error:', err);
    }
  };

  // Add new notification to local state (for real-time updates)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_submitted':
        return '📝';
      case 'leave_approved':
        return '✅';
      case 'leave_rejected':
        return '❌';
      case 'leave_cancelled':
        return '🚫';
      case 'role_changed':
        return '👤';
      case 'team_member_added':
        return '👥';
      case 'team_member_removed':
        return '👥';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'leave_approved':
        return 'text-green-600';
      case 'leave_rejected':
        return 'text-red-600';
      case 'role_changed':
        return 'text-blue-600';
      case 'system_announcement':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  // Auto-fetch notifications when user logs in
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  // Poll for new notifications every 30 seconds when user is active
  useEffect(() => {
    if (!user || !token) return;

    let interval;
    let isPageVisible = !document.hidden;

    const startPolling = () => {
      interval = setInterval(() => {
        // Only fetch if page is visible and user is active
        if (isPageVisible && !document.hidden) {
          fetchNotifications(1, 20, false);
        }
      }, 30000); // Poll every 30 seconds
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        // Fetch immediately when page becomes visible, then start polling
        fetchNotifications(1, 20, false);
        startPolling();
      } else {
        stopPolling();
      }
    };

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start polling initially
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    getNotificationIcon,
    getNotificationColor
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
