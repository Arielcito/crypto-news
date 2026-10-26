/**
 * Arma el payload de PostProxy para X sin red: título solo en el post, link en
 * el hilo (PostProxy rechaza links en el cuerpo) y portada si hay.
 *
 *   npm run qa:x
 */
import { buildTweet } from '@/lib/services/x';
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

const url = 'https://bitcoinarg.news/mercados/bitcoin-supera-100k';
const tweet = buildTweet(base);
const long = buildTweet({ ...base, title: 'a'.repeat(400), featuredMedia: null });

const checks: [string, boolean][] = [
  ['el post lleva solo el título', tweet.post.body === base.title],
  ['el link va en el hilo', tweet.thread[0].body === `Nota completa: ${url}`],
  ['sube la portada', tweet.media?.[0] === base.featuredMedia],
  ['sin portada no manda media', !('media' in long)],
  ['recorta el título a 280 con …', long.post.body.length === 280 && long.post.body.endsWith('…')],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([label, ok]) => console.log(`${ok ? '  ok ' : 'FAIL '} ${label}`));
if (failed.length) {
  console.error(JSON.stringify(tweet, null, 2));
  process.exit(1);
}
