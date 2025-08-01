import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GetTokenFromCookie } from '../getToken/GetToken';
import NotificationPopup from './NotificationPopup';
import useRealTimeNotifications from '../../hooks/useRealTimeNotifications';

const NotificationManager = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  
  // Don't show popups on certain pages to avoid clutter
  const hideOnPages = ['/notifications', '/chat'];
  const shouldHidePopups = hideOnPages.includes(location.pathname);

  useEffect(() => {
    try {
      const decodedUser = GetTokenFromCookie();
      if (decodedUser) {
        // Ensure ID is string format
        decodedUser.id = typeof decodedUser.id === 'object' && decodedUser.id.data 
          ? Buffer.from(decodedUser.id.data).toString('hex') 
          : decodedUser.id;
      }
      setUser(decodedUser);
      // NotificationManager initialized silently in production
    } catch (error) {
      console.error('Error getting user token in NotificationManager:', error);
    }
  }, []);

  const {
    popupNotifications,
    removePopupNotification,
    clearAllPopups,
    loading,
    error
  } = useRealTimeNotifications(user?.id);

  // Handle notification close
  const handleCloseNotification = (notificationId) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ Closing notification:', notificationId);
    }
    if (notificationId) {
      removePopupNotification(notificationId);
    } else {
      clearAllPopups();
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👆 Notification clicked:', notification);
    }
    removePopupNotification(notification.id);
  };

  // Debug logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && popupNotifications.length > 0) {
      console.log('📱 Current popup notifications:', popupNotifications);
    }
  }, [popupNotifications]);

  // Don't render on specific pages or if no notifications
  if (shouldHidePopups || popupNotifications.length === 0 || !user) {
    return null;
  }

  // Show loading state for debugging
  if (loading) {
    console.log('⏳ NotificationManager loading...');
  }

  if (error) {
    console.error('❌ NotificationManager error:', error);
  }

  return (
    <NotificationPopup
      notifications={popupNotifications}
      onClose={handleCloseNotification}
      onNotificationClick={handleNotificationClick}
    />
  );
};

export default NotificationManager;