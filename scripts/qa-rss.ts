/**
 * Parser RSS de la ingesta, sin red ni base. Con --live además lee los feeds
 * reales (solo GET, no reclama ni publica nada).
 *
 *   npm run qa:rss
 *   npm run qa:rss -- --live
 */
import { articleText, decodeEntities, htmlToText, parseFeed, parseNewsSitemap } from '@/lib/services/rss';

const FEED = `<?xml version="1.0"?><rss><channel><title>Medio</title>
<item>
  <title>Bitcoin sube &#8211; el peso &amp; la inflaci&oacute;n</title>
  <link>https://medio.com/nota-1/</link>
  <pubDate>Wed, 05 Nov 2026 12:30:00 +0000</pubDate>
  <description><![CDATA[<p>Copete <b>corto</b>&hellip;</p>]]></description>
  <content:encoded><![CDATA[<h2>Contexto</h2><p>Primer p&aacute;rrafo.</p><script>alert(1)</script><p>Segundo&nbsp;p&#225;rrafo.</p>]]></content:encoded>
</item>
<item><title>Sin link</title><description>x</description></item>
<item>
  <title><![CDATA[Nota sin cuerpo]]></title>
  <link>https://medio.com/nota-2/</link>
  <pubDate>fecha rota</pubDate>
  <description>Solo copete</description>
</item>
</channel></rss>`;

const SITEMAP = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
<url><loc>https://medio.com/mercados/nota-3/</loc><news:news><news:publication><news:name>Medio</news:name></news:publication><news:publication_date>2026-11-13T09:14:03-05:00</news:publication_date><news:title>Ethereum cae &amp; Bitcoin resiste</news:title></news:news></url>
<url><loc>https://medio.com/sin-titulo/</loc></url>
</urlset>`;

const items = parseFeed(FEED);
const sitemap = parseNewsSitemap(SITEMAP);
const cases: [string, unknown, unknown][] = [
  ['descarta el ítem sin link', items.length, 2],
  ['decodifica entidades del título', items[0]?.title, 'Bitcoin sube – el peso & la inflación'],
  ['link', items[0]?.link, 'https://medio.com/nota-1/'],
  ['fecha', items[0]?.pubDate?.toISOString(), '2026-11-05T12:30:00.000Z'],
  ['copete en CDATA a texto', items[0]?.description, 'Copete corto …'],
  ['content:encoded a texto sin script', items[0]?.content, 'Contexto\nPrimer párrafo.\nSegundo párrafo.'],
  ['título en CDATA', items[1]?.title, 'Nota sin cuerpo'],
  ['fecha rota → null', items[1]?.pubDate, null],
  ['sin content:encoded → null', items[1]?.content, null],
  ['entidad desconocida queda', decodeEntities('a &foo; b &#x41;'), 'a &foo; b A'],
  ['html con comentario y br', htmlToText('<p>uno<br>dos</p><!-- x --><div>tres</div>'), 'uno\ndos\ntres'],
  ['sitemap: descarta la url sin título', sitemap.length, 1],
  ['sitemap: título decodificado', sitemap[0]?.title, 'Ethereum cae & Bitcoin resiste'],
  ['sitemap: link', sitemap[0]?.link, 'https://medio.com/mercados/nota-3/'],
  ['sitemap: fecha con zona', sitemap[0]?.pubDate?.toISOString(), '2026-11-13T14:14:03.000Z'],
  ['sitemap: sin cuerpo', sitemap[0]?.content, null],
  ['prefiere <article>', articleText('<nav>Menú</nav><article><p>Nota</p></article><footer>Pie</footer>'), 'Nota'],
];

let failed = 0;
for (const [label, got, expected] of cases) {
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? '  ok ' : 'FAIL '} ${label}${ok ? '' : `\n       got:      ${JSON.stringify(got)}\n       expected: ${JSON.stringify(expected)}`}`);
}

async function live() {
  const sitemapUrl = 'https://www.diariobitcoin.com/sitemap-news.xml';
  const sitemapResponse = await fetch(sitemapUrl, { headers: { 'User-Agent': 'bitcoinarg.news-ingest/1.0 (+https://www.bitcoinarg.news)' } });
  const urls = parseNewsSitemap(await sitemapResponse.text());
  console.log(`live ${sitemapUrl}: HTTP ${sitemapResponse.status}, ${urls.length} urls, sin fecha: ${urls.filter(item => !item.pubDate).length}`);
  const feeds = ['https://www.criptonoticias.com/feed/', 'https://es.beincrypto.com/feed/'];
  for (const url of feeds) {
    const response = await fetch(url, { headers: { 'User-Agent': 'bitcoinarg.news-ingest/1.0 (+https://www.bitcoinarg.news)' } });
    const parsed = parseFeed(await response.text());
    const withContent = parsed.filter(item => item.content).length;
    const avg = withContent ? Math.round(parsed.reduce((sum, item) => sum + (item.content?.length ?? 0), 0) / withContent) : 0;
    console.log(`live ${url}: HTTP ${response.status}, ${parsed.length} ítems, ${withContent} con nota completa (~${avg} caracteres), sin fecha: ${parsed.filter(item => !item.pubDate).length}`);
    if (parsed[0]) console.log(`     primero: ${parsed[0].title} | ${parsed[0].pubDate?.toISOString()}`);
  }
}

(process.argv.includes('--live') ? live() : Promise.resolve()).then(() => {
  if (failed) process.exit(1);
});
