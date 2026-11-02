import { startOfDay } from './calendar';

const DAY_MS = 24 * 60 * 60 * 1000;

// Horário da mensagem: 09:05
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Noites entre o check-in e o check-out (18/12 a 21/12 = 3 noites)
export function countNights(checkIn: Date, checkOut: Date): number {
  return Math.round((startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime()) / DAY_MS);
}

// "R$ 1.080", sem centavos, como no resto do app
export function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}
