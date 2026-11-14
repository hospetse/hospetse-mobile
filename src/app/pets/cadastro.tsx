import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
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
import { Icon } from '../../components/Icon';
import { PET_SIZE_OPTIONS, PET_SPECIES, PetSpecies } from '../../constants/pets';
import { PetSize } from '../../constants/search';
import { theme } from '../../constants/theme';
import { usePets } from '../../context/PetsContext';
import { PetInput } from '../../services/pets';
import { hasPetErrors, PetFormErrors, PetFormValues, validatePet } from '../../utils/validatePet';

type ApiErrorBody = {
  details?: { field: string; message: string }[];
};

function apiFieldErrors(error: unknown): PetFormErrors {
  if (!axios.isAxiosError(error)) {
    return {};
  }
  const body = (error.response?.data ?? {}) as ApiErrorBody;
  const result: PetFormErrors = {};
  for (const detail of body.details ?? []) {
    if (detail.field in result) {
      continue;
    }
    if (detail.field === 'name') result.name = 'Confira o nome do pet.';
    if (detail.field === 'species') result.species = 'Escolha uma espécie válida.';
    if (detail.field === 'breed') result.breed = 'Confira a raça informada.';
    if (detail.field === 'size') result.size = 'Escolha um porte válido.';
    if (detail.field === 'birthDate') result.birthDate = 'Confira a data de nascimento.';
    if (detail.field === 'medicalNotes') result.medicalNotes = 'Confira as observações médicas.';
    if (detail.field === 'behavioralNotes') result.behavioralNotes = 'Confira as observações comportamentais.';
  }
  return result;
}

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return 'Complete seu perfil de Tutor antes de cadastrar um pet.';
  }
  if (!axios.isAxiosError(error) || !error.response) {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  }
  return 'Não foi possível cadastrar este pet agora. Tente novamente.';
}

