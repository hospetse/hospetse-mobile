import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { ErrorModal } from '../../components/ErrorModal';
import { FieldError } from '../../components/FieldError';
import { FormField } from '../../components/FormField';
import { Icon } from '../../components/Icon';
import { PetOption } from '../../components/PetOption';
import { ServiceDateModal } from '../../components/ServiceDateModal';
import { ServiceRequestSuccess } from '../../components/ServiceRequestSuccess';
import { Skeleton } from '../../components/Skeleton';
import { SwitchRow } from '../../components/SwitchRow';
import { ServiceType } from '../../constants/search';
import { theme } from '../../constants/theme';
import { formatHostLocation, getHostPage, HostDetails, HostNotFoundError } from '../../services/hosts';
import { listMyPets, Pet } from '../../services/pets';
import {
  createServiceRequest,
  newServiceRequestKey,
  ServiceRequest,
} from '../../services/serviceRequests';
import { formatDate, fromIsoDate, toIsoDate } from '../../utils/calendar';
import { formatCurrency } from '../../utils/money';

const TIME_SLOTS = ['08:00', '10:00', '14:00', '16:00', '18:00'];

type ServiceKind = Exclude<ServiceType, 'Pet Hotel'>;
type LoadState = 'loading' | 'ready' | 'not-found' | 'error';
type FormFieldName = 'pet' | 'date' | 'time' | 'address' | 'accessInstructions' | 'medication';
type FormErrors = Partial<Record<FormFieldName, string>>;

type ServiceConfig = {
  title: string;
  description: string;
  price: number;
  offersMedication: boolean;
};

// Preços e oferta de medicação são provisórios até o contrato de serviços ser publicado.
const SERVICE_CONFIG: Record<ServiceKind, ServiceConfig> = {
  'Pet Walker': {
    title: 'Passeio',
    description: 'Um passeio individual para o seu pet, no horário combinado.',
    price: 50,
    offersMedication: false,
  },
  'Pet Sitter': {
    title: 'Visita',
    description: 'Cuidados e companhia para o seu pet no endereço informado.',
    price: 70,
    offersMedication: true,
  },
};

function serviceFromParam(value: string | undefined): ServiceKind {
  return value === 'Pet Walker' ? 'Pet Walker' : 'Pet Sitter';
}

