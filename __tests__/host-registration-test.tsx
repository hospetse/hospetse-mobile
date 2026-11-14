import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import HostUnderReviewScreen from '../src/app/cadastro-host/analise';
import HostPhotosScreen from '../src/app/cadastro-host/fotos';
import HostSpaceScreen from '../src/app/cadastro-host/index';
import ProfileScreen from '../src/app/perfil';
import {
  EMPTY_HOST_REGISTRATION,
  HostRegistrationData,
  HostRegistrationProvider,
} from '../src/context/HostRegistrationContext';
import { useSession } from '../src/context/SessionContext';
import { backendApi, SessionExpiredError } from '../src/services/api';
import { pickDocument } from '../src/services/document-picker';
import { HostProfile } from '../src/services/host-registration';
import { pickPhoto } from '../src/services/photo-picker';
import { lookupZipCode } from '../src/services/zip-code';
import { apiError, networkError } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  Stack: { Screen: () => null },
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native');
  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('../src/context/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('../src/services/api', () => {
  class SessionExpiredError extends Error {}
  return {
    backendApi: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
    SessionExpiredError,
  };
});
jest.mock('../src/services/photo-picker', () => {
  class PhotoTooLargeError extends Error {}
  return { PhotoTooLargeError, pickPhoto: jest.fn() };
});
jest.mock('../src/services/document-picker', () => {
  class DocumentTooLargeError extends Error {}
  return { DocumentTooLargeError, pickDocument: jest.fn() };
});
jest.mock('../src/services/zip-code', () => {
  const actual = jest.requireActual('../src/services/zip-code');
  return { ...actual, lookupZipCode: jest.fn() };
});

const mockedGet = backendApi.get as jest.Mock;
const mockedPost = backendApi.post as jest.Mock;
const mockedPut = backendApi.put as jest.Mock;
const mockedPickPhoto = pickPhoto as jest.Mock;
const mockedPickDocument = pickDocument as jest.Mock;
const mockedLookup = lookupZipCode as jest.Mock;

const VALID_CPF = '52998224725';
const IDENTITY = 'Documento de identidade (RG ou CNH)';
const PROOF = 'Comprovante de endereço';

async function renderWithProvider(ui: React.ReactElement, initialData?: HostRegistrationData) {
  await render(<HostRegistrationProvider initialData={initialData}>{ui}</HostRegistrationProvider>);
}

async function press(name: string | RegExp, role: 'button' | 'checkbox' | 'radio' = 'button') {
  await fireEvent.press(screen.getByRole(role, { name }));
}

async function type(label: string, text: string) {
  await fireEvent.changeText(screen.getByLabelText(label), text);
}

beforeEach(() => {
  // Só os mocks deste arquivo: resetar todos zeraria também os do React Native (ex.: Switch)
  jest.clearAllMocks();
  for (const mock of [
    mockedGet,
    mockedPost,
    mockedPut,
    mockedPickPhoto,
    mockedPickDocument,
    mockedLookup,
  ]) {
    mock.mockReset();
  }
  (useSession as jest.Mock).mockReturnValue({
    currentUser: {
      user: { id: 'u1', authUserId: 'a1', name: 'Ana Souza', email: 'ana@exemplo.com' },
      profile: { status: 'complete', missingFields: [] },
      permissions: { canSearch: true, canContract: true },
    },
    logout: jest.fn(),
  });
});

