import { EMPTY_HOST_REGISTRATION } from '../src/context/HostRegistrationContext';
import { backendApi } from '../src/services/api';
import {
  getHostProfile,
  HostProfile,
  toHostError,
  uploadHostDocument,
  uploadHostPhoto,
} from '../src/services/host-registration';
import { submitHostRegistration } from '../src/services/host-submission';
import { formatCpfCnpj, isValidCnpj, isValidCpf } from '../src/utils/cpfCnpj';
import {
  buildFullDraft,
  buildSpaceDraft,
  buildSubmitItems,
  needsCnpjCard,
  profileToRegistration,
  resumeRoutes,
  uploadedKey,
} from '../src/utils/hostRegistrationMapping';
import { stepOfErrors, toFieldErrors } from '../src/utils/hostServerErrors';
import {
  validateHostDocuments,
  validateHostSpace,
} from '../src/utils/validateHostRegistration';
import { apiError, httpError, networkError } from '../test-utils/http';

jest.mock('../src/services/api', () => {
  class SessionExpiredError extends Error {}
  return {
    backendApi: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
    SessionExpiredError,
  };
});

const mockedGet = backendApi.get as jest.Mock;
const mockedPost = backendApi.post as jest.Mock;
const mockedPut = backendApi.put as jest.Mock;

const VALID_CPF = '529.982.247-25';
const VALID_CNPJ = '11.222.333/0001-81';

const PROFILE: HostProfile = {
  id: 'host-1',
  validationStatus: 'draft',
  providerType: 'hotel',
  name: 'Ana',
  description: 'Casa com quintal e muito carinho.',
  cpfCnpjMasked: '***4725',
  address: {
    zipCode: '04538132',
    street: 'Rua Joaquim Floriano',
    number: '733',
    complement: null,
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'SP',
  },
  capacity: 3,
  acceptedSpecies: ['dog', 'cat', 'bird'],
  acceptedSizes: ['small', 'giant'],
  acceptedBreeds: [],
  documents: [
    { id: 'd1', type: 'identity' },
    { id: 'd2', type: 'unknown' },
  ],
  photos: [{ id: 'p1', url: 'https://exemplo.com/p1.jpg' }],
};

beforeEach(() => {
  jest.clearAllMocks();
});

// Nomes dos campos do formulário, na ordem em que foram adicionados
function fieldNames(form: FormData): string[] {
  return Array.from(form.keys());
}

