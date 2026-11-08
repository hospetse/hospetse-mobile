import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
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
import { ErrorModal } from '../../components/ErrorModal';
import { FieldError } from '../../components/FieldError';
import { FormField } from '../../components/FormField';
import { HostFormHeader } from '../../components/HostFormHeader';
import { HostTermsNote } from '../../components/HostTermsNote';
import { Icon } from '../../components/Icon';
import { OptionCard } from '../../components/OptionCard';
import { SwitchRow } from '../../components/SwitchRow';
import {
  CAPACITY_MAX,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  EXPERIENCES,
  PET_SPECIES_OPTIONS,
  PetSpecies,
  SIZE_HINTS,
  SPACE_STRUCTURES,
} from '../../constants/hostRegistration';
import { PET_SIZES, PetSize } from '../../constants/search';
import { theme } from '../../constants/theme';
import { useHostRegistration } from '../../context/HostRegistrationContext';
import { useSession } from '../../context/SessionContext';
import { saveHostDraft, toHostError } from '../../services/host-registration';
import { buildSpaceDraft } from '../../utils/hostRegistrationMapping';
import { toFieldErrors } from '../../utils/hostServerErrors';
import {
  HostSpaceErrors,
  hasHostErrors,
  validateHostSpace,
} from '../../utils/validateHostRegistration';

type Problem = {
  title: string;
  message: string;
};