describe('etapa 1: espaço', () => {
  async function fillSpace() {
    await press('Cães', 'checkbox');
    await press(/Pequeno/, 'checkbox');
    await type('Quantos pets você recebe ao mesmo tempo?', '3');
    await type('Apresentação do Cuidador', 'a'.repeat(80));
  }

  test('sem preencher, mostra todos os erros e não chama o back-end', async () => {
    await renderWithProvider(<HostSpaceScreen />);

    await press('Avançar para fotos e Endereço');

    expect(screen.getByText('Escolha ao menos uma espécie.')).toBeTruthy();
    expect(screen.getByText('Escolha ao menos um porte aceito.')).toBeTruthy();
    expect(screen.getByText('Informe quantos pets você recebe ao mesmo tempo.')).toBeTruthy();
    expect(screen.getByText('Escreva a apresentação do cuidador.')).toBeTruthy();
    expect(mockedPut).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('salva o rascunho no back-end e avança para a etapa 2', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    await renderWithProvider(<HostSpaceScreen />);
    await fillSpace();

    await press('Avançar para fotos e Endereço');

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/cadastro-host/fotos'));
    expect(mockedPut).toHaveBeenCalledWith('/api/v1/me/host', {
      providerType: 'hotel',
      name: 'Ana Souza',
      description: 'a'.repeat(80),
      capacity: 3,
      acceptedSpecies: ['dog'],
      acceptedSizes: ['small'],
    });
  });

  test('a seta de voltar volta uma tela', async () => {
    await renderWithProvider(<HostSpaceScreen />);
    await press('Voltar');
    expect(router.back).toHaveBeenCalled();
  });

  test('erro de campo do servidor aparece no campo e some quando o Host corrige', async () => {
    mockedPut.mockRejectedValue(
      apiError(400, 'VALIDATION_ERROR', [{ field: 'capacity', message: 'inteiro de 1 a 1000' }]),
    );
    await renderWithProvider(<HostSpaceScreen />);
    await fillSpace();

    await press('Avançar para fotos e Endereço');

    await waitFor(() =>
      expect(screen.getByText('Informe uma capacidade de 1 a 1000 pets.')).toBeTruthy(),
    );
    expect(router.push).not.toHaveBeenCalled();

    await type('Quantos pets você recebe ao mesmo tempo?', '4');
    expect(screen.queryByText('Informe uma capacidade de 1 a 1000 pets.')).toBeNull();
  });

  test('sem conexão, avisa e fica na etapa', async () => {
    mockedPut.mockRejectedValue(networkError());
    await renderWithProvider(<HostSpaceScreen />);
    await fillSpace();

    await press('Avançar para fotos e Endereço');

    await waitFor(() => expect(screen.getByText('Sem conexão')).toBeTruthy());
    expect(router.push).not.toHaveBeenCalled();
  });

  test('cadastro já enviado leva à tela de análise', async () => {
    mockedPut.mockRejectedValue(apiError(409, 'HOST_ALREADY_SUBMITTED'));
    await renderWithProvider(<HostSpaceScreen />);
    await fillSpace();

    await press('Avançar para fotos e Endereço');

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/cadastro-host/analise'));
  });
});

describe('etapa 2: fotos, localização e documentos', () => {
  const SPACE: HostRegistrationData = {
    ...EMPTY_HOST_REGISTRATION,
    description: 'a'.repeat(80),
    capacity: '3',
    acceptedSpecies: ['dog'],
    acceptedSizes: ['small'],
  };

  async function fillLocationAndDocuments({ withRoomPhoto = true } = {}) {
    mockedPickPhoto.mockResolvedValueOnce('file:///capa.jpg');
    await press('Enviar Foto');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Trocar foto' })).toBeTruthy());

    if (withRoomPhoto) {
      mockedPickPhoto.mockResolvedValueOnce('file:///sala.jpg');
      await press('Adicionar foto: Sala');
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Remover foto: Sala' })).toBeTruthy(),
      );
    }

    mockedLookup.mockResolvedValue({
      street: 'Rua Joaquim Floriano',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
    });
    await type('CEP', '04538132');
    await press('Buscar CEP');
    await waitFor(() => expect(screen.getByLabelText('Bairro').props.value).toBe('Itaim Bibi'));
    await type('Número', '733');

    await type('CPF ou CNPJ', VALID_CPF);
    expect(screen.getByLabelText('CPF ou CNPJ').props.value).toBe('529.982.247-25');

    mockedPickDocument.mockResolvedValueOnce({
      uri: 'file:///rg.pdf',
      name: 'rg.pdf',
      mimeType: 'application/pdf',
    });
    await press(`Enviar arquivo: ${IDENTITY}`);
    await waitFor(() => expect(screen.getByText('rg.pdf')).toBeTruthy());

    mockedPickDocument.mockResolvedValueOnce({
      uri: 'file:///conta.pdf',
      name: 'conta.pdf',
      mimeType: 'application/pdf',
    });
    await press(`Enviar arquivo: ${PROOF}`);
    await waitFor(() => expect(screen.getByText('conta.pdf')).toBeTruthy());
  }

  test('sem preencher, mostra todos os erros e não envia nada', async () => {
    await renderWithProvider(<HostPhotosScreen />, SPACE);

    expect(screen.queryByText('Avançar para fotos e Endereço')).toBeNull();
    await press('Enviar para análise');

    expect(screen.getByText('Envie a foto principal do seu espaço.')).toBeTruthy();
    expect(screen.getByText('Informe um CEP com 8 dígitos.')).toBeTruthy();
    expect(screen.getByText('Informe a rua ou o logradouro.')).toBeTruthy();
    expect(screen.getByText('Informe o número.')).toBeTruthy();
    expect(screen.getByText('Informe o bairro.')).toBeTruthy();
    expect(screen.getByText('Informe seu CPF ou CNPJ.')).toBeTruthy();
    expect(screen.getByText('Envie o documento de identidade.')).toBeTruthy();
    expect(screen.getByText('Envie o comprovante de endereço.')).toBeTruthy();
    expect(mockedPut).not.toHaveBeenCalled();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  test('CNPJ pede também o cartão CNPJ', async () => {
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    expect(screen.queryByText('Cartão CNPJ')).toBeNull();

    await type('CPF ou CNPJ', '11222333000181');
    expect(screen.getByText('Cartão CNPJ')).toBeTruthy();

    await press('Enviar para análise');
    expect(screen.getByText('Envie o cartão CNPJ.')).toBeTruthy();
  });

  test('envia rascunho, fotos, documentos e submete, mostrando o progresso', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockResolvedValue({ data: { id: 'x' } });
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    await fillLocationAndDocuments();

    await press('Enviar para análise');

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith('/cadastro-host/analise'),
    );
    expect(mockedPut).toHaveBeenCalledWith(
      '/api/v1/me/host',
      expect.objectContaining({
        name: 'Ana Souza',
        cpfCnpj: VALID_CPF,
        address: {
          zipCode: '04538132',
          street: 'Rua Joaquim Floriano',
          number: '733',
          complement: null,
          neighborhood: 'Itaim Bibi',
          city: 'São Paulo',
          state: 'SP',
        },
      }),
    );
    expect(mockedPost.mock.calls.map((call) => call[0])).toEqual([
      '/api/v1/me/host/photos',
      '/api/v1/me/host/photos',
      '/api/v1/me/host/documents',
      '/api/v1/me/host/documents',
      '/api/v1/me/host/submit',
    ]);
  });

  test('falha de upload mostra o motivo, deixa tentar de novo e não repete o que já subiu', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    // capa sobe; a foto da sala falha por falta do armazenamento
    mockedPost
      .mockResolvedValueOnce({ data: { id: 'p1' } })
      .mockRejectedValueOnce(apiError(503, 'STORAGE_UNAVAILABLE'))
      .mockResolvedValue({ data: { id: 'x' } });
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    await fillLocationAndDocuments();

    await press('Enviar para análise');

    await waitFor(() => expect(screen.getByText('Não foi possível enviar')).toBeTruthy());
    expect(
      screen.getByText('O armazenamento de arquivos não respondeu. Tente de novo.'),
    ).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
    // parou na foto que falhou: nenhum documento foi enviado, nem a submissão
    expect(mockedPost.mock.calls.map((call) => call[0])).toEqual([
      '/api/v1/me/host/photos',
      '/api/v1/me/host/photos',
    ]);

    await press('Tentar de novo');

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/cadastro-host/analise'));
    // a capa não subiu de novo: só a foto da sala, os 2 documentos e a submissão
    expect(mockedPost.mock.calls.map((call) => call[0]).slice(2)).toEqual([
      '/api/v1/me/host/photos',
      '/api/v1/me/host/documents',
      '/api/v1/me/host/documents',
      '/api/v1/me/host/submit',
    ]);
  });

  test('sem conexão ao salvar o rascunho, avisa e deixa tentar de novo', async () => {
    mockedPut.mockRejectedValueOnce(networkError()).mockResolvedValue({ data: {} });
    mockedPost.mockResolvedValue({ data: { id: 'x' } });
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    await fillLocationAndDocuments({ withRoomPhoto: false });

    await press('Enviar para análise');

    await waitFor(() => expect(screen.getByText('Tentar de novo')).toBeTruthy());
    expect(screen.getByText(/Sem conexão/)).toBeTruthy();
    expect(mockedPost).not.toHaveBeenCalled();

    await press('Tentar de novo');
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/cadastro-host/analise'));
  });

  test('arquivo recusado pelo servidor mostra o motivo e não oferece repetir', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockRejectedValue(
      apiError(400, 'VALIDATION_ERROR', [{ field: 'file', message: 'O arquivo passa do limite de 5 MB' }]),
    );
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    await fillLocationAndDocuments({ withRoomPhoto: false });

    await press('Enviar para análise');

    await waitFor(() => expect(screen.getByText('O arquivo passa do limite de 5 MB')).toBeTruthy());
    expect(screen.queryByText('Tentar de novo')).toBeNull();

    await press('Fechar');
    expect(screen.queryByText('Não foi possível enviar')).toBeNull();
  });

  test('o back-end recusa a submissão: mostra o erro na etapa certa', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockImplementation((url: string) =>
      url.endsWith('/submit')
        ? Promise.reject(
            apiError(400, 'VALIDATION_ERROR', [{ field: 'capacity', message: 'obrigatório' }]),
          )
        : Promise.resolve({ data: { id: 'x' } }),
    );
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    await fillLocationAndDocuments({ withRoomPhoto: false });

    await press('Enviar para análise');

    // erro da etapa 1: volta para ela
    await waitFor(() => expect(router.dismissTo).toHaveBeenCalledWith('/cadastro-host'));
    expect(router.push).not.toHaveBeenCalled();
  });

  test('erro de documento do servidor aparece no próprio campo, sem sair da etapa', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockImplementation((url: string) =>
      url.endsWith('/submit')
        ? Promise.reject(
            apiError(400, 'VALIDATION_ERROR', [
              { field: 'cpfCnpj', message: 'CPF ou CNPJ já cadastrado' },
            ]),
          )
        : Promise.resolve({ data: { id: 'x' } }),
    );
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    await fillLocationAndDocuments({ withRoomPhoto: false });

    await press('Enviar para análise');

    await waitFor(() =>
      expect(screen.getByText('Esse CPF ou CNPJ já está cadastrado.')).toBeTruthy(),
    );
    expect(router.dismissTo).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('cadastro já enviado leva à tela de análise', async () => {
    mockedPut.mockRejectedValue(apiError(409, 'HOST_ALREADY_SUBMITTED'));
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    await fillLocationAndDocuments({ withRoomPhoto: false });

    await press('Enviar para análise');

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/cadastro-host/analise'));
  });

  test('rascunho retomado: o que o servidor já tem não precisa ser enviado de novo', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockResolvedValue({ data: { id: 'x' } });
    const resumed: HostRegistrationData = {
      ...SPACE,
      status: 'draft',
      savedCpfCnpj: '***4725',
      serverPhotos: [{ id: 'p1', url: 'https://exemplo.com/p1.jpg' }],
      serverDocumentTypes: ['identity', 'proof_of_address'],
      zipCode: '04538-132',
      zipLookedUp: '04538132',
      street: 'Rua Joaquim Floriano',
      number: '733',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
    };
    await renderWithProvider(<HostPhotosScreen />, resumed);

    expect(screen.getByText('1 foto já enviada')).toBeTruthy();
    expect(screen.getAllByText('Já enviado')).toHaveLength(2);
    expect(screen.getByLabelText('CPF ou CNPJ').props.placeholder).toMatch(/\*\*\*4725/);

    await press('Enviar para análise');

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/cadastro-host/analise'));
    // sem arquivo novo e sem CPF novo: só o rascunho e a submissão
    expect(mockedPost.mock.calls.map((call) => call[0])).toEqual(['/api/v1/me/host/submit']);
    expect('cpfCnpj' in mockedPut.mock.calls[0][1]).toBe(false);
  });

  test('a seta de voltar volta para a etapa 1', async () => {
    await renderWithProvider(<HostPhotosScreen />, SPACE);
    await press('Voltar');
    expect(router.back).toHaveBeenCalled();
  });
});

