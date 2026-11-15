import {
  HostDraftInput,
  HostError,
  saveHostDraft,
  submitHostProfile,
  toHostError,
  uploadHostDocument,
  uploadHostPhoto,
} from './host-registration';
import { SubmitItem, uploadedKey } from '../utils/hostRegistrationMapping';

// O envio do cadastro tem 3 fases, sempre nesta ordem
export type SubmitStage = 'draft' | 'upload' | 'submit';

export type ItemProgress = {
  status: 'waiting' | 'uploading' | 'done' | 'error';
  percent: number;
};

export type SubmitCallbacks = {
  onStage: (stage: SubmitStage) => void;
  onItem: (itemKey: string, progress: ItemProgress) => void;
  // Um arquivo subiu: guarda o id para não enviar de novo numa nova tentativa
  onUploaded: (doneKey: string, serverId: string) => void;
};

export type SubmitResult =
  | { ok: true }
  | { ok: false; stage: SubmitStage; error: HostError; itemKey?: string };

type SubmitParams = {
  draft: HostDraftInput;
  items: SubmitItem[];
  // Arquivos que já subiram (chave -> id no servidor)
  uploaded: Record<string, string>;
  callbacks: SubmitCallbacks;
};

// Envia o cadastro: salva o rascunho, sobe os arquivos um por vez e submete para validação.
// Para na primeira falha e diz em qual fase e arquivo foi. Chamar de novo continua de onde parou:
// o rascunho é salvo outra vez (idempotente) e os arquivos já enviados são pulados
export async function submitHostRegistration({
  draft,
  items,
  uploaded,
  callbacks,
}: SubmitParams): Promise<SubmitResult> {
  callbacks.onStage('draft');
  try {
    await saveHostDraft(draft);
  } catch (error) {
    return { ok: false, stage: 'draft', error: toHostError(error) };
  }

  callbacks.onStage('upload');
  for (const item of items) {
    const doneKey = uploadedKey(item);
    if (uploaded[doneKey]) {
      callbacks.onItem(item.key, { status: 'done', percent: 100 });
      continue;
    }

    callbacks.onItem(item.key, { status: 'uploading', percent: 0 });
    const onProgress = (percent: number) =>
      callbacks.onItem(item.key, { status: 'uploading', percent });
    try {
      const sent = item.documentType
        ? await uploadHostDocument(item.documentType, item.file, onProgress)
        : await uploadHostPhoto(item.file, onProgress);
      callbacks.onUploaded(doneKey, sent.id);
      callbacks.onItem(item.key, { status: 'done', percent: 100 });
    } catch (error) {
      callbacks.onItem(item.key, { status: 'error', percent: 0 });
      return { ok: false, stage: 'upload', error: toHostError(error), itemKey: item.key };
    }
  }

  callbacks.onStage('submit');
  try {
    await submitHostProfile();
  } catch (error) {
    return { ok: false, stage: 'submit', error: toHostError(error) };
  }
  return { ok: true };
}
