/**
 * Arma el mensaje de Telegram sin red: escapado HTML y link al post.
 *
 *   npm run qa:telegram
 */
import { buildTelegramMessage } from '@/lib/services/telegram';

const message = buildTelegramMessage({
  id: 1,
  title: 'S&P 500 <sube> con Bitcoin',
  slug: 'sp-500-sube',
  excerpt: '**Wall Street** & las cripto <en verde.',
  content: '',
  featuredMedia: null,
  status: 'publish',
  domain: 'bitcoinarg.news',
  discordPostedAt: null,
  telegramPostedAt: null,
  xPostedAt: null,
  categories: [{ name: 'Mercados', slug: 'mercados' }],
});

const checks: [string, boolean][] = [
  ['escapa el título', message.text.startsWith('<b>S&amp;P 500 &lt;sube&gt; con Bitcoin</b>')],
  ['escapa y limpia la bajada', message.text.includes('Wall Street &amp; las cripto &lt;en verde.')],
  ['termina con el link al post', message.text.endsWith('https://bitcoinarg.news/mercados/sp-500-sube')],
  ['la preview apunta al post', message.link_preview_options.url === 'https://bitcoinarg.news/mercados/sp-500-sube'],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([label, ok]) => console.log(`${ok ? '  ok ' : 'FAIL '} ${label}`));
if (failed.length) {
  console.error(message.text);
  process.exit(1);
}
