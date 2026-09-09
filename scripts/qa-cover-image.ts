/**
 * Verifica la generación de portadas: primero el parseo de la respuesta de
 * Gemini (sin red), y después, si hay GEMINI_API_KEY, una llamada real que
 * sube la imagen a Blob.
 *
 *   npm run qa:cover                                  # sólo el parseo
 *   GEMINI_API_KEY=... BLOB_READ_WRITE_TOKEN=... npm run qa:cover   # end to end
 */
import { buildCoverPrompt, extractImage, generateCoverImage } from '@/lib/services/cover-image';

let failures = 0;
function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  ok  ${label}`);
    return;
  }
  failures++;
  console.error(`FAIL  ${label}`, detail ?? '');
}

const title = 'Ripple, señalado como freno a una eventual reserva de Bitcoin en EE.UU.';
const excerpt = 'Un ejecutivo de Riot Platforms acusó a Ripple de frenar una reserva de Bitcoin en EE.UU.';

console.log('\nPrompt');
const prompt = buildCoverPrompt(title, excerpt);
check('incluye el titular', prompt.includes(title));
check('prohíbe el texto en la imagen', /Sin texto/.test(prompt));

console.log('\nParseo de la respuesta');
check(
  'toma los bytes del primer bloque con data, salteando el texto',
  extractImage({
    steps: [{ content: [{ type: 'text', text: 'listo' } as never, { type: 'image', data: 'QUJD', mime_type: 'image/png' }] }],
  }).data === 'QUJD'
);
check('acepta la forma corta output_image', extractImage({ output_image: { data: 'QUJD' } }).data === 'QUJD');

let threw = false;
try {
  extractImage({ steps: [{ content: [{ type: 'text' }] }] });
} catch {
  threw = true;
}
check('lanza cuando no vino ninguna imagen', threw);

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.log('\nSin GEMINI_API_KEY: se saltea la llamada real a Gemini.');
  } else {
    console.log('\nGeneración real');
    const url = await generateCoverImage(title, excerpt, 'qa-cover-image');
    check('devuelve una URL de Blob', /^https:\/\/[^/]+\.(public\.)?blob\.vercel-storage\.com\//.test(url), url);
    console.log(`      ${url}`);
  }

  console.log(failures === 0 ? '\nTodo ok\n' : `\n${failures} fallo(s)\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('\nError inesperado:', error);
  process.exit(1);
});