describe('tela de análise', () => {
  test('logo depois do envio, mostra pendente de validação', async () => {
    await renderWithProvider(<HostUnderReviewScreen />, {
      ...EMPTY_HOST_REGISTRATION,
      status: 'pending',
    });

    expect(screen.getByText('Cadastro enviado para análise')).toBeTruthy();
    expect(screen.getByText('Pendente de validação')).toBeTruthy();
    expect(screen.getByText('Seu perfil só aparece nas buscas depois da aprovação.')).toBeTruthy();
  });

  test('mostra aprovado e não aprovado ao retomar', async () => {
    await renderWithProvider(<HostUnderReviewScreen />, {
      ...EMPTY_HOST_REGISTRATION,
      status: 'approved',
    });
    expect(screen.getByText('Cadastro aprovado')).toBeTruthy();
    expect(screen.queryByText('Seu perfil só aparece nas buscas depois da aprovação.')).toBeNull();
  });

  test('não aprovado', async () => {
    await renderWithProvider(<HostUnderReviewScreen />, {
      ...EMPTY_HOST_REGISTRATION,
      status: 'rejected',
    });
    expect(screen.getByText('Cadastro não aprovado')).toBeTruthy();
  });

  test('volta ao Perfil ou ao Início', async () => {
    await renderWithProvider(<HostUnderReviewScreen />, {
      ...EMPTY_HOST_REGISTRATION,
      status: 'pending',
    });

    await press('Voltar ao Perfil');
    expect(router.dismissTo).toHaveBeenCalledWith('/perfil');

    await press('Ir para o Início');
    expect(router.dismissTo).toHaveBeenCalledWith('/home');
  });
});