export default function PetRegistrationScreen() {
  const { addPet, pets, updatePet } = usePets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingPet = id ? pets.find((pet) => pet.id === id) : undefined;
  const [values, setValues] = useState<PetFormValues>({
    name: '',
    species: null,
    breed: '',
    size: null,
    birthDate: '',
    medicalNotes: '',
    behavioralNotes: '',
  });
  const [errors, setErrors] = useState<PetFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<unknown | null>(null);
  const nameRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (!editingPet) return;
    setValues({
      name: editingPet.name,
      species: editingPet.species,
      breed: editingPet.breed ?? '',
      size: editingPet.size,
      birthDate: editingPet.birthDate ?? '',
      medicalNotes: editingPet.medicalNotes ?? '',
      behavioralNotes: editingPet.behavioralNotes ?? '',
    });
  }, [editingPet]);

  function update(changes: Partial<PetFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
  }

  function clearError(field: keyof PetFormValues) {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function focusFirstError(formErrors: PetFormErrors) {
    if (formErrors.name) {
      nameRef.current?.focus();
    }
  }

  async function handleSave() {
    if (loading) {
      return;
    }

    const formErrors = validatePet(values);
    setErrors(formErrors);
    if (hasPetErrors(formErrors)) {
      focusFirstError(formErrors);
      return;
    }

    const input: PetInput = {
      name: values.name.trim(),
      species: values.species as PetSpecies,
      ...(values.breed.trim() ? { breed: values.breed.trim() } : {}),
      ...(values.size ? { size: values.size as PetSize } : {}),
      ...(values.birthDate.trim() ? { birthDate: values.birthDate.trim() } : {}),
      ...(values.medicalNotes.trim() ? { medicalNotes: values.medicalNotes.trim() } : {}),
      ...(values.behavioralNotes.trim() ? { behavioralNotes: values.behavioralNotes.trim() } : {}),
    };

    setLoading(true);
    try {
      if (editingPet) {
        await updatePet(editingPet.id, input);
      } else {
        await addPet(input);
      }
      router.back();
    } catch (error) {
      const fieldErrors = apiFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        focusFirstError(fieldErrors);
      } else {
        setServerError(error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon color={theme.colors.title} name="arrow_back" size={theme.icon.large} />
          </TouchableOpacity>
          <View style={styles.headerTexts}>
            <Text accessibilityRole="header" style={styles.title}>
              {editingPet ? 'Editar pet' : 'Cadastrar pet'}
            </Text>
            <Text style={styles.subtitle}>Nos conte um pouco sobre seu amigo.</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome do pet</Text>
          <TextInput
            accessibilityHint={errors.name}
            accessibilityLabel="Nome do pet"
            autoCapitalize="words"
            maxLength={255}
            onChangeText={(name) => {
              update({ name });
              clearError('name');
            }}
            placeholder="Ex.: Paçoca"
            placeholderTextColor={theme.colors.placeholder}
            ref={nameRef}
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={values.name}
          />
          <FieldError message={errors.name} />

          <Text style={styles.sectionLabel}>Espécie</Text>
          <View style={styles.optionsRow}>
            {PET_SPECIES.map((item) => {
              const selected = values.species === item.value;
              return (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={item.value}
                  onPress={() => {
                    update({ species: item.value });
                    clearError('species');
                  }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Icon color={selected ? theme.colors.button : theme.colors.placeholder} name="pets" size={theme.icon.medium} />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <FieldError message={errors.species} />

          <Text style={styles.sectionLabel}>Porte (opcional)</Text>
          <View style={styles.optionsRow}>
            {PET_SIZE_OPTIONS.map((item) => {
              const selected = values.size === item.value;
              return (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={item.value}
                  onPress={() => update({ size: selected ? null : item.value })}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <FieldError message={errors.size} />

          <Text style={styles.labelSpaced}>Raça (opcional)</Text>
          <TextInput
            accessibilityHint={errors.breed}
            accessibilityLabel="Raça"
            autoCapitalize="words"
            maxLength={100}
            onChangeText={(breed) => {
              update({ breed });
              clearError('breed');
            }}
            placeholder="Ex.: Vira-lata"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, errors.breed ? styles.inputError : null]}
            value={values.breed}
          />
          <FieldError message={errors.breed} />

          <Text style={styles.labelSpaced}>Data de nascimento (opcional)</Text>
          <TextInput
            accessibilityHint={errors.birthDate}
            accessibilityLabel="Data de nascimento"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onChangeText={(birthDate) => {
              update({ birthDate });
              clearError('birthDate');
            }}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, errors.birthDate ? styles.inputError : null]}
            value={values.birthDate}
          />
          <FieldError message={errors.birthDate} />

          <Text style={styles.labelSpaced}>Cuidados médicos (opcional)</Text>
          <TextInput
            accessibilityHint={errors.medicalNotes}
            accessibilityLabel="Cuidados médicos"
            maxLength={2000}
            multiline
            onChangeText={(medicalNotes) => {
              update({ medicalNotes });
              clearError('medicalNotes');
            }}
            placeholder="Alergias, medicamentos e cuidados importantes"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.textArea, errors.medicalNotes ? styles.inputError : null]}
            textAlignVertical="top"
            value={values.medicalNotes}
          />
          <FieldError message={errors.medicalNotes} />

          <Text style={styles.labelSpaced}>Comportamento e rotina (opcional)</Text>
          <TextInput
            accessibilityHint={errors.behavioralNotes}
            accessibilityLabel="Comportamento e rotina"
            maxLength={2000}
            multiline
            onChangeText={(behavioralNotes) => {
              update({ behavioralNotes });
              clearError('behavioralNotes');
            }}
            placeholder="Conte o que ajuda seu pet a ficar confortável"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.textArea, errors.behavioralNotes ? styles.inputError : null]}
            textAlignVertical="top"
            value={values.behavioralNotes}
          />
          <FieldError message={errors.behavioralNotes} />

          <Button loading={loading} onPress={handleSave} title={editingPet ? 'Salvar alterações' : 'Salvar pet'} />
        </View>
      </ScrollView>

      <ErrorModal
        message={serverError ? errorMessage(serverError) : ''}
        onClose={() => setServerError(null)}
        title="Não foi possível cadastrar"
        visible={serverError !== null}
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
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  backButton: {
    alignItems: 'center',
    height: theme.spacing.bell,
    justifyContent: 'center',
    width: theme.spacing.bell,
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  subtitle: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.tiny,
  },
  form: {
    marginTop: theme.spacing.page,
  },
  label: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    marginBottom: theme.spacing.tiny,
  },
  labelSpaced: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    marginBottom: theme.spacing.tiny,
    marginTop: theme.spacing.large,
  },
  sectionLabel: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    marginBottom: theme.spacing.small,
    marginTop: theme.spacing.large,
  },
  input: {
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    minHeight: theme.spacing.footer,
    paddingHorizontal: theme.spacing.input,
  },
  textArea: {
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    minHeight: 120,
    padding: theme.spacing.input,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
  },
  option: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.small,
    minHeight: theme.spacing.footer,
    paddingHorizontal: theme.spacing.medium,
  },
  optionSelected: {
    backgroundColor: theme.colors.selectedTint,
    borderColor: theme.colors.button,
  },
  optionText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.body,
  },
  optionTextSelected: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
  },
});
