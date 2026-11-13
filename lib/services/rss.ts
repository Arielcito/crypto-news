/**
 * Lectura de feeds RSS 2.0 de WordPress y de sitemaps de Google News, y pasaje
 * de HTML a texto plano, sin dependencias: las fuentes que se ingieren
 * (`news-ingest.ts`) son todas WordPress y tienen la misma forma. Puro a
 * propósito, así lo prueba `npm run qa:rss` sin red ni base.
 */
export interface FeedItem {
  title: string;
  link: string;
  /** null si el feed no trae fecha o no se puede leer. */
  pubDate: Date | null;
  /** Copete del feed, en texto plano. */
  description: string;
  /** Nota completa en texto plano, si el feed la trae (`content:encoded`). */
  content: string | null;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', Uuml: 'Ü',
  iexcl: '¡', iquest: '¿', laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  hellip: '…', ndash: '–', mdash: '—', deg: '°', euro: '€',
};

// ponytail: mapa corto de entidades con nombre; las que falten quedan tal cual y Claude las lee igual.
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const point = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point <= 0x10ffff ? String.fromCodePoint(point) : match;
    }
    return NAMED_ENTITIES[code] ?? match;
  });
}

export function htmlToText(html: string): string {
  const text = html
    .replace(/<(script|style|noscript|svg|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr|section|article)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(text)
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n[\s]*/g, '\n')
    .trim();
}

/** Solo el cuerpo de la nota si la página usa `<article>`; si no, la página entera. */
export function articleText(html: string): string {
  const article = html.match(/<article\b[\s\S]*<\/article>/i);
  return htmlToText(article ? article[0] : html);
}

function readTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!match) return null;
  const cdata = match[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return cdata ? cdata[1] : match[1];
}

function readDate(xml: string, tag: string): Date | null {
  const raw = readTag(xml, tag);
  const date = raw ? new Date(raw.trim()) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/** Ítems sin título o sin link se descartan: sin link no hay cómo deduplicar. */
export function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  for (const [, raw] of Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi))) {
    const title = decodeEntities(readTag(raw, 'title') ?? '').trim();
    const link = decodeEntities(readTag(raw, 'link') ?? '').trim();
    if (!title || !/^https?:\/\//i.test(link)) continue;

    const encoded = readTag(raw, 'content:encoded');

    items.push({
      title,
      link,
      pubDate: readDate(raw, 'pubDate'),
      description: htmlToText(readTag(raw, 'description') ?? ''),
      content: encoded ? htmlToText(encoded) : null,
    });
  }
  return items;
}

/** Sitemap de Google News (`<url>` + `<news:news>`): trae título y fecha, no copete ni cuerpo. */
export function parseNewsSitemap(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  for (const [, raw] of Array.from(xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi))) {
    const title = decodeEntities(readTag(raw, 'news:title') ?? '').trim();
    const link = decodeEntities(readTag(raw, 'loc') ?? '').trim();
    if (!title || !/^https?:\/\//i.test(link)) continue;
    items.push({ title, link, pubDate: readDate(raw, 'news:publication_date'), description: '', content: null });
  }
  return items;
}
