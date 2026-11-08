import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { DocumentRow } from '../../components/DocumentRow';
import { ErrorModal } from '../../components/ErrorModal';
import { FieldError } from '../../components/FieldError';
import { FormField } from '../../components/FormField';
import { HostFormHeader } from '../../components/HostFormHeader';
import { HostTermsNote } from '../../components/HostTermsNote';
import { Icon } from '../../components/Icon';
import { OutlineButton } from '../../components/OutlineButton';
import { PhotoTile } from '../../components/PhotoTile';
import { ProgressRow, UploadProgressModal } from '../../components/UploadProgressModal';
import {
  DOCUMENT_LABELS,
  HostDocumentType,
  ROOMS,
  RoomKey,
} from '../../constants/hostRegistration';
import { theme } from '../../constants/theme';
import { useHostRegistration } from '../../context/HostRegistrationContext';
import { useSession } from '../../context/SessionContext';
import { DocumentTooLargeError, pickDocument } from '../../services/document-picker';
import { HostError } from '../../services/host-registration';
import { ItemProgress, SubmitResult, submitHostRegistration } from '../../services/host-submission';
import { PhotoTooLargeError, pickPhoto } from '../../services/photo-picker';
import { lookupZipCode, ZipCodeNotFoundError } from '../../services/zip-code';
import { formatCpfCnpj } from '../../utils/cpfCnpj';
import { formatZipCode, onlyDigits } from '../../utils/formatZipCode';
import {
  buildFullDraft,
  buildSubmitItems,
  needsCnpjCard,
  SubmitItem,
} from '../../utils/hostRegistrationMapping';
import { stepOfErrors, toFieldErrors } from '../../utils/hostServerErrors';
import {
  HostDocumentsErrors,
  HostLocationErrors,
  hasHostErrors,
  validateHostDocuments,
  validateHostLocation,
} from '../../utils/validateHostRegistration';

type FormErrors = HostLocationErrors & HostDocumentsErrors;

type Problem = {
  title: string;
  message: string;
};

// O que a janela de envio mostra: uma linha por fase e por arquivo
type ProgressState = {
  rows: ProgressRow[];
  message: string | null;
  canRetry: boolean;
};

const DRAFT_ROW = 'draft';
const SUBMIT_ROW = 'submit';

function toRowStatus(status: ItemProgress['status']): ProgressRow['status'] {
  return status === 'uploading' ? 'active' : status;
}

// Texto e possibilidade de repetir para cada falha que não é de campo do formulário
function describeFailure(error: HostError): { message: string; canRetry: boolean } {
  switch (error.kind) {
    case 'limit':
      return { message: error.message, canRetry: false };
    case 'retry':
      return {
        message: 'O armazenamento de arquivos não respondeu. Tente de novo.',
        canRetry: true,
      };
    case 'network':
      return {
        message:
          'Sem conexão. Verifique a internet e tente de novo: o que já foi enviado não é repetido.',
        canRetry: true,
      };
    default:
      return {
        message: 'Não foi possível concluir o envio agora. Tente de novo em instantes.',
        canRetry: true,
      };
  }
}

