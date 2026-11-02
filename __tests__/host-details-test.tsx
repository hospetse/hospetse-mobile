import { render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import HostDetailsScreen from '../src/app/host/[id]';
import { backendApi } from '../src/services/api';
import { formatHostLocation, HostDetails, lowestPrice } from '../src/services/hosts';
import { fromIsoDate, toIsoDate } from '../src/utils/calendar';
import { httpError, networkError } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../src/services/api', () => ({
  backendApi: { get: jest.fn() },
}));

const mockedParams = useLocalSearchParams as jest.Mock;
const mockedGet = backendApi.get as jest.Mock;

const HOST_ID = '3f1c2a9e-6b1d-4c3e-9a51-2f0f6d1b7c11';

// Mesmo formato do GET /api/v1/hosts/{id} do back-end
const HOST: HostDetails = {
  id: HOST_ID,
  name: 'Hotelzinho da Ana',
  description: 'Casa com quintal, aceito pets de pequeno e médio porte.',
  pictureUrl: null,
  location: { city: 'Maringá', neighborhood: 'Zona 7' },
  photos: ['https://exemplo.com/1.jpg', 'https://exemplo.com/2.jpg', 'https://exemplo.com/3.jpg',
    'https://exemplo.com/4.jpg', 'https://exemplo.com/5.jpg', 'https://exemplo.com/6.jpg'],
  accepts: { species: ['dog'], sizes: ['small', 'medium'], breeds: [] },
  services: [{ id: 'service-1', name: 'Diária', price: 120 }],
  reputation: { rating: 4.8, reviewCount: 1092 },
};

async function renderScreen(params: Record<string, string>) {
  mockedParams.mockReturnValue(params);
  await render(<HostDetailsScreen />);
  return userEvent.setup();
}

describe('Tela de detalhe do Host', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockResolvedValue({ data: HOST });
  });

  test('busca o Host no back-end pelo id da rota', async () => {
    await renderScreen({ id: HOST_ID });

    expect(await screen.findByRole('header', { name: 'Hotelzinho da Ana' })).toBeOnTheScreen();
    expect(mockedGet).toHaveBeenCalledWith(`/api/v1/hosts/${HOST_ID}`);
  });

  test('mostra local só com bairro e cidade, avaliação e o menor preço', async () => {
    await renderScreen({ id: HOST_ID });

    await screen.findByRole('header', { name: 'Hotelzinho da Ana' });
    expect(screen.getAllByText('Zona 7, Maringá')).toHaveLength(2);
    expect(screen.getByText('4.8 (1.092 Avaliações)')).toBeOnTheScreen();
    expect(screen.getByText('R$ 120')).toBeOnTheScreen();
  });

  test('Host sem avaliações mostra "Sem avaliações ainda"', async () => {
    mockedGet.mockResolvedValue({ data: { ...HOST, reputation: { rating: null, reviewCount: 0 } } });
    await renderScreen({ id: HOST_ID });

    expect(await screen.findByText('Sem avaliações ainda')).toBeOnTheScreen();
  });

  test('mostra as datas que vieram da busca', async () => {
    await renderScreen({ id: HOST_ID, checkIn: '2026-12-18', checkOut: '2026-12-21' });

    expect(await screen.findByText('18/12/2026  -  21/12/2026')).toBeOnTheScreen();
  });

  test('a galeria mostra quantas fotos ficaram de fora', async () => {
    await renderScreen({ id: HOST_ID });

    // 6 fotos: a primeira é a capa, 4 aparecem e 1 fica no "+1"
    expect(await screen.findByText('+1')).toBeOnTheScreen();
  });

  test('tem os botões do rodapé, sem contato direto com o Host', async () => {
    await renderScreen({ id: HOST_ID });

    expect(await screen.findByRole('button', { name: 'Solicitar reserva' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tire suas dúvidas' })).toBeOnTheScreen();
    expect(screen.queryByText(/@|telefone|whatsapp/i)).not.toBeOnTheScreen();
  });

  test('"Ler mais" da rotina abre o modal com as etapas e a garantia', async () => {
    const user = await renderScreen({ id: HOST_ID });

    await user.press(await screen.findByRole('button', { name: 'Ler mais sobre a rotina' }));

    expect(screen.getByRole('header', { name: 'Rotina' })).toBeOnTheScreen();
    expect(screen.getByText('3 etapas diárias')).toBeOnTheScreen();
    expect(
      screen.getByLabelText(
        'Manhã, 08:00. Café da manhã e passeio. Ração no mesmo horário de casa, água fresca e uma caminhada leve.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText('Garantia Veterinária Hospetse')).toBeOnTheScreen();
    expect(screen.getByText('Protegido')).toBeOnTheScreen();
  });

  test('o modal de rotina fecha pelo botão e pelo toque fora', async () => {
    const user = await renderScreen({ id: HOST_ID });
    const readMore = await screen.findByRole('button', { name: 'Ler mais sobre a rotina' });

    await user.press(readMore);
    await user.press(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('header', { name: 'Rotina' })).not.toBeOnTheScreen();

    await user.press(readMore);
    await user.press(screen.getByLabelText('Fechar rotina'));
    expect(screen.queryByRole('header', { name: 'Rotina' })).not.toBeOnTheScreen();
  });

  test('"Tire suas dúvidas" abre o chat do Host com o contexto da busca', async () => {
    const user = await renderScreen({ id: HOST_ID, checkIn: '2026-12-18', checkOut: '2026-12-21', petId: 'pet-1' });

    await user.press(await screen.findByRole('button', { name: 'Tire suas dúvidas' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/chat/[id]',
      params: { id: HOST_ID, checkIn: '2026-12-18', checkOut: '2026-12-21', petId: 'pet-1' },
    });
  });

  test('"Solicitar reserva" abre a confirmação com o contexto da busca', async () => {
    const user = await renderScreen({ id: HOST_ID, checkIn: '2026-12-18', checkOut: '2026-12-21' });

    await user.press(await screen.findByRole('button', { name: 'Solicitar reserva' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/reserva/[id]',
      params: { id: HOST_ID, checkIn: '2026-12-18', checkOut: '2026-12-21' },
    });
  });

  test('404 mostra "Hospedagem não encontrada" e volta', async () => {
    mockedGet.mockRejectedValue(httpError(404));
    const user = await renderScreen({ id: HOST_ID });

    expect(await screen.findByText('Hospedagem não encontrada')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.back).toHaveBeenCalled();
  });

  test('sem rede mostra o aviso de erro', async () => {
    mockedGet.mockRejectedValue(networkError());
    await renderScreen({ id: HOST_ID });

    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();
  });
});

describe('services/hosts e datas da rota', () => {
  test('preço mais baixo e local sem campos vazios', () => {
    expect(lowestPrice(HOST)).toBe(120);
    expect(lowestPrice({ ...HOST, services: [] })).toBeNull();
    expect(formatHostLocation({ location: { city: 'Londrina', neighborhood: null } })).toBe('Londrina');
  });

  test('converte a data para a rota e de volta', () => {
    const date = new Date(2026, 7, 1);

    expect(toIsoDate(date)).toBe('2026-08-01');
    expect(fromIsoDate('2026-08-01')).toEqual(date);
    expect(fromIsoDate('01/08/2026')).toBeNull();
    expect(fromIsoDate(undefined)).toBeNull();
  });
});
