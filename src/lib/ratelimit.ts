export class InMemoryRateLimiter {
  private actions = new Map<string, number[]>();

  constructor(private windowMs: number, private maxRequests: number) {}

  limit(ip: string): { success: boolean; error?: string } {
    const now = Date.now();
    const timestamps = this.actions.get(ip) || [];
    
    // Filter out old timestamps
    const recentTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
    
    if (recentTimestamps.length >= this.maxRequests) {
      return { success: false, error: 'Too many requests. Please wait a moment.' };
    }
    
    recentTimestamps.push(now);
    this.actions.set(ip, recentTimestamps);
    
    return { success: true };
  }
}

// 10 requests per minute
export const ratelimit = new InMemoryRateLimiter(60 * 1000, 10);
