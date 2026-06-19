interface RateLimitRecord {
  tokens: number;
  lastRefilled: number;
}

const cache = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory token-bucket rate limiter.
 * @param key unique identifier (e.g., client IP address)
 * @param maxTokens capacity of the bucket
 * @param refillRateSec rate at which tokens refill (tokens per second)
 */
export function rateLimit(
  key: string,
  maxTokens: number = 30,
  refillRateSec: number = 0.5
): { success: boolean; remaining: number } {
  const now = Date.now();
  let record = cache.get(key);

  if (!record) {
    record = { tokens: maxTokens, lastRefilled: now };
    cache.set(key, record);
  }

  // Refill tokens based on elapsed time
  const elapsedMs = now - record.lastRefilled;
  const elapsedSec = elapsedMs / 1000;
  const refilledTokens = elapsedSec * refillRateSec;

  record.tokens = Math.min(maxTokens, record.tokens + refilledTokens);
  record.lastRefilled = now;

  if (record.tokens >= 1) {
    record.tokens -= 1;
    cache.set(key, record);
    return { success: true, remaining: Math.floor(record.tokens) };
  }

  return { success: false, remaining: 0 };
}
