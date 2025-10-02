const Redis = require('ioredis');

// Initialize Redis connection
const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
});

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis is ready to accept commands');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('close', () => {
  console.log('⚠️  Redis connection closed');
});

// Helper functions
const CACHE_PREFIX = 'ai:insights:vacation:';

/**
 * Get cached AI insights for a vacation
 * @param {string} vacationId - MongoDB vacation ID
 * @returns {object|null} - Cached insights or null
 */
async function getCachedInsights(vacationId) {
  try {
    const key = `${CACHE_PREFIX}${vacationId}`;
    const cached = await redis.get(key);
    
    if (cached) {
      console.log(`✅ Cache HIT for vacation ${vacationId}`);
      return JSON.parse(cached);
    }
    
    console.log(`❌ Cache MISS for vacation ${vacationId}`);
    return null;
  } catch (error) {
    console.error('Redis get error:', error.message);
    return null; // Fail gracefully - don't block if Redis is down
  }
}

/**
 * Cache AI insights for a vacation
 * @param {string} vacationId - MongoDB vacation ID
 * @param {string} vacationEndDate - End date (YYYY-MM-DD)
 * @param {object} insights - AI insights object
 */
async function cacheInsights(vacationId, vacationEndDate, insights) {
  try {
    const key = `${CACHE_PREFIX}${vacationId}`;
    
    // Calculate TTL: seconds until vacation ends + 1 day buffer
    const endDate = new Date(vacationEndDate);
    const now = new Date();
    const ttlSeconds = Math.max(
      Math.floor((endDate - now) / 1000) + (24 * 60 * 60), // +1 day buffer
      24 * 60 * 60 // Minimum 1 day
    );
    
    // Add metadata
    const cacheData = {
      ...insights,
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      ttl_seconds: ttlSeconds
    };
    
    // Store in Redis with TTL
    await redis.setex(key, ttlSeconds, JSON.stringify(cacheData));
    
    const ttlDays = Math.floor(ttlSeconds / 86400);
    console.log(`✅ Cached insights for vacation ${vacationId} (TTL: ${ttlDays} days, expires: ${cacheData.expires_at})`);
  } catch (error) {
    console.error('Redis set error:', error.message);
    // Fail gracefully - don't block if caching fails
  }
}

/**
 * Delete cached insights (when vacation is updated/deleted)
 * @param {string} vacationId - MongoDB vacation ID
 */
async function invalidateCache(vacationId) {
  try {
    const key = `${CACHE_PREFIX}${vacationId}`;
    const result = await redis.del(key);
    
    if (result > 0) {
      console.log(`🗑️  Cache invalidated for vacation ${vacationId}`);
    }
  } catch (error) {
    console.error('Redis delete error:', error.message);
  }
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  try {
    const keys = await redis.keys(`${CACHE_PREFIX}*`);
    const dbSize = await redis.dbsize();
    const info = await redis.info('memory');
    
    return {
      total_cached_vacations: keys.length,
      total_keys_in_db: dbSize,
      redis_connected: redis.status === 'ready',
      redis_status: redis.status,
      memory_info: info
    };
  } catch (error) {
    console.error('Redis stats error:', error.message);
    return {
      error: error.message,
      redis_connected: false
    };
  }
}

module.exports = {
  redis,
  getCachedInsights,
  cacheInsights,
  invalidateCache,
  getCacheStats
};

