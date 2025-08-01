import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_NOTIFICATIONS_SAFE } from '../graphql/mutations';
import { GetTokenFromCookie } from '../components/getToken/GetToken';
import { useNotifications } from '../context/NotificationContext';
import Navbar from '../components/navbar/Navbar';
import FooterNav from '../components/footer/FooterNav';

const NotificationsPage = () => {
  const [user, setUser] = useState(null);
  const { markAsRead, refreshUnreadCount } = useNotifications();

  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    setUser(decodedUser);
  }, []);

  const { data: notificationsData, loading, error, refetch } = useQuery(
    GET_USER_NOTIFICATIONS_SAFE,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
      pollInterval: 10000, // Reduced polling frequency
      fetchPolicy: 'cache-and-network', // Use cache first, then network
      errorPolicy: 'all', // Don't fail completely on errors
      notifyOnNetworkStatusChange: false, // Prevent loading state changes during polling
      onCompleted: (data) => {
        console.log('Notifications data loaded:', data);
        // Mark notifications as read when page loads
        markAsRead();
      },
      onError: (error) => {
        console.error('Error fetching notifications:', error);
        // Don't immediately show error, let it retry
      },
    }
  );

  // Mark as read when component mounts and when data changes
  useEffect(() => {
    if (notificationsData?.getUserNotifications) {
      markAsRead();
      // Refresh unread count after marking as read
      setTimeout(() => refreshUnreadCount(), 500);
    }
  }, [notificationsData, markAsRead, refreshUnreadCount]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'comment_like':
        return '👍';
      case 'follow':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationMessage = (notification) => {
    const senderName = notification.sender?.name || notification.sender?.username || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${senderName} liked your post`;
      case 'comment':
        return `${senderName} commented on your post`;
      case 'comment_like':
        return `${senderName} liked your comment`;
      case 'follow':
        return `${senderName} started following you`;
      default:
        return notification.message || 'New notification';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 pb-24 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <FooterNav />
      </div>
    );
  }

  // Only show error if there's no cached data and it's a real error
  if (error && !notificationsData && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 pb-24 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error loading notifications. Please try again.</p>
              <button 
                onClick={() => refetch()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <FooterNav />
      </div>
    );
  }

  const notifications = notificationsData?.getUserNotifications || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>
          
          {/* Show warning if there's an error but we have cached data */}
          {error && notificationsData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-700 text-sm">
                ⚠️ Connection issue detected. Showing cached notifications.
                <button 
                  onClick={() => refetch()}
                  className="ml-2 text-yellow-800 underline hover:no-underline"
                >
                  Retry
                </button>
              </p>
            </div>
          )}
          
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <div className="text-6xl mb-4">🔔</div>
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No notifications yet</h2>
              <p className="text-gray-500">When someone likes or comments on your posts, you'll see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                    !notification.isRead ? 'border-l-4 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                      {notification.sender?.profileImage ? (
                        <img
                          src={notification.sender.profileImage}
                          alt={notification.sender.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {notification.sender?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">
                            {getNotificationMessage(notification)}
                          </p>
                          
                          {/* Comment text if available */}
                          {notification.commentText && (
                            <p className="text-gray-600 text-sm mt-1 italic">
                              "{notification.commentText}"
                            </p>
                          )}
                          
                          <p className="text-gray-500 text-sm mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Notification Icon */}
                        <div className="flex-shrink-0 ml-3">
                          <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                      </div>

                      {/* Post thumbnail if available */}
                      {notification.post && (notification.post.imageUrl || notification.post.videoUrl) && (
                        <div className="mt-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            {notification.post.imageUrl ? (
                              <img
                                src={notification.post.imageUrl}
                                alt="Post"
                                className="w-full h-full object-cover"
                              />
                            ) : notification.post.thumbnailUrl ? (
                              <img
                                src={notification.post.thumbnailUrl}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Video</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <FooterNav />
    </div>
  );
};

export default NotificationsPage;