import redis from './redis';

const DEFAULT_TTL = 60 * 10; // 10 minutes

export async function getCache(key: string): Promise<any | null> {
  const val = await redis.get(key);
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

export async function setCache(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
  const val = typeof value === 'string' ? value : JSON.stringify(value);
  await redis.set(key, val, 'EX', ttl);
}