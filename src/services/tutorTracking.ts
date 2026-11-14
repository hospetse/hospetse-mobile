import { listMyReservations, TutorReservation } from './tutorReservations';

export type TrackingStepStatus = 'completed' | 'current' | 'upcoming';

export type TrackingStep = {
  id: string;
  title: string;
  description: string;
  date: string | null;
  status: TrackingStepStatus;
};

export type TutorTracking = {
  reservation: TutorReservation;
  steps: TrackingStep[];
};

function stepsFor(reservation: TutorReservation): TrackingStep[] {
  const completed = reservation.status === 'completed';
  return [
    {
      id: 'requested',
      title: 'Solicitação enviada',
      description: 'O Host recebeu sua solicitação de hospedagem.',
      date: reservation.startDate,
      status: 'completed',
    },
    {
      id: 'accepted',
      title: 'Solicitação aceita',
      description: 'O Host confirmou que pode receber seu pet.',
      date: reservation.startDate,
      status: 'completed',
    },
    {
      id: 'check-in',
      title: completed ? 'Hospedagem concluída' : 'Hospedagem em andamento',
      description: completed ? 'A hospedagem foi encerrada na data combinada.' : 'Seu pet está sob os cuidados do Host.',
      date: reservation.startDate,
      status: completed ? 'completed' : 'current',
    },
    {
      id: 'check-out',
      title: 'Check-out',
      description: 'A hospedagem será encerrada na data combinada.',
      date: reservation.endDate,
      status: completed ? 'completed' : 'upcoming',
    },
  ];
}

// Contrato provisório da futura API de acompanhamento (#543).
// A TSK-01 do backend ainda não está disponível.
export async function getTutorTracking(id: string): Promise<TutorTracking> {
  const page = await listMyReservations();
  const reservation = page.items.find((item) => item.id === id);
  if (!reservation) {
    throw new Error('RESERVATION_NOT_FOUND');
  }
  return { reservation, steps: stepsFor(reservation) };
}
