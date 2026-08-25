/**
 * Rate limit en memoria. Alcanza porque el panel corre en una sola instancia:
 * si el deploy pasa a varias, esto necesita Redis o el límite se multiplica por
 * la cantidad de instancias.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Limpieza perezosa: sin esto el Map crece con cada IP que pasó una vez. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Segundos hasta que se libere el cupo. */
  retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

/** Se limpia el cupo tras un login exitoso: el límite es contra fuerza bruta. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/**
 * `x-forwarded-for` lo puede escribir el cliente y es lo primero que prueba
 * quien quiere saltear el límite rotando IPs falsas. Se leen antes los headers
 * que pone la plataforma —Vercel los reescribe— y recién al final el que llega
 * de afuera.
 */
export function clientIp(request: Request): string {
  const vercel = request.headers.get('x-vercel-forwarded-for');
  if (vercel) return vercel.split(',')[0].trim();

  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}
