// Notification sound utility
export const playNotificationSound = (type = 'default') => {
  try {
    // Create audio context for different notification types
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const playTone = (frequency, duration, volume = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Different sounds for different notification types
    switch (type) {
      case 'like':
        // Heart beat sound - two quick tones
        playTone(800, 0.15, 0.3);
        setTimeout(() => playTone(600, 0.15, 0.3), 120);
        break;
      
      case 'comment':
        // Chat sound - ascending tones
        playTone(400, 0.15, 0.25);
        setTimeout(() => playTone(500, 0.15, 0.25), 80);
        setTimeout(() => playTone(600, 0.15, 0.25), 160);
        break;
      
      case 'follow':
        // Success sound - pleasant ascending tone
        playTone(523, 0.2, 0.3); // C5
        setTimeout(() => playTone(659, 0.2, 0.3), 100); // E5
        setTimeout(() => playTone(784, 0.3, 0.3), 200); // G5
        break;
      
      default:
        // Default notification sound
        playTone(600, 0.2, 0.3);
        break;
    }
  } catch (error) {
    console.log('Audio context failed, trying fallback sound:', error);
    // Enhanced fallback: try multiple sound methods
    try {
      // Method 1: Simple beep sound
      playFallbackSound(type);
    } catch (e) {
      console.log('All audio methods failed:', e);
      // Method 2: Vibration as last resort (mobile)
      if ('vibrate' in navigator) {
        navigator.vibrate(getVibrationPattern(type));
      }
    }
  }
};

// Fallback sound function
const playFallbackSound = (type) => {
  // Create multiple fallback sound URLs for different notification types  
  const soundUrls = {
    like: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    comment: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    follow: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    default: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
  };
  
  const audioUrl = soundUrls[type] || soundUrls.default;
  const audio = new Audio(audioUrl);
  audio.volume = 0.3; // Increased volume
  
  // Play with user interaction workaround
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('✅ Notification sound played successfully');
      })
      .catch(error => {
        console.log('❌ Audio play failed:', error);
        // Try system beep if available
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(' ');
          utterance.volume = 0.01;
          utterance.rate = 10;
          window.speechSynthesis.speak(utterance);
        }
      });
  }
};

// Vibration patterns for different notification types
const getVibrationPattern = (type) => {
  switch (type) {
    case 'like':
      return [100, 50, 100]; // Short-pause-short
    case 'comment':
      return [200, 100, 200, 100, 200]; // Long pattern
    case 'follow':
      return [300, 200, 300]; // Success pattern
    default:
      return [150]; // Single vibration
  }
};

// Initialize audio context on user interaction
export const initializeAudio = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Play silent sound to initialize
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.01);
    
    console.log('🔊 Audio context initialized');
    return true;
  } catch (error) {
    console.log('Audio initialization failed:', error);
    return false;
  }
};

// Check if user has granted notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Show browser notification (optional)
export const showBrowserNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
  return null;
};