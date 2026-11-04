/**
 * Limpia las marcas más obvias de texto generado por IA antes de guardar una
 * nota que llega de la ingesta. Reglas sacadas de medir 200 notas publicadas
 * (2026-11-04): raya en 19 de 200, títulos "Conclusión" genéricos y aperturas
 * "En conclusión,". Negritas y emojis quedan: aparecen en tutoriales donde
 * marcan botones de una app, no son tics.
 *
 * ponytail: heurística por regex, solo toca la superficie. Si Google sigue
 * castigando el contenido, el arreglo de fondo es el prompt del publicador en
 * Make (aportar contexto propio, variar la estructura) o una pasada de
 * reescritura con un LLM.
 */

const CLOSING_HEADING =
  /^#{1,6}[ \t]*(conclusi[oó]n(es)?|en resumen|reflexiones finales|consideraciones finales)[ \t]*:?[ \t]*(\n+|$)/gim;
const CLOSING_OPENER = /(^|[.!?][ \t]+)(?:en conclusi[oó]n|en resumen|en definitiva|en s[ií]ntesis),[ \t]*(\p{L})/gimu;

export function humanizeText(text: string): string {
  return (
    text
      .replace(CLOSING_HEADING, '')
      .replace(CLOSING_OPENER, (_, before: string, first: string) => before + first.toUpperCase())
      // Raya al inicio de línea (diálogo) o pegada a un signo: se saca.
      .replace(/^[ \t]*—[ \t]*/gm, '')
      .replace(/[ \t]*—[ \t]*(?=[.,;:!?)]|$)/gm, '')
      // Inciso "—así—" o "— así —": comas. Absorbe una coma previa para no dejar ", ,".
      .replace(/,?[ \t]*—[ \t]*/g, ', ')
  );
}