export default function ServiceRequestScreen() {
  const { id, petId, service, checkIn } = useLocalSearchParams<{
    id: string;
    petId?: string;
    service?: string;
    checkIn?: string;
  }>();
  const insets = useSafeAreaInsets();
  const serviceType = serviceFromParam(service);
  const config = SERVICE_CONFIG[serviceType];

  const [provider, setProvider] = useState<HostDetails | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [attempt, setAttempt] = useState(0);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [date, setDate] = useState(fromIsoDate(checkIn));
  const [time, setTime] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [tutorAbsent, setTutorAbsent] = useState(false);
  const [accessInstructions, setAccessInstructions] = useState('');
  const [needsMedication, setNeedsMedication] = useState(false);
  const [medication, setMedication] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDate, setShowDate] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState(false);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const requestKey = useRef<string | null>(null);
  const sendingNow = useRef(false);

  useEffect(() => {
    let active = true;
    setState('loading');
    Promise.all([getHostPage(id), listMyPets()])
      .then(([page, myPets]) => {
        if (!active) {
          return;
        }
        setProvider(page.host);
        setPets(myPets);
        if (petId && myPets.some((pet) => pet.id === petId)) {
          setSelectedPet(petId);
        }
        setState('ready');
      })
      .catch((error) => {
        if (active) {
          setState(error instanceof HostNotFoundError ? 'not-found' : 'error');
        }
      });
    return () => {
      active = false;
    };
  }, [id, petId, attempt]);

  function clearError(field: FormFieldName) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    requestKey.current = null;
  }

  function choosePet(next: string) {
    setSelectedPet(next);
    clearError('pet');
  }

  function chooseDate(next: Date) {
    setDate(next);
    setShowDate(false);
    clearError('date');
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!selectedPet) {
      next.pet = 'Escolha o pet que receberá o serviço.';
    }
    if (!date) {
      next.date = 'Escolha a data do serviço.';
    }
    if (!time) {
      next.time = 'Escolha o horário do serviço.';
    }
    if (!address.trim()) {
      next.address = 'Informe o endereço do serviço.';
    }
    if (tutorAbsent && !accessInstructions.trim()) {
      next.accessInstructions = 'Explique como o prestador poderá entrar.';
    }
    if (config.offersMedication && needsMedication && !medication.trim()) {
      next.medication = 'Descreva o medicamento e como administrá-lo.';
    }
    return next;
  }

  async function handleSubmit() {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (sendingNow.current || Object.keys(nextErrors).length > 0 || !provider || !selectedPet || !date || !time) {
      return;
    }

    const pet = pets.find((item) => item.id === selectedPet);
    if (!pet) {
      return;
    }

    if (!requestKey.current) {
      requestKey.current = newServiceRequestKey();
    }
    sendingNow.current = true;
    setSending(true);
    setFailure(false);
    try {
      const created = await createServiceRequest(
        {
          providerId: provider.id,
          providerName: provider.name,
          providerLocation: formatHostLocation(provider),
          providerPicture: provider.pictureUrl,
          serviceType,
          petId: pet.id,
          petName: pet.name,
          date: toIsoDate(date),
          time,
          address: address.trim(),
          accessInstructions: tutorAbsent ? accessInstructions.trim() : null,
          medication: config.offersMedication && needsMedication ? medication.trim() : null,
          price: config.price,
        },
        requestKey.current,
      );
      setRequest(created);
    } catch {
      setFailure(true);
    } finally {
      sendingNow.current = false;
      setSending(false);
    }
  }

  const backButton = (
    <TouchableOpacity
      accessibilityLabel="Voltar"
      accessibilityRole="button"
      onPress={() => router.back()}
      style={styles.backButton}
    >
      <Icon color={theme.colors.title} name="arrow_back" size={theme.icon.large} />
    </TouchableOpacity>
  );

  if (state === 'loading') {
    return (
      <View accessibilityLabel="Carregando" style={[styles.screen, styles.loading, { paddingTop: insets.top }]}>
        {backButton}
        <Skeleton height={28} width={220} />
        <Skeleton height={80} width="100%" />
        <Skeleton height={220} width="100%" />
      </View>
    );
  }

  if (state !== 'ready' || !provider) {
    return (
      <View style={[styles.screen, styles.message, { paddingTop: insets.top }]}>
        <Text accessibilityRole="header" style={styles.messageTitle}>
          {state === 'not-found' ? 'Prestador não encontrado' : 'Algo deu errado'}
        </Text>
        <Text style={styles.messageText}>
          {state === 'not-found'
            ? 'Esse prestador não está mais disponível.'
            : 'Não foi possível carregar os dados do prestador. Tente de novo.'}
        </Text>
        {state === 'error' ? <Button onPress={() => setAttempt((current) => current + 1)} title="Tentar de novo" /> : null}
        <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.messageLink}>
          <Text style={styles.link}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (request) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ServiceRequestSuccess
          onGoHome={() => router.dismissTo('/home')}
          onSeeReservations={() => router.replace('/minhas-contratacoes')}
          request={request}
        />
      </View>
    );
  }

  const selectedPetName = pets.find((pet) => pet.id === selectedPet)?.name;
  const providerLocation = formatHostLocation(provider);
  const actionTitle = serviceType === 'Pet Walker' ? 'Solicitar passeio' : 'Solicitar visita';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: theme.spacing.footerHeight + insets.bottom + theme.spacing.page }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          {backButton}
          <View style={styles.brand}>
            <Icon color={theme.colors.button} name="pets" size={theme.icon.large} />
            <Text style={styles.brandText}>Hospetse</Text>
          </View>
        </View>

        <Text accessibilityRole="header" style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>

        <View style={styles.providerCard}>
          <View style={styles.providerIcon}><Icon color={theme.colors.button} name="person" size={theme.icon.medium} /></View>
          <View style={styles.providerTexts}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerLocation}>{providerLocation || 'Localização não informada'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Para quem é o serviço?</Text>
        {pets.length > 0 ? (
          <ScrollView accessibilityRole="radiogroup" contentContainerStyle={styles.pets} horizontal showsHorizontalScrollIndicator={false}>
            {pets.map((pet) => (
              <PetOption
                key={pet.id}
                imageUri={null}
                name={pet.name}
                onPress={() => choosePet(pet.id)}
                selected={pet.id === selectedPet}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyPets}>Você ainda não tem pets cadastrados.</Text>
        )}
        <FieldError message={errors.pet} />
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/pets/cadastro')} style={styles.addPet}>
          <Text style={styles.link}>Adicionar Pet</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quando será?</Text>
        <TouchableOpacity
          accessibilityLabel={`Data do serviço, ${date ? formatDate(date) : 'não escolhida'}`}
          accessibilityRole="button"
          onPress={() => setShowDate(true)}
          style={[styles.selectionField, errors.date ? styles.fieldInvalid : null]}
        >
          <View>
            <Text style={styles.selectionLabel}>Data</Text>
            <Text style={[styles.selectionValue, !date && styles.placeholder]}>{date ? formatDate(date) : 'Escolher data'}</Text>
          </View>
          <Icon color={theme.colors.button} name="calendar_month" size={theme.icon.medium} />
        </TouchableOpacity>
        <FieldError message={errors.date} />

        <Text style={styles.subsectionTitle}>Horário</Text>
        <View accessibilityRole="radiogroup" style={styles.timeSlots}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              accessibilityRole="radio"
              accessibilityState={{ selected: slot === time }}
              key={slot}
              onPress={() => {
                setTime(slot);
                clearError('time');
              }}
              style={[styles.timeSlot, slot === time ? styles.timeSlotSelected : null, errors.time ? styles.fieldInvalid : null]}
            >
              <Text style={[styles.timeText, slot === time ? styles.timeTextSelected : null]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FieldError message={errors.time} />

        <Text style={styles.sectionTitle}>Onde será?</Text>
        <FormField
          error={errors.address}
          label="Endereço do serviço"
          multiline
          onChangeText={(value) => {
            setAddress(value);
            clearError('address');
          }}
          placeholder="Rua, número, bairro e cidade"
          style={styles.multilineInput}
          value={address}
        />

        <SwitchRow
          description="Informe os detalhes para o prestador entrar com segurança."
          onValueChange={(value) => {
            setTutorAbsent(value);
            clearError('accessInstructions');
          }}
          title="Estarei ausente"
          value={tutorAbsent}
        />
        {tutorAbsent ? (
          <FormField
            error={errors.accessInstructions}
            label="Instruções de acesso"
            multiline
            onChangeText={(value) => {
              setAccessInstructions(value);
              clearError('accessInstructions');
            }}
            placeholder="Ex.: a chave fica com a portaria"
            style={styles.multilineInput}
            value={accessInstructions}
          />
        ) : null}

        {config.offersMedication ? (
          <View style={styles.medicationSection}>
            <SwitchRow
              description="O prestador informou que pode administrar medicamentos."
              onValueChange={(value) => {
                setNeedsMedication(value);
                clearError('medication');
              }}
              title="Precisa administrar medicamento"
              value={needsMedication}
            />
            {needsMedication ? (
              <FormField
                error={errors.medication}
                label="Medicamento e instruções"
                multiline
                onChangeText={(value) => {
                  setMedication(value);
                  clearError('medication');
                }}
                placeholder="Informe o nome, dose e horário"
                style={styles.multilineInput}
                value={medication}
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumo da solicitação</Text>
          <SummaryRow label="Serviço" value={config.title} />
          <SummaryRow label="Pet" value={selectedPetName ?? 'Escolha um pet'} />
          <SummaryRow label="Data" value={date ? formatDate(date) : 'Escolha uma data'} />
          <SummaryRow label="Horário" value={time ?? 'Escolha um horário'} />
          <SummaryRow label="Endereço" value={address.trim() || 'Informe o endereço'} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(config.price)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.medium }]}>
        <Button loading={sending} onPress={handleSubmit} title={actionTitle} />
      </View>

      <ServiceDateModal
        onClose={() => setShowDate(false)}
        onConfirm={chooseDate}
        selectedDate={date}
        visible={showDate}
      />
      <ErrorModal
        buttonTitle="Fechar"
        message="Não foi possível enviar a solicitação. Tente novamente."
        onClose={() => setFailure(false)}
        title="Algo deu errado"
        visible={failure}
      />
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.background, flex: 1 },
  content: { paddingHorizontal: theme.spacing.page },
  loading: { gap: theme.spacing.medium, paddingHorizontal: theme.spacing.page },
  topBar: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small, paddingVertical: theme.spacing.small },
  backButton: { alignSelf: 'flex-start', padding: theme.spacing.tiny },
  brand: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.tiny },
  brandText: { color: theme.colors.button, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle },
  title: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.title, marginTop: theme.spacing.small },
  description: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.small },
  providerCard: { alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, flexDirection: 'row', gap: theme.spacing.medium, marginTop: theme.spacing.large, padding: theme.spacing.medium },
  providerIcon: { alignItems: 'center', backgroundColor: theme.colors.selectedTint, borderRadius: theme.radius.round, height: theme.spacing.avatar, justifyContent: 'center', width: theme.spacing.avatar },
  providerTexts: { flex: 1 },
  providerName: { color: theme.colors.title, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button },
  providerLocation: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption, marginTop: theme.spacing.tiny },
  sectionTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle, marginBottom: theme.spacing.small, marginTop: theme.spacing.page },
  subsectionTitle: { color: theme.colors.text, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button, marginBottom: theme.spacing.small, marginTop: theme.spacing.large },
  pets: { gap: theme.spacing.large, paddingVertical: theme.spacing.tiny },
  emptyPets: { color: theme.colors.placeholder, fontFamily: theme.fonts.regular, fontSize: theme.typography.body },
  addPet: { alignSelf: 'flex-start', marginTop: theme.spacing.small },
  link: { color: theme.colors.button, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.caption, textDecorationLine: 'underline' },
  selectionField: { alignItems: 'center', backgroundColor: theme.colors.white, borderColor: theme.colors.divider, borderRadius: theme.radius.input, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.medium },
  selectionLabel: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption },
  selectionValue: { color: theme.colors.title, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button, marginTop: theme.spacing.tiny },
  placeholder: { color: theme.colors.placeholder },
  fieldInvalid: { borderColor: theme.colors.error },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.small },
  timeSlot: { alignItems: 'center', backgroundColor: theme.colors.white, borderColor: theme.colors.divider, borderRadius: theme.radius.input, borderWidth: 1, minWidth: theme.spacing.calendarDay * 2, paddingHorizontal: theme.spacing.medium, paddingVertical: theme.spacing.small },
  timeSlotSelected: { backgroundColor: theme.colors.selectedTint, borderColor: theme.colors.button },
  timeText: { color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: theme.typography.body },
  timeTextSelected: { color: theme.colors.button, fontFamily: theme.fonts.semiBold },
  multilineInput: { minHeight: theme.spacing.textAreaHeight },
  medicationSection: { borderTopColor: theme.colors.divider, borderTopWidth: 1, marginTop: theme.spacing.page, paddingTop: theme.spacing.large },
  summary: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, gap: theme.spacing.small, marginTop: theme.spacing.page, padding: theme.spacing.large },
  summaryTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle, marginBottom: theme.spacing.small },
  summaryRow: { flexDirection: 'row', gap: theme.spacing.medium, justifyContent: 'space-between' },
  summaryLabel: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption },
  summaryValue: { color: theme.colors.title, flex: 1, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.body, textAlign: 'right' },
  totalRow: { alignItems: 'center', borderTopColor: theme.colors.divider, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.small, paddingTop: theme.spacing.medium },
  totalLabel: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.filterTitle },
  totalValue: { color: theme.colors.button, fontFamily: theme.fonts.bold, fontSize: theme.typography.filterTitle },
  footer: { backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.card, borderTopRightRadius: theme.radius.card, bottom: 0, boxShadow: theme.shadow.bar, left: 0, paddingHorizontal: theme.spacing.page, paddingTop: theme.spacing.small, position: 'absolute', right: 0 },
  message: { justifyContent: 'center', padding: theme.spacing.page },
  messageTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle, textAlign: 'center' },
  messageText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.small, textAlign: 'center' },
  messageLink: { alignSelf: 'center', marginTop: theme.spacing.large },
});
