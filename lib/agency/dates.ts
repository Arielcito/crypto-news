/**
 * Todo se guarda en UTC y se muestra en hora argentina. Argentina no tiene
 * horario de verano desde 2009, así que el offset es fijo -03:00 y no hace
 * falta arrastrar una librería de zonas horarias.
 */

export const AR_TIMEZONE = 'America/Argentina/Buenos_Aires';
export const AR_OFFSET = '-03:00';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Un deadline "15 de octubre" vence al FINAL del 15 en Buenos Aires. Guardarlo
 * como medianoche UTC lo daría por vencido a las 21:00 del 14, hora argentina.
 */
export function parseDueDate(isoDate: string): Date {
  return new Date(`${isoDate}T23:59:59.999${AR_OFFSET}`);
}

/** `YYYY-MM-DD` en hora argentina, para prellenar inputs de fecha. */
export function toDateInput(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: AR_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** `YYYY-MM` → primer día del mes en UTC, que es como se guarda el paquete. */
export function parseMonth(month: string): Date {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1));
}

export function formatMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

const MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatMonthLabel(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return `${MONTH_LABELS[value.getUTCMonth()]} ${value.getUTCFullYear()}`;
}

export function formatDateAr(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: AR_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value);
}

export function formatDateTimeAr(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: AR_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

export type Urgency = 'overdue' | 'today' | 'soon' | 'later' | 'done';

/**
 * Urgencia DERIVADA del deadline. Nunca se persiste: un estado guardado se
 * desactualiza solo y obliga a un job que lo vaya reparando.
 */
export function urgencyOf(dueDate: Date | string, done: boolean, now = new Date()): Urgency {
  if (done) return 'done';
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const diff = due.getTime() - now.getTime();
  if (diff < 0) return 'overdue';
  if (diff <= MS_PER_DAY) return 'today';
  if (diff <= 3 * MS_PER_DAY) return 'soon';
  return 'later';
}

/** Countdown legible: "vencida hace 2 días", "en 5 h", "en 3 días". */
export function countdownLabel(dueDate: Date | string, now = new Date()): string {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const diff = due.getTime() - now.getTime();
  const overdue = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / MS_PER_DAY);
  const hours = Math.floor(abs / (60 * 60 * 1000));

  if (days >= 1) {
    const unit = days === 1 ? 'día' : 'días';
    return overdue ? `Vencida hace ${days} ${unit}` : `En ${days} ${unit}`;
  }
  if (hours >= 1) {
    return overdue ? `Vencida hace ${hours} h` : `En ${hours} h`;
  }
  const minutes = Math.max(1, Math.floor(abs / 60_000));
  return overdue ? `Vencida hace ${minutes} min` : `En ${minutes} min`;
}

export function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * MS_PER_DAY);
}
