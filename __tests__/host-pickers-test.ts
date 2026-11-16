import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { DocumentTooLargeError, pickDocument } from '../src/services/document-picker';
import { PhotoTooLargeError, pickPhoto } from '../src/services/photo-picker';
import { lookupZipCode, ZipCodeNotFoundError } from '../src/services/zip-code';
import { formatZipCode } from '../src/utils/formatZipCode';

const mockGet = jest.fn();
jest.mock('axios', () => ({ create: () => ({ get: (...args: unknown[]) => mockGet(...args) }) }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

const launchImage = ImagePicker.launchImageLibraryAsync as jest.Mock;
const getDocument = DocumentPicker.getDocumentAsync as jest.Mock;
const MB = 1024 * 1024;

describe('lookupZipCode', () => {
  test('mapeia a resposta do ViaCEP e consulta só com dígitos', async () => {
    mockGet.mockResolvedValue({
      data: { logradouro: 'Rua X', bairro: 'Centro', localidade: 'Maringá', uf: 'pr' },
    });
    await expect(lookupZipCode('87020-025')).resolves.toEqual({
      street: 'Rua X',
      neighborhood: 'Centro',
      city: 'Maringá',
      state: 'PR',
    });
    expect(mockGet).toHaveBeenCalledWith('/87020025/json/');
  });

  test('CEP inexistente (erro: true) vira ZipCodeNotFoundError', async () => {
    mockGet.mockResolvedValue({ data: { erro: true } });
    await expect(lookupZipCode('99999999')).rejects.toBeInstanceOf(ZipCodeNotFoundError);
  });

  test('não consulta com CEP de tamanho errado nem com texto no meio', async () => {
    mockGet.mockClear();
    await expect(lookupZipCode('123')).rejects.toBeInstanceOf(ZipCodeNotFoundError);
    await expect(lookupZipCode('../../etc')).rejects.toBeInstanceOf(ZipCodeNotFoundError);
    expect(mockGet).not.toHaveBeenCalled();
  });

  test('resposta sem cidade ou UF é inválida, não vira "não encontrado"', async () => {
    mockGet.mockResolvedValue({ data: { logradouro: 'Rua X', localidade: '', uf: '' } });
    await expect(lookupZipCode('87020025')).rejects.toThrow('Resposta de CEP inválida');
    mockGet.mockResolvedValue({ data: null });
    await expect(lookupZipCode('87020025')).rejects.toThrow('Resposta de CEP inválida');
  });
});

describe('pickPhoto', () => {
  test('devolve a foto, null ao cancelar e recusa acima de 5 MB', async () => {
    launchImage.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///a.jpg', fileSize: 1000 }] });
    await expect(pickPhoto()).resolves.toBe('file:///a.jpg');

    launchImage.mockResolvedValueOnce({ canceled: true, assets: null });
    await expect(pickPhoto()).resolves.toBeNull();

    launchImage.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///b.jpg', fileSize: 5 * MB + 1 }],
    });
    await expect(pickPhoto()).rejects.toBeInstanceOf(PhotoTooLargeError);

    // exatamente 5 MB e tamanho desconhecido passam
    launchImage.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///c.jpg', fileSize: 5 * MB }] });
    await expect(pickPhoto()).resolves.toBe('file:///c.jpg');
    launchImage.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///d.jpg' }] });
    await expect(pickPhoto()).resolves.toBe('file:///d.jpg');
  });
});

describe('pickDocument', () => {
  test('aceita só PDF, JPEG e PNG, devolve o arquivo e recusa acima de 10 MB', async () => {
    getDocument.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///rg.pdf', name: 'rg.pdf', mimeType: 'application/pdf', size: 1000 }],
    });
    await expect(pickDocument()).resolves.toEqual({
      uri: 'file:///rg.pdf',
      name: 'rg.pdf',
      mimeType: 'application/pdf',
    });
    expect(getDocument).toHaveBeenCalledWith({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });

    getDocument.mockResolvedValueOnce({ canceled: true, assets: null });
    await expect(pickDocument()).resolves.toBeNull();

    getDocument.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///g.pdf', name: 'g.pdf', mimeType: 'application/pdf', size: 10 * MB + 1 }],
    });
    await expect(pickDocument()).rejects.toBeInstanceOf(DocumentTooLargeError);

    // sem tipo informado, segue com um tipo genérico (o back-end confere pelo conteúdo)
    getDocument.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///h', name: 'h' }] });
    await expect(pickDocument()).resolves.toMatchObject({ mimeType: 'application/octet-stream' });
  });
});

describe('formatZipCode', () => {
  test('aplica a máscara e limita a 8 dígitos', () => {
    expect(formatZipCode('0453')).toBe('0453');
    expect(formatZipCode('045381')).toBe('04538-1');
    expect(formatZipCode('04538-132999')).toBe('04538-132');
    expect(formatZipCode('abc04538132')).toBe('04538-132');
  });
});