// Etapa 1 do cadastro de Host (#326): estrutura do espaço, espécies e portes aceitos, capacidade,
// experiência e apresentação. Ao avançar, o rascunho é salvo no back-end
export default function HostSpaceScreen() {
  const { data, update, clearServerError } = useHostRegistration();
  const { currentUser } = useSession();
  const [errors, setErrors] = useState<HostSpaceErrors>({});
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const capacityRef = useRef<TextInputInstance>(null);
  const descriptionRef = useRef<TextInputInstance>(null);
  // Posição das seções de espécies e portes na tela, para rolar até elas quando faltar escolher
  const choicesY = useRef(0);

  // Erro local (da validação) ou, se não houver, o que o servidor devolveu para o campo
  const errorOf = (field: keyof HostSpaceErrors) => errors[field] ?? data.serverErrors[field];

  function clearError(field: keyof HostSpaceErrors) {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    clearServerError(field);
  }

  function toggleSize(size: PetSize) {
    const next = data.acceptedSizes.includes(size)
      ? data.acceptedSizes.filter((item) => item !== size)
      : [...data.acceptedSizes, size];
    update({ acceptedSizes: next });
    clearError('acceptedSizes');
  }

  function toggleSpecies(species: PetSpecies) {
    const next = data.acceptedSpecies.includes(species)
      ? data.acceptedSpecies.filter((item) => item !== species)
      : [...data.acceptedSpecies, species];
    update({ acceptedSpecies: next });
    clearError('acceptedSpecies');
  }

  function focusFirstError(fields: Record<string, string | undefined>) {
    if (fields.acceptedSpecies || fields.acceptedSizes) {
      scrollRef.current?.scrollTo({ y: choicesY.current, animated: true });
    } else if (fields.capacity) {
      capacityRef.current?.focus();
    } else if (fields.description) {
      descriptionRef.current?.focus();
    }
  }

  async function handleNext() {
    // Segunda proteção contra envio duplicado (o botão também fica desabilitado)
    if (saving) {
      return;
    }

    // Confere tudo de uma vez, para a tela mostrar todos os erros juntos
    const formErrors = validateHostSpace({
      acceptedSizes: data.acceptedSizes,
      acceptedSpecies: data.acceptedSpecies,
      capacity: data.capacity,
      description: data.description,
    });
    setErrors(formErrors);
    if (hasHostErrors(formErrors)) {
      focusFirstError(formErrors);
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

    setSaving(true);
    try {
      await saveHostDraft(buildSpaceDraft(data, name));
      router.push('/cadastro-host/fotos');
    } catch (error) {
      const hostError = toHostError(error);
      if (hostError.kind === 'session-expired') {
        // O cliente da API já levou ao login
        return;
      }
      if (hostError.kind === 'already-submitted') {
        update({ status: 'pending' });
        router.replace('/cadastro-host/analise');
        return;
      }
      if (hostError.kind === 'fields') {
        const serverErrors = toFieldErrors(hostError.details);
        if (Object.keys(serverErrors).length > 0) {
          update({ serverErrors: { ...data.serverErrors, ...serverErrors } });
          focusFirstError(serverErrors);
          return;
        }
      }
      setProblem({
        title: hostError.kind === 'network' ? 'Sem conexão' : 'Algo deu errado',
        message:
          hostError.kind === 'network'
            ? 'Não foi possível salvar o seu cadastro. Verifique a conexão e tente de novo.'
            : 'Não foi possível salvar o seu cadastro agora. Tente de novo em instantes.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        <HostFormHeader onBack={() => router.back()} />

        <Text style={styles.sectionTitle}>Estrutura do espaço</Text>
        <View style={styles.optionsRow}>
          {SPACE_STRUCTURES.map((item) => (
            <OptionCard
              key={item.value}
              label={item.label}
              onPress={() => update({ structure: item.value })}
              selected={data.structure === item.value}
            />
          ))}
        </View>

        <TouchableOpacity
          accessibilityRole="checkbox"
          accessibilityState={{ checked: data.hasOtherPets }}
          hitSlop={theme.spacing.medium}
          onPress={() => update({ hasOtherPets: !data.hasOtherPets })}
          style={styles.checkRow}
        >
          <View style={[styles.checkbox, data.hasOtherPets ? styles.checkboxChecked : null]}>
            {data.hasOtherPets ? (
              <Icon color={theme.colors.white} name="check" size={theme.icon.small} />
            ) : null}
          </View>
          <Text style={styles.checkLabel}>Há outros pets na residência</Text>
        </TouchableOpacity>

        <View
          onLayout={(event) => {
            choicesY.current = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionTitle}>Espécies aceitas em seu espaço</Text>
          <View style={styles.optionsRow}>
            {PET_SPECIES_OPTIONS.map((item) => (
              <OptionCard
                key={item.value}
                label={item.label}
                onPress={() => toggleSpecies(item.value)}
                role="checkbox"
                selected={data.acceptedSpecies.includes(item.value)}
              />
            ))}
          </View>
          <FieldError message={errorOf('acceptedSpecies')} />

          <Text style={styles.sectionTitle}>Portes Aceitos em seu espaço</Text>
          <View style={styles.optionsRow}>
            {PET_SIZES.map((size) => (
              <OptionCard
                key={size.value}
                hint={SIZE_HINTS[size.value]}
                label={size.label}
                onPress={() => toggleSize(size.value)}
                role="checkbox"
                selected={data.acceptedSizes.includes(size.value)}
              />
            ))}
          </View>
          <FieldError message={errorOf('acceptedSizes')} />
        </View>

        <View style={styles.capacity}>
          <FormField
            error={errorOf('capacity')}
            inputRef={capacityRef}
            keyboardType="number-pad"
            label="Quantos pets você recebe ao mesmo tempo?"
            maxLength={String(CAPACITY_MAX).length}
            onChangeText={(text) => {
              update({ capacity: text.replace(/\D/g, '') });
              clearError('capacity');
            }}
            placeholder="Ex.: 3"
            value={data.capacity}
          />
        </View>

        <Text style={styles.sectionTitle}>Experiência prática com pets</Text>
        <View style={styles.optionsRow}>
          {EXPERIENCES.map((item) => (
            <OptionCard
              key={item.value}
              label={item.label}
              onPress={() => update({ experience: item.value })}
              selected={data.experience === item.value}
            />
          ))}
        </View>

        <View style={styles.switchCard}>
          <SwitchRow
            description="Mais cuidados , rotinas calmas e atenção especial"
            onValueChange={(value) => update({ acceptsSenior: value })}
            title="Aceita animais idosos ou sob medicação?"
            value={data.acceptsSenior}
          />
          <View style={styles.switchDivider} />
          <SwitchRow
            description="Requer mais atenção com marcação de território"
            onValueChange={(value) => update({ acceptsNeutered: value })}
            title="Aceita animais castrados?"
            value={data.acceptsNeutered}
          />
        </View>

        <View style={styles.descriptionHeader}>
          <Text style={styles.descriptionTitle}>Apresentação do Cuidador</Text>
          <Text style={styles.descriptionHint}>Mínimo de {DESCRIPTION_MIN} caracteres</Text>
        </View>
        <View>
          <TextInput
            accessibilityHint={errorOf('description')}
            accessibilityLabel="Apresentação do Cuidador"
            maxLength={DESCRIPTION_MAX}
            multiline
            onChangeText={(text) => {
              update({ description: text });
              clearError('description');
            }}
            placeholder="Conte um pouco sobre você, sua experiência com pets e como é a sua rotina dentro do seu espaço"
            placeholderTextColor={theme.colors.placeholder}
            ref={descriptionRef}
            style={[styles.textArea, errorOf('description') ? styles.textAreaError : null]}
            textAlignVertical="top"
            value={data.description}
          />
          <Text style={styles.counter}>
            {data.description.length}/{DESCRIPTION_MAX}
          </Text>
        </View>
        <FieldError message={errorOf('description')} />

        <Button loading={saving} onPress={handleNext} title="Avançar para fotos e Endereço" />
        <HostTermsNote />
      </ScrollView>

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
  optionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  capacity: {
    marginTop: theme.spacing.page,
  },
  checkRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.small,
    marginTop: theme.spacing.large,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.calendarMark,
    borderWidth: 1,
    height: theme.spacing.checkbox,
    justifyContent: 'center',
    width: theme.spacing.checkbox,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.button,
    borderColor: theme.colors.button,
  },
  checkLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  switchCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.soft,
    marginTop: theme.spacing.page,
    padding: theme.spacing.large,
  },
  switchDivider: {
    backgroundColor: theme.colors.divider,
    height: 1,
    marginVertical: theme.spacing.large,
  },
  descriptionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.medium,
    marginTop: theme.spacing.page,
  },
  descriptionTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  descriptionHint: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.caption,
  },
  textArea: {
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    minHeight: theme.spacing.textAreaHeight,
    padding: theme.spacing.large,
    paddingBottom: theme.spacing.page + theme.spacing.small,
  },
  textAreaError: {
    borderColor: theme.colors.error,
  },
  counter: {
    backgroundColor: theme.colors.iconButton,
    borderRadius: theme.radius.badge,
    bottom: theme.spacing.small,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny / 2,
    position: 'absolute',
    right: theme.spacing.small,
  },
});
