/**
 * Arma el payload de PostProxy para X sin red: título y bajada en el post, link
 * en el hilo (PostProxy rechaza links en el cuerpo) y portada si hay.
 *
 *   npm run qa:x
 */
import { buildTweet, tweetsInLastDay } from '@/lib/services/x';
import { shouldNotifyOnUpdate } from '@/lib/services/notify';
import type { NotifiablePost } from '@/lib/services/discord';

const base: NotifiablePost = {
  id: 1,
  title: 'Bitcoin supera los USD 100.000',
  slug: 'bitcoin-supera-100k',
  excerpt: '',
  content: '',
  featuredMedia: 'https://blob.example/portada.webp',
  status: 'publish',
  domain: 'bitcoinarg.news',
  discordPostedAt: null,
  telegramPostedAt: null,
  xPostedAt: null,
  categories: [{ name: 'Mercados', slug: 'mercados' }],
};

const now = Date.now();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000);

const url = 'https://bitcoinarg.news/mercados/bitcoin-supera-100k';
const tweet = buildTweet(base);
const long = buildTweet({ ...base, title: 'a'.repeat(400), featuredMedia: null });
const excerpt = 'El precio tocó un máximo histórico tras la aprobación de nuevos ETF.';
const withExcerpt = buildTweet({ ...base, excerpt });
const longExcerpt = buildTweet({ ...base, excerpt: 'palabra '.repeat(60) });
const withUrl = buildTweet({ ...base, excerpt: 'Según https://example.com/nota el precio subió' });

const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();
const reply = [{ body: 'Nota completa' }];
const proxyPosts = [
  { created_at: hoursAgo(1), thread: reply, platforms: [{ platform: 'twitter', status: 'pending' }] },
  { created_at: hoursAgo(2), thread: reply, platforms: [{ platform: 'twitter', status: 'failed' }] },
  { created_at: hoursAgo(23), thread: reply, platforms: [{ platform: 'twitter', status: 'published' }] },
  { created_at: hoursAgo(25), thread: reply, platforms: [{ platform: 'twitter', status: 'published' }] },
  { created_at: hoursAgo(1), platforms: [{ platform: 'youtube', status: 'published' }] },
];

const checks: [string, boolean][] = [
  ['cuota: cuenta post + hilo de X en 24 h, sin fallidos ni otras redes', tweetsInLastDay(proxyPosts, now) === 4],
  ['sin bajada el post lleva solo el título', tweet.post.body === base.title],
  ['con bajada va título + bajada', withExcerpt.post.body === `${base.title}\n\n${excerpt}`],
  ['bajada larga recorta a 280 con …', longExcerpt.post.body.length === 280 && longExcerpt.post.body.endsWith('…')],
  ['saca URLs sueltas de la bajada', !/https?:/.test(withUrl.post.body)],
  ['el link va en el hilo', tweet.thread[0].body === `Nota completa: ${url}`],
  ['sube la portada', tweet.media?.[0] === base.featuredMedia],
  ['sin portada no manda media', !('media' in long)],
  ['recorta el título a 280 con …', long.post.body.length === 280 && long.post.body.endsWith('…')],
  ['editar un draft viejo y publicarlo avisa', shouldNotifyOnUpdate({ status: 'draft', date: daysAgo(30) }, now)],
  ['re-guardar una nota publicada hoy avisa (reintento)', shouldNotifyOnUpdate({ status: 'publish', date: daysAgo(0.5) }, now)],
  ['re-guardar una nota publicada vieja NO avisa', !shouldNotifyOnUpdate({ status: 'publish', date: daysAgo(3) }, now)],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([label, ok]) => console.log(`${ok ? '  ok ' : 'FAIL '} ${label}`));
if (failed.length) {
  console.error(JSON.stringify(tweet, null, 2));
  process.exit(1);
}