// Etapa 2 do cadastro de Host (#326): fotos, localização, CPF ou CNPJ e documentos.
// "Enviar para análise" salva o rascunho, sobe as fotos e os documentos e submete o cadastro
export default function HostPhotosScreen() {
  const { data, update, clearServerError, reset } = useHostRegistration();
  const { currentUser } = useSession();
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoError, setPhotoError] = useState<string | undefined>();
  const [zipLoading, setZipLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  // Trava contra dois envios ao mesmo tempo
  const submitting = useRef(false);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const streetRef = useRef<TextInputInstance>(null);
  const numberRef = useRef<TextInputInstance>(null);
  const neighborhoodRef = useRef<TextInputInstance>(null);
  // Posição dos cartões de localização e de documentos, para rolar até eles quando faltar algo
  const locationY = useRef(0);
  const documentsY = useRef(0);

  // Erro local (da validação) ou, se não houver, o que o servidor devolveu para o campo
  const errorOf = (field: keyof FormErrors) => errors[field] ?? data.serverErrors[field];

  function clearError(field: keyof FormErrors) {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    clearServerError(field);
  }

  // Abre a galeria e devolve o endereço da foto. Mostra o motivo se a foto não servir
  async function choosePhoto(): Promise<string | null> {
    setPhotoError(undefined);
    try {
      return await pickPhoto();
    } catch (error) {
      setPhotoError(
        error instanceof PhotoTooLargeError
          ? 'A foto pode ter no máximo 5 MB.'
          : 'Não foi possível abrir a galeria. Tente novamente.',
      );
      return null;
    }
  }

  async function handlePickCover() {
    const uri = await choosePhoto();
    if (uri) {
      update({ coverPhoto: uri });
      clearError('coverPhoto');
    }
  }

  async function handlePickRoom(room: RoomKey) {
    const uri = await choosePhoto();
    if (uri) {
      update({ roomPhotos: { ...data.roomPhotos, [room]: uri } });
    }
  }

  function handleRemoveRoom(room: RoomKey) {
    const others = { ...data.roomPhotos };
    delete others[room];
    update({ roomPhotos: others });
  }

  async function handlePickDocument(type: HostDocumentType) {
    try {
      const file = await pickDocument();
      if (file) {
        update({ documents: { ...data.documents, [type]: file } });
        clearError(type);
      }
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [type]:
          error instanceof DocumentTooLargeError
            ? 'O arquivo pode ter no máximo 10 MB.'
            : 'Não foi possível abrir os arquivos. Tente novamente.',
      }));
    }
  }

  function handleRemoveDocument(type: HostDocumentType) {
    const others = { ...data.documents };
    delete others[type];
    update({ documents: others });
  }

  async function handleSearchZip() {
    if (zipLoading) {
      return;
    }
    const digits = onlyDigits(data.zipCode);
    if (digits.length !== 8) {
      setErrors((current) => ({ ...current, zipCode: 'Informe um CEP com 8 dígitos.' }));
      return;
    }

    setZipLoading(true);
    setErrors((current) => ({ ...current, zipCode: undefined }));
    clearServerError('zipCode');
    try {
      const found = await lookupZipCode(digits);
      update({
        zipLookedUp: digits,
        street: found.street,
        neighborhood: found.neighborhood,
        // Sem bairro no CEP, o Host preenche o campo
        neighborhoodManual: found.neighborhood === '',
        city: found.city,
        state: found.state,
      });
      setErrors((current) => ({
        ...current,
        zipCode: undefined,
        street: undefined,
        neighborhood: undefined,
      }));
    } catch (error) {
      const message =
        error instanceof ZipCodeNotFoundError
          ? 'CEP não encontrado. Confira os números.'
          : 'Não foi possível buscar o CEP agora. Tente novamente.';
      setErrors((current) => ({ ...current, zipCode: message }));
    } finally {
      setZipLoading(false);
    }
  }

  function focusFirstError(fields: Record<string, string | undefined>) {
    if (fields.coverPhoto) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (fields.zipCode) {
      scrollRef.current?.scrollTo({ y: locationY.current, animated: true });
    } else if (fields.street) {
      streetRef.current?.focus();
    } else if (fields.number) {
      numberRef.current?.focus();
    } else if (fields.neighborhood) {
      neighborhoodRef.current?.focus();
    } else if (fields.complement) {
      scrollRef.current?.scrollTo({ y: locationY.current, animated: true });
    } else if (
      fields.cpfCnpj ||
      fields.identity ||
      fields.proof_of_address ||
      fields.cnpj_card
    ) {
      scrollRef.current?.scrollTo({ y: documentsY.current, animated: true });
    }
  }

  function patchRow(key: string, changes: Partial<ProgressRow>) {
    setProgress((current) =>
      current
        ? {
            ...current,
            rows: current.rows.map((row) => (row.key === key ? { ...row, ...changes } : row)),
          }
        : current,
    );
  }

  // Trata a falha do envio: corrige campos na etapa certa, ou mostra o motivo na janela de envio
  function handleFailure(result: Extract<SubmitResult, { ok: false }>) {
    const { stage, error, itemKey } = result;
    const failedRow =
      stage === 'draft' ? DRAFT_ROW : stage === 'upload' && itemKey ? itemKey : SUBMIT_ROW;
    patchRow(failedRow, { status: 'error' });

    if (error.kind === 'session-expired') {
      // O cliente da API já levou ao login
      setProgress(null);
      return;
    }

    if (error.kind === 'already-submitted') {
      setProgress(null);
      update({ status: 'pending' });
      router.replace('/cadastro-host/analise');
      return;
    }

    if (error.kind === 'fields') {
      if (stage === 'upload') {
        // Arquivo recusado pelo servidor (tamanho ou tipo): repetir não adianta, é preciso trocar o arquivo
        setProgress((current) =>
          current
            ? { ...current, message: error.details[0]?.message ?? null, canRetry: false }
            : current,
        );
        return;
      }
      const serverErrors = toFieldErrors(error.details);
      if (Object.keys(serverErrors).length > 0) {
        setProgress(null);
        update({ serverErrors: { ...data.serverErrors, ...serverErrors } });
        if (stepOfErrors(serverErrors) === 1) {
          router.dismissTo('/cadastro-host');
        } else {
          focusFirstError(serverErrors);
        }
        return;
      }
    }

    const { message, canRetry } = describeFailure(error);
    setProgress((current) => (current ? { ...current, message, canRetry } : current));
  }

  async function runSubmission() {
    if (submitting.current) {
      return;
    }

    // O nome do Host é o do cadastro da conta
    const name = currentUser?.user?.name;
    if (!name) {
      setProblem({
        title: 'Sessão indisponível',
        message: 'Não foi possível identificar sua conta. Entre novamente e tente de novo.',
      });
      return;
    }

    const items: SubmitItem[] = buildSubmitItems(data);
    let uploaded = { ...data.uploaded };
    setProgress({
      rows: [
        { key: DRAFT_ROW, label: 'Salvando seus dados', status: 'waiting' },
        ...items.map((item): ProgressRow => ({ key: item.key, label: item.label, status: 'waiting' })),
        { key: SUBMIT_ROW, label: 'Enviando para análise', status: 'waiting' },
      ],
      message: null,
      canRetry: false,
    });

    submitting.current = true;
    const result = await submitHostRegistration({
      draft: buildFullDraft(data, name),
      items,
      uploaded,
      callbacks: {
        onStage: (stage) => {
          if (stage === 'draft') {
            patchRow(DRAFT_ROW, { status: 'active' });
          } else if (stage === 'upload') {
            patchRow(DRAFT_ROW, { status: 'done' });
          } else {
            patchRow(SUBMIT_ROW, { status: 'active' });
          }
        },
        onItem: (itemKey, itemProgress) =>
          patchRow(itemKey, {
            status: toRowStatus(itemProgress.status),
            percent: itemProgress.percent,
          }),
        onUploaded: (doneKey, serverId) => {
          uploaded = { ...uploaded, [doneKey]: serverId };
          update({ uploaded });
        },
      },
    });
    submitting.current = false;

    if (result.ok) {
      patchRow(SUBMIT_ROW, { status: 'done' });
      setProgress(null);
      // Enviado: CPF, endereço, fotos e documentos saem da memória. A tela de análise só precisa da situação
      reset();
      update({ status: 'pending' });
      router.push('/cadastro-host/analise');
      return;
    }
    handleFailure(result);
  }

  function handleSubmit() {
    if (submitting.current) {
      return;
    }

    // Confere tudo de uma vez, para a tela mostrar todos os erros juntos
    const formErrors: FormErrors = {
      ...validateHostLocation({
        coverPhoto: data.coverPhoto,
        hasServerPhotos: data.serverPhotos.length > 0,
        zipCode: data.zipCode,
        zipLookedUp: data.zipLookedUp,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
      }),
      ...validateHostDocuments({
        cpfCnpj: data.cpfCnpj,
        hasSavedCpfCnpj: data.savedCpfCnpj !== null,
        hasDocument: {
          identity: hasDocument('identity'),
          proof_of_address: hasDocument('proof_of_address'),
          cnpj_card: hasDocument('cnpj_card'),
        },
      }),
    };
    setErrors(formErrors);

    if (hasHostErrors(formErrors)) {
      focusFirstError(formErrors);
      return;
    }
    runSubmission();
  }

  // O documento existe se foi escolhido agora ou se o servidor já o tem
  function hasDocument(type: HostDocumentType): boolean {
    return Boolean(data.documents[type]) || data.serverDocumentTypes.includes(type);
  }

  const cityAndState = data.city ? `${data.city} - ${data.state}` : '';
  const showCnpjCard =
    needsCnpjCard(data.cpfCnpj) ||
    data.serverDocumentTypes.includes('cnpj_card') ||
    Boolean(errorOf('cnpj_card'));
  const documentTypes: HostDocumentType[] = showCnpjCard
    ? ['identity', 'proof_of_address', 'cnpj_card']
    : ['identity', 'proof_of_address'];

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        <HostFormHeader onBack={() => router.back()} />

        <Text style={styles.sectionTitle}>Fotos do seu espaço</Text>
        <View
          style={[
            styles.coverBox,
            errorOf('coverPhoto') || photoError ? styles.coverBoxError : null,
          ]}
        >
          {data.coverPhoto ? (
            <Image
              accessibilityLabel="Foto principal do espaço"
              source={{ uri: data.coverPhoto }}
              style={styles.coverImage}
            />
          ) : (
            <>
              <View style={styles.coverIcon}>
                <Icon color={theme.colors.button} name="add_a_photo" size={theme.icon.large} />
              </View>
              <Text style={styles.coverLabel}>Foto principal (Capa)</Text>
            </>
          )}
          <View style={styles.coverButton}>
            <OutlineButton
              icon="upload"
              onPress={handlePickCover}
              title={data.coverPhoto ? 'Trocar foto' : 'Enviar Foto'}
            />
          </View>
        </View>
        <FieldError message={errorOf('coverPhoto') ?? photoError} />

        {data.serverPhotos.length > 0 ? (
          <View style={styles.sentPhotos}>
            <Text style={styles.sentPhotosLabel}>
              {data.serverPhotos.length === 1
                ? '1 foto já enviada'
                : `${data.serverPhotos.length} fotos já enviadas`}
            </Text>
            <View style={styles.sentPhotosRow}>
              {data.serverPhotos.map((photo) => (
                <Image
                  accessibilityLabel="Foto já enviada"
                  key={photo.id}
                  source={{ uri: photo.url }}
                  style={styles.sentPhoto}
                />
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Foto dos Cômodos</Text>
        <View style={styles.roomsRow}>
          {ROOMS.map((room) => (
            <PhotoTile
              key={room.key}
              label={room.label}
              onPick={() => handlePickRoom(room.key)}
              onRemove={() => handleRemoveRoom(room.key)}
              uri={data.roomPhotos[room.key]}
            />
          ))}
        </View>

        <View
          onLayout={(event) => {
            locationY.current = event.nativeEvent.layout.y;
          }}
          style={styles.card}
        >
          <Text accessibilityRole="header" style={styles.cardTitle}>
            Localização do Espaço
          </Text>

          <Text style={styles.fieldLabel}>CEP</Text>
          <View style={styles.zipRow}>
            <View style={[styles.zipInputBox, errorOf('zipCode') ? styles.zipInputBoxError : null]}>
              <Icon color={theme.colors.placeholder} name="location_on" size={theme.icon.medium} />
              <TextInput
                accessibilityHint={errorOf('zipCode')}
                accessibilityLabel="CEP"
                keyboardType="number-pad"
                maxLength={9}
                onChangeText={(text) => {
                  update({ zipCode: formatZipCode(text) });
                  clearError('zipCode');
                }}
                onSubmitEditing={handleSearchZip}
                placeholder="00000-000"
                placeholderTextColor={theme.colors.placeholder}
                returnKeyType="search"
                style={styles.zipInput}
                value={data.zipCode}
              />
            </View>
            <TouchableOpacity
              accessibilityLabel="Buscar CEP"
              accessibilityRole="button"
              accessibilityState={{ busy: zipLoading, disabled: zipLoading }}
              disabled={zipLoading}
              onPress={handleSearchZip}
              style={styles.searchButton}
            >
              {zipLoading ? (
                <ActivityIndicator color={theme.colors.button} />
              ) : (
                <>
                  <Icon color={theme.colors.button} name="search" size={theme.icon.medium} />
                  <Text style={styles.searchText}>Buscar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <FieldError message={errorOf('zipCode')} />

          <View style={styles.row}>
            <View style={styles.streetColumn}>
              <FormField
                autoComplete="street-address"
                error={errorOf('street')}
                inputRef={streetRef}
                label="Rua / Logradouro"
                maxLength={255}
                onChangeText={(text) => {
                  update({ street: text });
                  clearError('street');
                }}
                onSubmitEditing={() => numberRef.current?.focus()}
                placeholder="Rua, avenida..."
                returnKeyType="next"
                value={data.street}
              />
            </View>
            <View style={styles.numberColumn}>
              <FormField
                error={errorOf('number')}
                inputRef={numberRef}
                label="Número"
                maxLength={20}
                onChangeText={(text) => {
                  update({ number: text });
                  clearError('number');
                }}
                placeholder="Nº"
                value={data.number}
              />
            </View>
          </View>

          <View style={styles.fieldSpace}>
            <FormField
              error={errorOf('complement')}
              label="Complemento"
              labelHint="(Opcional)"
              maxLength={100}
              onChangeText={(text) => {
                update({ complement: text });
                clearError('complement');
              }}
              placeholder="Apto, bloco, casa..."
              value={data.complement}
            />
          </View>

          <View style={[styles.row, styles.fieldSpace]}>
            <View style={styles.halfColumn}>
              <FormField
                error={errorOf('neighborhood')}
                inputRef={neighborhoodRef}
                label="Bairro"
                maxLength={100}
                onChangeText={(text) => {
                  update({ neighborhood: text });
                  clearError('neighborhood');
                }}
                placeholder="Preenchido pelo CEP"
                readOnly={!data.neighborhoodManual}
                value={data.neighborhood}
              />
            </View>
            <View style={styles.halfColumn}>
              <FormField
                label="Cidade / UF"
                placeholder="Preenchido pelo CEP"
                readOnly
                value={cityAndState}
              />
            </View>
          </View>

          <View style={styles.map}>
            <Icon color={theme.colors.button} name="location_on" size={theme.icon.huge} />
            <View style={styles.mapNote}>
              <Text style={styles.mapNoteText}>
                Apenas bairro e raio aproximado (500m) aparecem na busca
              </Text>
            </View>
          </View>
        </View>

        <View
          onLayout={(event) => {
            documentsY.current = event.nativeEvent.layout.y;
          }}
          style={styles.card}
        >
          <Text accessibilityRole="header" style={styles.cardTitle}>
            Identificação e Documentos
          </Text>
          <Text style={styles.cardHint}>
            Usamos estes dados só para validar o seu cadastro. Eles não aparecem para os tutores.
          </Text>

          <FormField
            error={errorOf('cpfCnpj')}
            keyboardType="number-pad"
            label="CPF ou CNPJ"
            maxLength={18}
            onChangeText={(text) => {
              update({ cpfCnpj: formatCpfCnpj(text) });
              clearError('cpfCnpj');
            }}
            placeholder={
              data.savedCpfCnpj
                ? `Já informado (${data.savedCpfCnpj}). Deixe em branco para manter.`
                : '000.000.000-00'
            }
            value={data.cpfCnpj}
          />

          <View style={styles.documents}>
            {documentTypes.map((type) => (
              <DocumentRow
                alreadySent={data.serverDocumentTypes.includes(type)}
                error={errorOf(type)}
                fileName={data.documents[type]?.name}
                key={type}
                label={DOCUMENT_LABELS[type]}
                onPick={() => handlePickDocument(type)}
                onRemove={() => handleRemoveDocument(type)}
              />
            ))}
          </View>
        </View>

        <Button onPress={handleSubmit} title="Enviar para análise" />
        <HostTermsNote />
      </ScrollView>

      <UploadProgressModal
        canRetry={progress?.canRetry}
        message={progress?.message}
        onClose={() => setProgress(null)}
        onRetry={runSubmission}
        rows={progress?.rows ?? []}
        visible={progress !== null}
      />
      <ErrorModal
        message={problem ? problem.message : ''}
        onClose={() => setProblem(null)}
        title={problem ? problem.title : ''}
        visible={problem !== null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    padding: theme.spacing.page,
    paddingBottom: theme.spacing.page * 2,
  },
  sectionTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.medium,
    marginTop: theme.spacing.page,
  },
  coverBox: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.card,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: theme.spacing.large,
  },
  coverBoxError: {
    borderColor: theme.colors.error,
  },
  coverImage: {
    borderRadius: theme.radius.input,
    height: theme.spacing.coverHeight,
    width: '100%',
  },
  coverIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.round,
    boxShadow: theme.shadow.soft,
    height: theme.spacing.serviceIcon + theme.spacing.large,
    justifyContent: 'center',
    width: theme.spacing.serviceIcon + theme.spacing.large,
  },
  coverLabel: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.medium,
  },
  coverButton: {
    alignSelf: 'stretch',
    paddingHorizontal: theme.spacing.page,
  },
  sentPhotos: {
    marginTop: theme.spacing.medium,
  },
  sentPhotosLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  sentPhotosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
    marginTop: theme.spacing.small,
  },
  sentPhoto: {
    borderRadius: theme.radius.input,
    height: theme.spacing.galleryThumb,
    width: theme.spacing.galleryThumb,
  },
  roomsRow: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.soft,
    marginTop: theme.spacing.page,
    padding: theme.spacing.large,
  },
  cardTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.userName,
    marginBottom: theme.spacing.large,
  },
  cardHint: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginBottom: theme.spacing.large,
    marginTop: -theme.spacing.medium,
  },
  documents: {
    gap: theme.spacing.medium,
    marginTop: theme.spacing.large,
  },
  fieldLabel: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    marginBottom: theme.spacing.tiny,
  },
  zipRow: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  zipInputBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.small,
    minHeight: theme.spacing.footer,
    paddingHorizontal: theme.spacing.input,
  },
  zipInputBoxError: {
    borderColor: theme.colors.error,
  },
  zipInput: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.button,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.tiny,
    justifyContent: 'center',
    minHeight: theme.spacing.footer,
    minWidth: theme.spacing.footer + theme.spacing.page,
    paddingHorizontal: theme.spacing.medium,
  },
  searchText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.body,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
    marginTop: theme.spacing.large,
  },
  streetColumn: {
    flex: 2,
  },
  numberColumn: {
    flex: 1,
  },
  halfColumn: {
    flex: 1,
  },
  fieldSpace: {
    marginTop: theme.spacing.large,
  },
  map: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.input,
    height: theme.spacing.mapHeight,
    justifyContent: 'center',
    marginTop: theme.spacing.large,
    overflow: 'hidden',
  },
  mapNote: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.round,
    bottom: theme.spacing.small,
    left: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.tiny,
    position: 'absolute',
    right: theme.spacing.small,
  },
  mapNoteText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    textAlign: 'center',
  },
});
