import { render, screen, userEvent, within } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ChatScreen from '../src/app/chat/[id]';
import { backendApi } from '../src/services/api';
import { HostDetails } from '../src/services/hosts';
import { countNights, formatTime } from '../src/utils/chat';
import { httpError } from '../test-utils/http';

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

const HOST: HostDetails = {
  id: HOST_ID,
  name: 'Hotelzinho da Ana',
  description: null,
  pictureUrl: null,
  location: { city: 'Maringá', neighborhood: 'Zona 7' },
  photos: [],
  accepts: { species: ['dog'], sizes: ['small'], breeds: [] },
  services: [{ id: 'service-1', name: 'Diária', price: 120 }],
  reputation: { rating: 4.8, reviewCount: 10 },
};

async function renderScreen(params: Record<string, string>) {
  mockedParams.mockReturnValue(params);
  await render(<ChatScreen />);
  return userEvent.setup();
}

describe('Tela de chat com o Host', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockResolvedValue({ data: HOST });
  });

  test('abre a conversa do Host certo, com o contexto da busca', async () => {
    await renderScreen({ id: HOST_ID, checkIn: '2026-12-18', checkOut: '2026-12-21', petId: 'pet-1' });

    expect(await screen.findByRole('header', { name: 'Hotelzinho da Ana' })).toBeOnTheScreen();
    expect(mockedGet).toHaveBeenCalledWith(`/api/v1/hosts/${HOST_ID}`);
    expect(screen.getByText('Interesse em reservar')).toBeOnTheScreen();
    expect(screen.getByText('18/12/2026 - 21/12/2026')).toBeOnTheScreen();
    // 3 noites de R$ 120
    expect(screen.getByText('R$ 360 (3 noites)')).toBeOnTheScreen();
    expect(screen.getByText('Paçoca')).toBeOnTheScreen();
  });

  test('sem datas mostra o preço da diária e "Ver detalhes" volta ao detalhe', async () => {
    const user = await renderScreen({ id: HOST_ID });

    expect(await screen.findByText('R$ 120 / noite')).toBeOnTheScreen();
    expect(screen.getByText('Escolha as datas na busca')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Ver detalhes' }));
    expect(router.back).toHaveBeenCalled();
  });

  test('separa as mensagens por dia e identifica o Assistente e o Host', async () => {
    await renderScreen({ id: HOST_ID });

    await screen.findByRole('header', { name: 'Hotelzinho da Ana' });
    expect(screen.getByText('Ontem')).toBeOnTheScreen();
    expect(screen.getByText('Hoje')).toBeOnTheScreen();
    expect(screen.getAllByText('Ativa').length).toBeGreaterThan(0);
    expect(screen.getByText('Atendimento Humano')).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Você, 10:05:/)).toBeOnTheScreen();
  });

  test('não mostra contato direto do Host nem botão de ligar', async () => {
    await renderScreen({ id: HOST_ID });

    await screen.findByRole('header', { name: 'Hotelzinho da Ana' });
    expect(screen.queryByRole('button', { name: /ligar/i })).not.toBeOnTheScreen();
    expect(screen.queryByText(/@|telefone|whatsapp/i)).not.toBeOnTheScreen();
  });

  test('mandar uma mensagem a coloca no fim da conversa e limpa o campo', async () => {
    const user = await renderScreen({ id: HOST_ID });
    const input = await screen.findByLabelText('Mensagem');

    await user.type(input, 'Vocês aceitam gatos?');
    await user.press(screen.getByRole('button', { name: 'Enviar mensagem' }));

    const bubbles = screen.getAllByLabelText(/^(Você|Assistente Hospetse|Hotelzinho da Ana), /);
    expect(within(bubbles[bubbles.length - 1]).getByText('Vocês aceitam gatos?')).toBeOnTheScreen();
    expect(input.props.value).toBe('');
  });

  test('o envio fica desligado com o campo vazio', async () => {
    await renderScreen({ id: HOST_ID });

    expect(await screen.findByRole('button', { name: 'Enviar mensagem' })).toBeDisabled();
  });

  test('tocar numa sugestão rápida envia o texto dela', async () => {
    const user = await renderScreen({ id: HOST_ID });

    await user.press(await screen.findByRole('button', { name: 'Posso levar a ração?' }));

    const bubbles = screen.getAllByLabelText(/^(Você|Assistente Hospetse|Hotelzinho da Ana), /);
    expect(bubbles[bubbles.length - 1].props.accessibilityLabel).toMatch(/^Você, .*Posso levar a ração\?$/);
  });

  test('404 mostra "Hospedagem não encontrada"', async () => {
    mockedGet.mockRejectedValue(httpError(404));
    await renderScreen({ id: HOST_ID });

    expect(await screen.findByText('Hospedagem não encontrada')).toBeOnTheScreen();
  });
});

describe('utils/chat', () => {
  test('conta as noites e formata o horário', () => {
    expect(countNights(new Date(2026, 11, 18), new Date(2026, 11, 21))).toBe(3);
    expect(formatTime(new Date(2026, 11, 18, 9, 5))).toBe('09:05');
  });
});
