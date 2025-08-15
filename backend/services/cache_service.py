"""
Redis Caching Service for AI Tutor Platform
Provides high-performance caching for frequently accessed data
"""

import redis
import json
import pickle
import logging
from typing import Any, Optional, Dict, List
from functools import wraps
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

class CacheService:
    """Redis-based caching service for performance optimization"""
    
    def __init__(self):
        """Initialize Redis connection"""
        try:
            # Redis configuration
            self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(
                self.redis_url,
                decode_responses=False,  # Handle binary data
                socket_timeout=5,
                socket_connect_timeout=5,
                health_check_interval=30
            )
            
            # Test connection
            self.redis_client.ping()
            logger.info("Redis cache service initialized successfully")
            
            # Cache configuration
            self.default_ttl = 300  # 5 minutes default TTL
            self.enabled = True
            
        except Exception as e:
            logger.warning(f"Redis not available, caching disabled: {str(e)}")
            self.redis_client = None
            self.enabled = False
    
    def is_available(self) -> bool:
        """Check if cache service is available"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            self.redis_client.ping()
            return True
        except Exception:
            return False
    
    def _serialize_key(self, key: str) -> str:
        """Ensure key is properly formatted"""
        return f"ai_tutor:{key}"
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_available():
            return None
        
        try:
            cache_key = self._serialize_key(key)
            data = self.redis_client.get(cache_key)
            
            if data is None:
                return None
            
            # Try to deserialize as JSON first, then pickle
            try:
                return json.loads(data.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                return pickle.loads(data)
                
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {str(e)}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        if not self.is_available():
            return False
        
        try:
            cache_key = self._serialize_key(key)
            ttl = ttl or self.default_ttl
            
            # Try to serialize as JSON first, then pickle
            try:
                data = json.dumps(value, default=str).encode('utf-8')
            except (TypeError, ValueError):
                data = pickle.dumps(value)
            
            result = self.redis_client.setex(cache_key, ttl, data)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.is_available():
            return False
        
        try:
            cache_key = self._serialize_key(key)
            result = self.redis_client.delete(cache_key)
            return bool(result)
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {str(e)}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.is_available():
            return 0
        
        try:
            cache_pattern = self._serialize_key(pattern)
            keys = self.redis_client.keys(cache_pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache pattern delete error for {pattern}: {str(e)}")
            return 0
    
    def increment(self, key: str, amount: int = 1, ttl: Optional[int] = None) -> Optional[int]:
        """Increment a counter in cache"""
        if not self.is_available():
            return None
        
        try:
            cache_key = self._serialize_key(key)
            
            # Use pipeline for atomic operation
            pipe = self.redis_client.pipeline()
            pipe.incr(cache_key, amount)
            if ttl:
                pipe.expire(cache_key, ttl)
            result = pipe.execute()
            
            return result[0]
            
        except Exception as e:
            logger.error(f"Cache increment error for key {key}: {str(e)}")
            return None
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.is_available():
            return {"status": "disabled"}
        
        try:
            info = self.redis_client.info()
            return {
                "status": "active",
                "connected_clients": info.get("connected_clients", 0),
                "used_memory": info.get("used_memory_human", "0"),
                "total_commands_processed": info.get("total_commands_processed", 0),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": self._calculate_hit_rate(info)
            }
        except Exception as e:
            logger.error(f"Cache stats error: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def _calculate_hit_rate(self, info: Dict) -> float:
        """Calculate cache hit rate"""
        hits = info.get("keyspace_hits", 0)
        misses = info.get("keyspace_misses", 0)
        total = hits + misses
        
        if total == 0:
            return 0.0
        
        return round((hits / total) * 100, 2)
    
    def flush_all(self) -> bool:
        """Clear all cache (use with caution)"""
        if not self.is_available():
            return False
        
        try:
            # Only flush keys with our prefix
            keys = self.redis_client.keys(self._serialize_key("*"))
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache flush error: {str(e)}")
            return False

# Global cache service instance
cache_service = CacheService()

def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator for caching function results
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Optional prefix for cache key
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache first
            cached_result = cache_service.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_service.set(cache_key, result, ttl)
            logger.debug(f"Cache miss for {func.__name__}, result cached")
            
            return result
        return wrapper
    return decorator

def cache_invalidate(pattern: str = "*"):
    """
    Decorator to invalidate cache patterns after function execution
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            cache_service.delete_pattern(pattern)
            logger.debug(f"Cache invalidated for pattern: {pattern}")
            return result
        return wrapper
    return decorator

# Performance monitoring decorator
def monitor_performance(func):
    """Monitor function performance and cache metrics"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = datetime.now()
        
        try:
            result = func(*args, **kwargs)
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Log performance metrics
            logger.debug(f"{func.__name__} executed in {execution_time:.3f}s")
            
            # Store performance metrics in cache
            perf_key = f"performance:{func.__name__}:{datetime.now().strftime('%Y-%m-%d:%H')}"
            current_stats = cache_service.get(perf_key) or {"count": 0, "total_time": 0, "avg_time": 0}
            
            current_stats["count"] += 1
            current_stats["total_time"] += execution_time
            current_stats["avg_time"] = current_stats["total_time"] / current_stats["count"]
            
            cache_service.set(perf_key, current_stats, 3600)  # 1 hour TTL
            
            return result
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"{func.__name__} failed after {execution_time:.3f}s: {str(e)}")
            raise
            
    return wrapper