describe('CPF e CNPJ', () => {
  test('máscara muda de CPF para CNPJ conforme a quantidade de dígitos', () => {
    expect(formatCpfCnpj('52998224725')).toBe('529.982.247-25');
    expect(formatCpfCnpj('529982')).toBe('529.982');
    expect(formatCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(formatCpfCnpj('112223330001819999')).toBe('11.222.333/0001-81');
    expect(formatCpfCnpj('abc')).toBe('');
  });

  test('valida os dígitos verificadores e recusa sequências repetidas', () => {
    expect(isValidCpf(VALID_CPF)).toBe(true);
    expect(isValidCpf('529.982.247-24')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('123')).toBe(false);
    expect(isValidCnpj(VALID_CNPJ)).toBe(true);
    expect(isValidCnpj('11.222.333/0001-82')).toBe(false);
    expect(isValidCnpj('00.000.000/0000-00')).toBe(false);
  });
});

describe('validações do cadastro', () => {
  test('etapa 1 exige espécie, porte, capacidade de 1 a 1000 e apresentação', () => {
    const empty = validateHostSpace({
      acceptedSizes: [],
      acceptedSpecies: [],
      capacity: '',
      description: '',
    });
    expect(Object.keys(empty).sort()).toEqual([
      'acceptedSizes',
      'acceptedSpecies',
      'capacity',
      'description',
    ]);

    const base = { acceptedSizes: ['small' as const], acceptedSpecies: ['dog' as const], description: 'a'.repeat(80) };
    expect(validateHostSpace({ ...base, capacity: '0' }).capacity).toBeTruthy();
    expect(validateHostSpace({ ...base, capacity: '1001' }).capacity).toBeTruthy();
    expect(validateHostSpace({ ...base, capacity: '2,5' }).capacity).toBeTruthy();
    expect(validateHostSpace({ ...base, capacity: '1' })).toEqual({});
    expect(validateHostSpace({ ...base, capacity: '1000' })).toEqual({});
  });

  test('documentos: CPF/CNPJ válido, identidade e comprovante; cartão CNPJ só para CNPJ', () => {
    const none = { identity: false, proof_of_address: false, cnpj_card: false };
    const all = { identity: true, proof_of_address: true, cnpj_card: true };

    expect(validateHostDocuments({ cpfCnpj: '', hasSavedCpfCnpj: false, hasDocument: none })).toEqual({
      cpfCnpj: 'Informe seu CPF ou CNPJ.',
      identity: 'Envie o documento de identidade.',
      proof_of_address: 'Envie o comprovante de endereço.',
    });
    // CPF já salvo no servidor: pode deixar em branco
    expect(
      validateHostDocuments({ cpfCnpj: '', hasSavedCpfCnpj: true, hasDocument: { ...all, cnpj_card: false } }),
    ).toEqual({});
    expect(
      validateHostDocuments({ cpfCnpj: '529.982.247-24', hasSavedCpfCnpj: false, hasDocument: all }).cpfCnpj,
    ).toBe('CPF inválido.');
    expect(
      validateHostDocuments({ cpfCnpj: '11.222.333/0001-82', hasSavedCpfCnpj: false, hasDocument: all }).cpfCnpj,
    ).toBe('CNPJ inválido.');
    expect(
      validateHostDocuments({ cpfCnpj: '1234567', hasSavedCpfCnpj: false, hasDocument: all }).cpfCnpj,
    ).toMatch(/11 dígitos/);

    const cnpj = validateHostDocuments({
      cpfCnpj: VALID_CNPJ,
      hasSavedCpfCnpj: false,
      hasDocument: { ...all, cnpj_card: false },
    });
    expect(cnpj).toEqual({ cnpj_card: 'Envie o cartão CNPJ.' });
    expect(needsCnpjCard(VALID_CNPJ)).toBe(true);
    expect(needsCnpjCard(VALID_CPF)).toBe(false);
  });
});

describe('erros do servidor por campo', () => {
  test('traduz os campos do back-end para os da tela e ignora os que a tela não mostra', () => {
    const errors = toFieldErrors([
      { field: 'description', message: 'obrigatório' },
      { field: 'address.city', message: 'obrigatório, até 100 caracteres' },
      { field: 'documents.proof_of_address', message: 'obrigatório' },
      { field: 'photos', message: 'envie ao menos uma foto' },
      { field: 'name', message: 'obrigatório' },
    ]);
    expect(Object.keys(errors).sort()).toEqual([
      'coverPhoto',
      'description',
      'proof_of_address',
      'zipCode',
    ]);
    expect(errors.zipCode).toMatch(/CEP/);
  });

  test('CPF ou CNPJ duplicado tem mensagem própria', () => {
    expect(toFieldErrors([{ field: 'cpfCnpj', message: 'CPF ou CNPJ já cadastrado' }]).cpfCnpj).toBe(
      'Esse CPF ou CNPJ já está cadastrado.',
    );
    expect(toFieldErrors([{ field: 'cpfCnpj', message: 'obrigatório' }]).cpfCnpj).toBe(
      'Informe seu CPF ou CNPJ.',
    );
  });

  test('a etapa 1 tem prioridade quando há erro dela', () => {
    expect(stepOfErrors({ capacity: 'x', street: 'y' })).toBe(1);
    expect(stepOfErrors({ street: 'y', identity: 'z' })).toBe(2);
  });
});

describe('toHostError', () => {
  test('reconhece cada situação do back-end', () => {
    expect(toHostError(apiError(409, 'HOST_ALREADY_SUBMITTED')).kind).toBe('already-submitted');
    expect(toHostError(apiError(409, 'FILE_LIMIT_REACHED')).kind).toBe('limit');
    expect(toHostError(apiError(503, 'STORAGE_UNAVAILABLE')).kind).toBe('retry');
    expect(toHostError(apiError(409, 'HOST_DRAFT_CONFLICT')).kind).toBe('retry');
    expect(toHostError(networkError()).kind).toBe('network');
    expect(toHostError(httpError(500)).kind).toBe('generic');
    expect(toHostError(new Error('x')).kind).toBe('generic');

    const fields = toHostError(
      apiError(400, 'VALIDATION_ERROR', [{ field: 'capacity', message: 'obrigatório' }]),
    );
    expect(fields).toEqual({ kind: 'fields', details: [{ field: 'capacity', message: 'obrigatório' }] });
    // VALIDATION_ERROR sem detalhes não dá o que corrigir
    expect(toHostError(apiError(400, 'VALIDATION_ERROR')).kind).toBe('generic');
  });
});

describe('cliente do cadastro', () => {
  test('getHostProfile devolve null quando o usuário ainda não começou', async () => {
    mockedGet.mockRejectedValueOnce(apiError(404, 'NOT_FOUND'));
    await expect(getHostProfile()).resolves.toBeNull();
  });

  test('getHostProfile devolve o cadastro e repassa os outros erros', async () => {
    mockedGet.mockResolvedValueOnce({ data: PROFILE });
    await expect(getHostProfile()).resolves.toEqual(PROFILE);
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/me/host');

    const failure = apiError(404, 'USER_NOT_FOUND');
    mockedGet.mockRejectedValueOnce(failure);
    await expect(getHostProfile()).rejects.toBe(failure);
    mockedGet.mockRejectedValueOnce(networkError());
    await expect(getHostProfile()).rejects.toBeTruthy();
  });

  test('foto sobe em multipart com o campo file e informa o progresso', async () => {
    mockedPost.mockImplementation(async (_url, _form, config) => {
      config.onUploadProgress({ loaded: 50, total: 200 });
      config.onUploadProgress({ loaded: 200, total: 200 });
      config.onUploadProgress({ loaded: 10 });
      return { data: { id: 'p1' } };
    });
    const progress: number[] = [];
    await expect(
      uploadHostPhoto({ uri: 'file:///a.jpg', name: 'a.jpg', type: 'image/jpeg' }, (value) =>
        progress.push(value),
      ),
    ).resolves.toEqual({ id: 'p1' });

    const [url, form, config] = mockedPost.mock.calls[0];
    expect(url).toBe('/api/v1/me/host/photos');
    expect(fieldNames(form)).toEqual(['file']);
    expect(config.timeout).toBeGreaterThan(15000);
    // sem total conhecido, o progresso não é informado
    expect(progress).toEqual([25, 100]);
  });

  test('documento leva o tipo antes do arquivo', async () => {
    mockedPost.mockResolvedValue({ data: { id: 'd1' } });
    await uploadHostDocument('identity', {
      uri: 'file:///rg.pdf',
      name: 'rg.pdf',
      type: 'application/pdf',
    });
    const [url, form] = mockedPost.mock.calls[0];
    expect(url).toBe('/api/v1/me/host/documents');
    // o back-end lê o tipo e depois o arquivo
    expect(fieldNames(form)).toEqual(['type', 'file']);
    expect(form.get('type')).toBe('identity');
  });
});

describe('conversão do cadastro', () => {
  const FILLED = {
    ...EMPTY_HOST_REGISTRATION,
    description: '  Casa com quintal.  ',
    capacity: '3',
    acceptedSpecies: ['dog' as const],
    acceptedSizes: ['small' as const, 'large' as const],
    zipCode: '04538-132',
    street: ' Rua Joaquim Floriano ',
    number: '733',
    complement: '   ',
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'sp',
    cpfCnpj: VALID_CPF,
    coverPhoto: 'file:///capa.jpg',
    roomPhotos: { yard: 'file:///quintal.jpg', living_room: 'file:///sala.jpg' },
    documents: {
      proof_of_address: { uri: 'file:///conta.pdf', name: 'conta.pdf', mimeType: 'application/pdf' },
      identity: { uri: 'file:///rg.png', name: 'rg.png', mimeType: 'image/png' },
    },
  };

  test('rascunho da etapa 1 leva só o espaço', () => {
    expect(buildSpaceDraft(FILLED, 'Ana')).toEqual({
      providerType: 'hotel',
      name: 'Ana',
      description: 'Casa com quintal.',
      capacity: 3,
      acceptedSpecies: ['dog'],
      acceptedSizes: ['small', 'large'],
    });
  });

  test('rascunho completo normaliza endereço e CPF, e omite CPF em branco', () => {
    const full = buildFullDraft(FILLED, 'Ana');
    expect(full.address).toEqual({
      zipCode: '04538132',
      street: 'Rua Joaquim Floriano',
      number: '733',
      complement: null,
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
    });
    expect(full.cpfCnpj).toBe('52998224725');
    expect('cpfCnpj' in buildFullDraft({ ...FILLED, cpfCnpj: '' }, 'Ana')).toBe(false);
  });

  test('fila de envio: capa primeiro, depois cômodos na ordem da tela e documentos', () => {
    expect(buildSubmitItems(FILLED).map((item) => item.key)).toEqual([
      'photo:cover',
      'photo:living_room',
      'photo:yard',
      'doc:identity',
      'doc:proof_of_address',
    ]);
    const identity = buildSubmitItems(FILLED).find((item) => item.key === 'doc:identity');
    expect(identity?.documentType).toBe('identity');
    expect(identity?.file).toEqual({ uri: 'file:///rg.png', name: 'rg.png', type: 'image/png' });
    expect(buildSubmitItems(EMPTY_HOST_REGISTRATION)).toEqual([]);
  });

  test('retoma o rascunho do servidor, ignorando valores desconhecidos', () => {
    const data = profileToRegistration(PROFILE);
    expect(data).toMatchObject({
      status: 'draft',
      description: 'Casa com quintal e muito carinho.',
      capacity: '3',
      acceptedSpecies: ['dog', 'cat'],
      acceptedSizes: ['small'],
      savedCpfCnpj: '***4725',
      serverDocumentTypes: ['identity'],
      zipCode: '04538-132',
      zipLookedUp: '04538132',
      complement: '',
      city: 'São Paulo',
    });
    expect(data.serverPhotos).toHaveLength(1);
    // sem endereço salvo, os campos de endereço não são tocados
    expect('street' in profileToRegistration({ ...PROFILE, address: null })).toBe(false);
  });

  test('retoma na etapa certa', () => {
    expect(resumeRoutes(PROFILE)).toEqual(['/cadastro-host', '/cadastro-host/fotos']);
    expect(resumeRoutes({ ...PROFILE, description: null })).toEqual(['/cadastro-host']);
    expect(resumeRoutes({ ...PROFILE, acceptedSizes: [] })).toEqual(['/cadastro-host']);
    expect(resumeRoutes({ ...PROFILE, validationStatus: 'pending' })).toEqual([
      '/cadastro-host/analise',
    ]);
    expect(resumeRoutes({ ...PROFILE, validationStatus: 'rejected' })).toEqual([
      '/cadastro-host/analise',
    ]);
  });
});

describe('fila de envio', () => {
  const items = buildSubmitItems({
    ...EMPTY_HOST_REGISTRATION,
    coverPhoto: 'file:///capa.jpg',
    roomPhotos: { living_room: 'file:///sala.jpg' },
    documents: { identity: { uri: 'file:///rg.pdf', name: 'rg.pdf', mimeType: 'application/pdf' } },
  });
  const draft = buildSpaceDraft(
    { ...EMPTY_HOST_REGISTRATION, description: 'd', capacity: '2', acceptedSpecies: ['dog'], acceptedSizes: ['small'] },
    'Ana',
  );

  function callbacks() {
    return {
      onStage: jest.fn(),
      onItem: jest.fn(),
      onUploaded: jest.fn(),
    };
  }

  test('salva, sobe cada arquivo em ordem e submete', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockResolvedValue({ data: { id: 'x' } });
    const cb = callbacks();

    await expect(submitHostRegistration({ draft, items, uploaded: {}, callbacks: cb })).resolves.toEqual({
      ok: true,
    });

    expect(mockedPut).toHaveBeenCalledWith('/api/v1/me/host', draft);
    expect(mockedPost.mock.calls.map((call) => call[0])).toEqual([
      '/api/v1/me/host/photos',
      '/api/v1/me/host/photos',
      '/api/v1/me/host/documents',
      '/api/v1/me/host/submit',
    ]);
    expect(cb.onStage.mock.calls.map((call) => call[0])).toEqual(['draft', 'upload', 'submit']);
    expect(cb.onUploaded).toHaveBeenCalledTimes(3);
  });

  test('falha de upload para na hora, aponta o arquivo e não submete', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost
      .mockResolvedValueOnce({ data: { id: 'p1' } })
      .mockRejectedValueOnce(apiError(503, 'STORAGE_UNAVAILABLE'));
    const cb = callbacks();

    const result = await submitHostRegistration({ draft, items, uploaded: {}, callbacks: cb });

    expect(result).toMatchObject({
      ok: false,
      stage: 'upload',
      itemKey: 'photo:living_room',
      error: { kind: 'retry' },
    });
    expect(mockedPost).toHaveBeenCalledTimes(2);
    expect(cb.onItem).toHaveBeenCalledWith('photo:living_room', { status: 'error', percent: 0 });
  });

  test('nova tentativa pula o que já subiu', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockResolvedValue({ data: { id: 'x' } });
    const uploaded = { [uploadedKey(items[0])]: 'p1', [uploadedKey(items[1])]: 'p2' };

    await submitHostRegistration({ draft, items, uploaded, callbacks: callbacks() });

    expect(mockedPost.mock.calls.map((call) => call[0])).toEqual([
      '/api/v1/me/host/documents',
      '/api/v1/me/host/submit',
    ]);
  });

  test('trocar o arquivo do campo exige enviar de novo', async () => {
    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockResolvedValue({ data: { id: 'x' } });
    // a marca é da foto antiga da capa
    const uploaded = { 'photo:cover|file:///outra-capa.jpg': 'p1' };

    await submitHostRegistration({ draft, items, uploaded, callbacks: callbacks() });

    expect(mockedPost.mock.calls.filter((call) => call[0].endsWith('/photos'))).toHaveLength(2);
  });

  test('erro ao salvar o rascunho ou ao submeter é devolvido com a fase', async () => {
    mockedPut.mockRejectedValueOnce(networkError());
    await expect(
      submitHostRegistration({ draft, items, uploaded: {}, callbacks: callbacks() }),
    ).resolves.toMatchObject({ ok: false, stage: 'draft', error: { kind: 'network' } });
    expect(mockedPost).not.toHaveBeenCalled();

    mockedPut.mockResolvedValue({ data: {} });
    mockedPost.mockImplementation((url: string) =>
      url.endsWith('/submit')
        ? Promise.reject(apiError(400, 'VALIDATION_ERROR', [{ field: 'capacity', message: 'obrigatório' }]))
        : Promise.resolve({ data: { id: 'x' } }),
    );
    await expect(
      submitHostRegistration({ draft, items, uploaded: {}, callbacks: callbacks() }),
    ).resolves.toMatchObject({ ok: false, stage: 'submit', error: { kind: 'fields' } });
  });
});
