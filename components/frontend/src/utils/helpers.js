export const getTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now - time) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else if (diffInMinutes < 10080) { // 7 days
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  } else if (diffInMinutes < 525600) { // 1 year
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const getCategoryColor = (category) => {
  const colors = {
    wellness: 'purple',
    technology: 'blue',
    arts: 'pink',
    celebration: 'red',
    education: 'green',
    sports: 'orange',
    food: 'yellow',
    music: 'cyan',
    travel: 'geekblue',
    business: 'magenta'
  };
  return colors[category] || 'default';
};

export const getCategoryIcon = (category) => {
  const icons = {
    wellness: '🧘‍♀️',
    technology: '💻',
    arts: '🎨',
    celebration: '🎉',
    education: '📚',
    sports: '⚽',
    food: '🍕',
    music: '🎵',
    travel: '✈️',
    business: '💼'
  };
  return icons[category] || '🌟';
};

export const generateEventId = () => {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMediaId = () => {
  return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateCommentId = () => {
  return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s\-\(\)]+$/;
  return re.test(phone);
};

export const generateRandomColor = () => {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7', '#a29bfe'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const shareContent = async (title, text, url) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } catch (err) {
      console.error('Failed to share: ', err);
      return false;
    }
  }
  return false;
};

export const getDeviceType = () => {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

export const isMobile = () => {
  return getDeviceType() === 'mobile';
};

export const isTablet = () => {
  return getDeviceType() === 'tablet';
};

export const isDesktop = () => {
  return getDeviceType() === 'desktop';
};

export const getViewportDimensions = () => {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  };
};

export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior
  });
};

export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export const localStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const saveToLocalStorage = (key, value) => {
  if (localStorageAvailable()) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }
  return false;
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  if (localStorageAvailable()) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return defaultValue;
    }
  }
  return defaultValue;
};

export const removeFromLocalStorage = (key) => {
  if (localStorageAvailable()) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
      return false;
    }
  }
  return false;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance; // Distance in kilometers
};

export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const extractHashtags = (text) => {
  const hashtagRegex = /#\w+/g;
  return text.match(hashtagRegex) || [];
};

export const extractMentions = (text) => {
  const mentionRegex = /@\w+/g;
  return text.match(mentionRegex) || [];
};

export const sanitizeHtml = (html) => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const capitalizeFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const parseQueryString = (queryString) => {
  const params = {};
  const urlSearchParams = new URLSearchParams(queryString);
  for (const [key, value] of urlSearchParams) {
    params[key] = value;
  }
  return params;
};

export const buildQueryString = (params) => {
  const urlSearchParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined) {
      urlSearchParams.append(key, params[key]);
    }
  }
  return urlSearchParams.toString();
};