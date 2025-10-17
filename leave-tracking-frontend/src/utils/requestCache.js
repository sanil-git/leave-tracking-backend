// Simple request caching utility to prevent duplicate API calls
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds cache
  }

  // Generate a cache key from URL and options
  getCacheKey(url, options = {}) {
    const method = options.method || 'GET';
    const headers = options.headers || {};
    return `${method}:${url}:${JSON.stringify(headers)}`;
  }

  // Check if request is already in progress
  isRequestInProgress(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    // Check if cache has expired
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return false;
    }
    
    return cached.inProgress;
  }

  // Mark request as in progress
  markRequestInProgress(key) {
    this.cache.set(key, {
      inProgress: true,
      timestamp: Date.now(),
      promise: null
    });
  }

  // Store the promise for a request
  storeRequestPromise(key, promise) {
    const cached = this.cache.get(key);
    if (cached) {
      cached.promise = promise;
    }
  }

  // Get cached promise if exists
  getCachedPromise(key) {
    const cached = this.cache.get(key);
    if (cached && cached.promise && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.promise;
    }
    return null;
  }

  // Mark request as completed
  markRequestCompleted(key) {
    const cached = this.cache.get(key);
    if (cached) {
      cached.inProgress = false;
    }
  }

  // Clear cache for a specific key
  clearCache(key) {
    this.cache.delete(key);
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear();
  }
}

// Create a singleton instance
const requestCache = new RequestCache();

// Simple fetch function - no caching to avoid issues
export const fetchWithCache = async (url, options = {}) => {
  // Just use regular fetch - the caching was causing more problems than it solved
  return fetch(url, options);
};

export default requestCache;
