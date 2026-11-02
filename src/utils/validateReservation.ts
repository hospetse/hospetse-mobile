import type { ReservationField } from '../services/reservations';
import { startOfDay } from './calendar';

type ReservationForm = {
  checkIn: Date | null;
  checkOut: Date | null;
  petId: string | null;
  hasPets: boolean;
};

// Mesmas regras do back-end (#494), conferidas antes do envio. O back-end continua validando
export function validateReservation(
  form: ReservationForm,
  today: Date = new Date(),
): Partial<Record<ReservationField, string>> {
  const errors: Partial<Record<ReservationField, string>> = {};

  if (!form.hasPets) {
    errors.pet = 'Cadastre um pet para solicitar a reserva.';
  } else if (!form.petId) {
    errors.pet = 'Escolha quem vai se hospedar.';
  }

  if (!form.checkIn || !form.checkOut) {
    errors.dates = 'Escolha as datas de check-in e check-out.';
  } else if (startOfDay(form.checkIn) < startOfDay(today)) {
    errors.dates = 'O check-in não pode ser no passado.';
  } else if (startOfDay(form.checkOut) <= startOfDay(form.checkIn)) {
    errors.dates = 'O check-out precisa ser depois do check-in.';
  }

  return errors;
}
