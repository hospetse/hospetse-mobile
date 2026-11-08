import * as ImagePicker from 'expo-image-picker';

import { PHOTO_MAX_BYTES } from '../constants/hostRegistration';

// A foto passa do limite de tamanho do back-end
export class PhotoTooLargeError extends Error {
  constructor() {
    super('PHOTO_TOO_LARGE');
  }
}

// Abre a galeria do aparelho e devolve o endereço local da foto escolhida, ou null se o usuário cancelar.
// A galeria do sistema não pede permissão (docs do Expo SDK 58)
export async function pickPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (asset.fileSize && asset.fileSize > PHOTO_MAX_BYTES) {
    throw new PhotoTooLargeError();
  }
  return asset.uri;
}