describe('entrada pelo Perfil', () => {
  const DRAFT: HostProfile = {
    id: 'h1',
    validationStatus: 'draft',
    providerType: 'hotel',
    name: 'Ana Souza',
    description: 'Casa com quintal e muito carinho.',
    cpfCnpjMasked: null,
    address: null,
    capacity: 2,
    acceptedSpecies: ['dog'],
    acceptedSizes: ['small'],
    acceptedBreeds: [],
    documents: [],
    photos: [],
  };

  test('quem ainda não começou abre a etapa 1', async () => {
    mockedGet.mockRejectedValue(apiError(404, 'NOT_FOUND'));
    await renderWithProvider(<ProfileScreen />);

    await press('Quero ser Host');

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/cadastro-host'));
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/me/host');
  });

  test('rascunho com a etapa 1 pronta retoma na etapa 2, com a 1 por baixo', async () => {
    mockedGet.mockResolvedValue({ data: DRAFT });
    await renderWithProvider(<ProfileScreen />);

    await press('Quero ser Host');

    await waitFor(() => expect(router.push).toHaveBeenCalledTimes(2));
    expect((router.push as jest.Mock).mock.calls.map((call) => call[0])).toEqual([
      '/cadastro-host',
      '/cadastro-host/fotos',
    ]);
  });

  test('rascunho sem a etapa 1 completa retoma na etapa 1', async () => {
    mockedGet.mockResolvedValue({ data: { ...DRAFT, capacity: null } });
    await renderWithProvider(<ProfileScreen />);

    await press('Quero ser Host');

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/cadastro-host'));
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  test('cadastro já enviado abre a tela de análise', async () => {
    mockedGet.mockResolvedValue({ data: { ...DRAFT, validationStatus: 'pending' } });
    await renderWithProvider(<ProfileScreen />);

    await press('Quero ser Host');

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/cadastro-host/analise'));
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  test('sem conexão, avisa e não abre o cadastro', async () => {
    mockedGet.mockRejectedValue(networkError());
    await renderWithProvider(<ProfileScreen />);

    await press('Quero ser Host');

    await waitFor(() =>
      expect(screen.getByText(/Não foi possível abrir o cadastro agora/)).toBeTruthy(),
    );
    expect(router.push).not.toHaveBeenCalled();
  });

  test('sessão vencida não mostra aviso: o app já leva ao login', async () => {
    mockedGet.mockRejectedValue(new SessionExpiredError());
    await renderWithProvider(<ProfileScreen />);

    await press('Quero ser Host');

    await waitFor(() => expect(mockedGet).toHaveBeenCalled());
    expect(screen.queryByText(/Não foi possível abrir o cadastro agora/)).toBeNull();
    expect(router.push).not.toHaveBeenCalled();
  });
});
