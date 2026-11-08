export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Data sem hora, para comparar só o dia
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return a !== null && b !== null && startOfDay(a).getTime() === startOfDay(b).getTime();
}

// Dias do mês em semanas de domingo a sábado; null nas casas vazias
export function buildMonthWeeks(year: number, month: number): (Date | null)[][] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstWeekday).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// 18/10/2026
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export type DateRange = {
  checkIn: Date | null;
  checkOut: Date | null;
};

// Primeiro toque escolhe o check-in, o segundo (depois dele) o check-out.
// Tocar antes do check-in, ou com o período completo, recomeça a escolha.
export function selectRangeDay(range: DateRange, day: Date): DateRange {
  const { checkIn, checkOut } = range;

  if (!checkIn || checkOut || startOfDay(day) <= startOfDay(checkIn)) {
    return { checkIn: day, checkOut: null };
  }
  return { checkIn, checkOut: day };
}

// Data para parâmetro de rota (2026-10-18), no dia local
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Lê 2026-10-18 como dia local; texto fora do formato vira null
export function fromIsoDate(text: string | undefined): Date | null {
  const match = text ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(text) : null;
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

// Formata um timestamp ISO usando o fuso horário local do aparelho.
// Não corte a string antes da conversão: o servidor envia o instante em UTC.
export function formatIsoDateTime(value: string | null): string {
  if (!value) {
    return 'Não informado';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Não informado' : formatDate(date);
}
