import { render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import HostDetailsScreen from '../src/app/host/[id]';
import { formatHostLocation, getHostPage, lowestPrice } from '../src/services/hosts';
import { fromIsoDate, toIsoDate } from '../src/utils/calendar';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockedParams = useLocalSearchParams as jest.Mock;

async function renderScreen(params: Record<string, string>) {
  mockedParams.mockReturnValue(params);
  await render(<HostDetailsScreen />);
  return userEvent.setup();
}

describe('Tela de detalhe do Host', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mostra nome, local só com bairro e cidade, avaliação e preço', async () => {
    await renderScreen({ id: 'nearby-1' });

    expect(await screen.findByRole('header', { name: 'Recanto Pata Mansa' })).toBeOnTheScreen();
    expect(screen.getAllByText('Zona 7, Maringá')).toHaveLength(2);
    expect(screen.getByText('4.9 (1.092 Avaliações)')).toBeOnTheScreen();
    expect(screen.getByText('R$ 250')).toBeOnTheScreen();
  });

  test('mostra as datas que vieram da busca', async () => {
    await renderScreen({ id: 'nearby-1', checkIn: '2026-08-01', checkOut: '2026-08-02' });

    expect(await screen.findByText('01/08/2026  -  02/08/2026')).toBeOnTheScreen();
  });

  test('sem datas, pede para escolher na busca', async () => {
    await renderScreen({ id: 'nearby-1' });

    expect(await screen.findByText('Escolha as datas na busca')).toBeOnTheScreen();
  });

  test('a galeria mostra quantas fotos ficaram de fora', async () => {
    await renderScreen({ id: 'nearby-1' });

    expect(await screen.findByText('+1')).toBeOnTheScreen();
  });

  test('"Ler mais" na rotina mostra os itens escondidos', async () => {
    const user = await renderScreen({ id: 'nearby-1' });
    await screen.findByText('Rotina');
    expect(screen.queryByText('Passeio no fim da tarde')).not.toBeOnTheScreen();

    const buttons = screen.getAllByRole('button', { name: 'Ler mais' });
    await user.press(buttons[buttons.length - 1]);

    expect(screen.getByText('Passeio no fim da tarde')).toBeOnTheScreen();
  });

  test('tem os botões do rodapé, sem contato direto com o Host', async () => {
    await renderScreen({ id: 'nearby-1' });

    expect(await screen.findByRole('button', { name: 'Solicitar reserva' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tire suas dúvidas' })).toBeOnTheScreen();
    expect(screen.queryByText(/@|telefone|whatsapp/i)).not.toBeOnTheScreen();
  });

  test('Host inexistente mostra o aviso e volta', async () => {
    const user = await renderScreen({ id: 'nao-existe' });

    expect(await screen.findByText('Hospedagem não encontrada')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.back).toHaveBeenCalled();
  });
});

describe('services/hosts e datas da rota', () => {
  test('preço mais baixo e local sem campos vazios', async () => {
    const { host } = await getHostPage('popular-1');

    expect(lowestPrice(host)).toBe(250);
    expect(lowestPrice({ ...host, services: [] })).toBeNull();
    expect(formatHostLocation({ ...host, location: { city: 'Londrina', neighborhood: null } })).toBe(
      'Londrina',
    );
  });

  test('converte a data para a rota e de volta', () => {
    const date = new Date(2026, 7, 1);

    expect(toIsoDate(date)).toBe('2026-08-01');
    expect(fromIsoDate('2026-08-01')).toEqual(date);
    expect(fromIsoDate('01/08/2026')).toBeNull();
    expect(fromIsoDate(undefined)).toBeNull();
  });
});
