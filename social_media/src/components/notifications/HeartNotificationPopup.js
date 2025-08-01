import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaComment, FaUserPlus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HeartNotificationPopup = ({ notifications, onClose, onNotificationClick, heartButtonRef }) => {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Calculate position relative to heart button
  useEffect(() => {
    if (heartButtonRef?.current && notifications.length > 0) {
      const heartRect = heartButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Position popup above the heart button
      const popupHeight = notifications.length > 1 ? 180 : 100; // Dynamic height based on notifications
      const popupWidth = 320;
      
      let top = heartRect.top - popupHeight - 15; // 15px gap above heart
      let right = viewportWidth - heartRect.right;
      
      // Adjust if popup goes off screen top
      if (top < 20) {
        top = heartRect.bottom + 15; // Show below if no space above
      }
      
      // Center horizontally relative to heart button on mobile
      if (viewportWidth < 768) {
        const heartCenter = heartRect.left + heartRect.width / 2;
        const popupLeft = heartCenter - popupWidth / 2;
        
        // Ensure popup doesn't go off screen
        if (popupLeft < 16) {
          right = 16; // 16px from right edge
        } else if (popupLeft + popupWidth > viewportWidth - 16) {
          right = 16; // 16px from right edge
        } else {
          right = viewportWidth - popupLeft - popupWidth;
        }
      }
      
      setPosition({ top, right });
    }
  }, [heartButtonRef, notifications.length]);

  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor((now - created) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <FaUserPlus className="text-blue-500 text-sm" />;
      case 'like':
        return <FaHeart className="text-red-500 text-sm" />;
      case 'comment':
        return <FaComment className="text-green-500 text-sm" />;
      case 'comment_like':
        return <FaHeart className="text-red-500 text-sm" />;
      default:
        return <FaHeart className="text-gray-500 text-sm" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'follow':
        return 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white';
      case 'like':
        return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white';
      case 'comment':
      case 'comment_like':
        return 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white';
      default:
        return 'border-l-4 border-l-gray-500 bg-gradient-to-r from-gray-50 to-white';
    }
  };

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Navigate based on notification type
    if (notification.type === 'follow') {
      navigate(`/profile/${notification.sender.id}`);
    } else if (notification.post) {
      navigate('/'); // Navigate to home where posts are displayed
    }
    
    onClose();
  };

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed z-[60] max-w-xs w-full space-y-2"
      style={{ 
        top: `${position.top}px`, 
        right: `${position.right}px`,
        maxWidth: '320px'
      }}
    >
      {/* Arrow pointing to heart button */}
      <div 
        className="absolute bottom-0 right-8 transform translate-y-full"
        style={{ 
          width: 0, 
          height: 0, 
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}
      />
      
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 2).map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className={`group bg-white rounded-xl shadow-2xl border ${getNotificationColor(notification.type)} cursor-pointer hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm bg-white/95`}
            onClick={() => handleNotificationClick(notification)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="p-3">
              <div className="flex items-start space-x-3">
                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(notification.id);
                  }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <FaTimes className="text-xs" />
                </button>

                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  {notification.sender?.profileImage ? (
                    <img
                      src={notification.sender.profileImage}
                      alt={notification.sender?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center border-2 border-gray-100 shadow-sm">
                      <span className="text-white font-bold text-xs">
                        {notification.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  
                  {/* Notification Type Icon */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-900 font-medium leading-tight">
                        <span className="font-bold">{notification.sender?.name || 'Someone'}</span>
                        <span className="font-normal text-gray-700 ml-1">
                          {notification.type === 'follow' && 'started following you'}
                          {notification.type === 'like' && 'liked your post'}
                          {notification.type === 'comment' && 'commented on your post'}
                          {notification.type === 'comment_like' && 'liked your comment'}
                        </span>
                      </p>
                      
                      {/* Show comment text if it's a comment notification */}
                      {notification.type === 'comment' && notification.commentText && (
                        <div className="mt-1 p-1.5 bg-gray-50 rounded text-xs text-gray-600 italic border-l-2 border-gray-200">
                          "{notification.commentText.length > 30 ? notification.commentText.substring(0, 30) + '...' : notification.commentText}"
                        </div>
                      )}
                      
                      {/* Time ago */}
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    
                    {/* Post Thumbnail (if applicable) */}
                    {notification.post && (notification.post.imageUrl || notification.post.videoUrl) && (
                      <div className="ml-2 flex-shrink-0">
                        <img
                          src={notification.post.imageUrl || notification.post.videoUrl}
                          alt="Post"
                          className="w-8 h-8 rounded object-cover border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Show counter if more than 2 notifications */}
        {notifications.length > 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gray-800 text-white rounded-lg p-2 text-center text-xs font-medium shadow-lg"
          >
            +{notifications.length - 2} more notifications
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeartNotificationPopup;