import { render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ReservationScreen from '../src/app/reserva/[id]';
import { backendApi } from '../src/services/api';
import { HostDetails } from '../src/services/hosts';
import { Pet } from '../src/services/pets';
import { toIsoDate } from '../src/utils/calendar';
import { formatCurrency } from '../src/utils/money';
import { validateReservation } from '../src/utils/validateReservation';
import { apiError, networkError } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), dismissTo: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../src/services/api', () => {
  // A tela usa o SessionExpiredError de verdade para reconhecer a sessão vencida
  class SessionExpiredError extends Error {}
  return { backendApi: { get: jest.fn(), post: jest.fn() }, SessionExpiredError };
});

const mockedParams = useLocalSearchParams as jest.Mock;
const mockedGet = backendApi.get as jest.Mock;
const mockedPost = backendApi.post as jest.Mock;

const HOST_ID = '3f1c2a9e-6b1d-4c3e-9a51-2f0f6d1b7c11';
const SERVICE_ID = '8b7c6d5e-4f3a-4b2c-9d1e-0f1a2b3c4d5e';
const MAX_ID = '11111111-1111-4111-8111-111111111111';
const LUNA_ID = '22222222-2222-4222-8222-222222222222';

const HOST: HostDetails = {
  id: HOST_ID,
  name: 'Recanto Pata Mansa',
  description: null,
  pictureUrl: null,
  location: { city: 'Ubatuba', neighborhood: 'Centro' },
  photos: [],
  accepts: { species: [], sizes: [], breeds: [] },
  services: [{ id: SERVICE_ID, name: 'Diária', price: 250 }],
  reputation: { rating: null, reviewCount: 0 },
};

const PETS: Pet[] = [
  { id: MAX_ID, name: 'Max', species: 'dog', breed: null, size: 'medium' },
  { id: LUNA_ID, name: 'Luna', species: 'cat', breed: null, size: 'small' },
];

// Datas sempre no futuro: check-in daqui a 30 dias, 3 diárias
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}
const CHECK_IN = daysFromNow(30);
const CHECK_OUT = daysFromNow(33);

function respond(pets: Pet[] = PETS) {
  mockedGet.mockImplementation((url: string) =>
    Promise.resolve({ data: url === '/api/v1/me/pets' ? { items: pets } : HOST }),
  );
}

function created(petId = MAX_ID) {
  return {
    data: {
      id: 'reservation-1',
      status: 'requested',
      hostId: HOST_ID,
      serviceId: SERVICE_ID,
      petId,
      startDate: CHECK_IN,
      endDate: CHECK_OUT,
      dailyPrice: 250,
      totalValue: 750,
      notes: null,
      createdAt: '2026-11-01T12:00:00.000Z',
    },
  };
}

async function renderScreen(params: Record<string, string> = {}) {
  mockedParams.mockReturnValue({ id: HOST_ID, checkIn: CHECK_IN, checkOut: CHECK_OUT, ...params });
  await render(<ReservationScreen />);
  const user = userEvent.setup();
  await screen.findByRole('header', { name: 'Confirmar Reserva' });
  return user;
}

function submitButton() {
  return screen.getByRole('button', { name: 'Solicitar Reserva' });
}

describe('Tela de solicitação de hospedagem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    respond();
  });

  test('mostra o Host, as datas da busca, os pets e o total das diárias', async () => {
    await renderScreen({ petId: MAX_ID });

    expect(mockedGet).toHaveBeenCalledWith(`/api/v1/hosts/${HOST_ID}`);
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/me/pets', { params: { page: 1, pageSize: 50 } });
    expect(screen.getByText('Recanto Pata Mansa')).toBeOnTheScreen();
    expect(screen.getByText('Centro, Ubatuba')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Max' })).toBeSelected();
    expect(screen.getByRole('radio', { name: 'Luna' })).not.toBeSelected();
    expect(screen.getByText(formatCurrency(750))).toBeOnTheScreen();
    expect(screen.getByText('3 diárias')).toBeOnTheScreen();
  });

  test('os serviços adicionais podem ser marcados, mas não mudam o total', async () => {
    const user = await renderScreen({ petId: MAX_ID });

    await user.press(screen.getByRole('checkbox', { name: /Ducha Especial/ }));

    expect(screen.getByRole('checkbox', { name: /Ducha Especial/ })).toBeChecked();
    expect(screen.getByText(formatCurrency(750))).toBeOnTheScreen();
  });

  test('não envia sem um pet escolhido e mostra o erro embaixo dos pets', async () => {
    const user = await renderScreen();

    await user.press(submitButton());

    expect(screen.getByText('Escolha quem vai se hospedar.')).toBeOnTheScreen();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  test('Tutor sem pet cadastrado não consegue confirmar', async () => {
    respond([]);
    const user = await renderScreen();

    expect(screen.getByText('Você ainda não tem pets cadastrados.')).toBeOnTheScreen();
    await user.press(submitButton());
    expect(screen.getByText('Cadastre um pet para solicitar a reserva.')).toBeOnTheScreen();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  test('sem datas, pede as datas antes de enviar', async () => {
    mockedParams.mockReturnValue({ id: HOST_ID, petId: MAX_ID });
    await render(<ReservationScreen />);
    const user = userEvent.setup();
    await screen.findByRole('header', { name: 'Confirmar Reserva' });

    await user.press(submitButton());

    expect(screen.getByText('Escolha as datas de check-in e check-out.')).toBeOnTheScreen();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  test('confirmar cria a solicitação com a chave de idempotência e mostra o sucesso', async () => {
    mockedPost.mockResolvedValue(created());
    const user = await renderScreen({ petId: MAX_ID });

    await user.press(submitButton());

    expect(mockedPost).toHaveBeenCalledWith(
      '/api/v1/reservations',
      { serviceId: SERVICE_ID, petId: MAX_ID, startDate: CHECK_IN, endDate: CHECK_OUT },
      { headers: { 'Idempotency-Key': expect.stringMatching(/^[\w-]{1,100}$/) } },
    );
    expect(await screen.findByRole('header', { name: 'Reserva solicitada com sucesso!' })).toBeOnTheScreen();
    expect(screen.getByText('1 Pet (Max)')).toBeOnTheScreen();
    expect(screen.getByText(formatCurrency(750))).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Voltar para Início' }));
    expect(router.dismissTo).toHaveBeenCalledWith('/home');
  });

  test('toque duplo envia uma vez só', async () => {
    let finish: (value: unknown) => void = () => {};
    mockedPost.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const user = await renderScreen({ petId: MAX_ID });

    // O mesmo botão: durante o envio ele mostra o indicador no lugar do texto
    const button = submitButton();
    await user.press(button);
    await user.press(button);
    finish(created());

    expect(await screen.findByRole('header', { name: 'Reserva solicitada com sucesso!' })).toBeOnTheScreen();
    expect(mockedPost).toHaveBeenCalledTimes(1);
  });

  test('nova tentativa usa a mesma chave; trocar o pet usa outra', async () => {
    mockedPost.mockRejectedValue(networkError());
    const user = await renderScreen({ petId: MAX_ID });

    // "Voltar" com texto é o botão do modal; o do topo é só o ícone
    await user.press(submitButton());
    await user.press(await screen.findByText('Voltar'));
    await user.press(submitButton());
    await user.press(await screen.findByText('Voltar'));
    await user.press(screen.getByRole('radio', { name: 'Luna' }));
    await user.press(submitButton());

    const keys = mockedPost.mock.calls.map((call) => call[2].headers['Idempotency-Key']);
    expect(keys).toHaveLength(3);
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).not.toBe(keys[0]);
  });

  test('período ocupado abre "Data indisponível"', async () => {
    mockedPost.mockRejectedValue(apiError(409, 'PERIOD_UNAVAILABLE'));
    const user = await renderScreen({ petId: MAX_ID });

    await user.press(submitButton());

    expect(await screen.findByRole('header', { name: 'Data indisponível' })).toBeOnTheScreen();
  });

  test('sem vaga também abre "Data indisponível"', async () => {
    mockedPost.mockRejectedValue(apiError(409, 'NO_CAPACITY'));
    const user = await renderScreen({ petId: MAX_ID });

    await user.press(submitButton());

    expect(await screen.findByRole('header', { name: 'Data indisponível' })).toBeOnTheScreen();
  });

  test('perfil incompleto abre "Cadastro Incompleto"', async () => {
    mockedPost.mockRejectedValue(apiError(403, 'PROFILE_INCOMPLETE'));
    const user = await renderScreen({ petId: MAX_ID });

    await user.press(submitButton());

    expect(await screen.findByRole('header', { name: 'Cadastro Incompleto' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Completar Cadastro' })).toBeOnTheScreen();
  });

  test('erro do servidor ou sem rede abre "Algo deu errado"', async () => {
    mockedPost.mockRejectedValue(apiError(500, 'INTERNAL_ERROR'));
    const user = await renderScreen({ petId: MAX_ID });

    await user.press(submitButton());

    expect(await screen.findByRole('header', { name: 'Algo deu errado' })).toBeOnTheScreen();
  });

  test('pet já hospedado no período aparece embaixo dos pets', async () => {
    mockedPost.mockRejectedValue(apiError(409, 'PET_ALREADY_BOOKED'));
    const user = await renderScreen({ petId: MAX_ID });

    await user.press(submitButton());

    expect(await screen.findByText('Esse pet já tem hospedagem nesse período.')).toBeOnTheScreen();
  });

  test('pet não permitido abre o aviso visual', async () => {
    mockedPost.mockRejectedValue(
      apiError(400, 'VALIDATION_ERROR', [{ field: 'petId', message: 'porte não aceito pelo Host' }]),
    );
    const user = await renderScreen({ petId: MAX_ID });

    await user.press(submitButton());

    expect(await screen.findByRole('header', { name: 'Pet não permitido' })).toBeOnTheScreen();
    expect(screen.getByText('Infelizmente o Host não aceita esse tipo de pet.')).toBeOnTheScreen();
  });

  test('Host inexistente mostra "Hospedagem não encontrada"', async () => {
    mockedGet.mockImplementation((url: string) =>
      url === '/api/v1/me/pets'
        ? Promise.resolve({ data: { items: PETS } })
        : Promise.reject(apiError(404, 'NOT_FOUND')),
    );
    mockedParams.mockReturnValue({ id: HOST_ID });
    await render(<ReservationScreen />);

    expect(await screen.findByText('Hospedagem não encontrada')).toBeOnTheScreen();
  });
});

describe('utils/validateReservation', () => {
  const today = new Date(2026, 10, 1);

  test('aceita pet escolhido e datas no futuro', () => {
    expect(
      validateReservation(
        { checkIn: new Date(2026, 10, 5), checkOut: new Date(2026, 10, 8), petId: MAX_ID, hasPets: true },
        today,
      ),
    ).toEqual({});
  });

  test('recusa check-in no passado e check-out antes do check-in', () => {
    expect(
      validateReservation(
        { checkIn: new Date(2026, 9, 30), checkOut: new Date(2026, 10, 2), petId: MAX_ID, hasPets: true },
        today,
      ).dates,
    ).toBe('O check-in não pode ser no passado.');
    expect(
      validateReservation(
        { checkIn: new Date(2026, 10, 5), checkOut: new Date(2026, 10, 5), petId: MAX_ID, hasPets: true },
        today,
      ).dates,
    ).toBe('O check-out precisa ser depois do check-in.');
  });
});
