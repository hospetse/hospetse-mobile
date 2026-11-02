import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddOnItem } from '../../components/AddOnItem';
import { Button } from '../../components/Button';
import { DateRangeModal } from '../../components/DateRangeModal';
import { ErrorModal } from '../../components/ErrorModal';
import { FieldError } from '../../components/FieldError';
import { Icon } from '../../components/Icon';
import { PetOption } from '../../components/PetOption';
import { ReservationSuccess } from '../../components/ReservationSuccess';
import { Skeleton } from '../../components/Skeleton';
import { SAMPLE_ADD_ONS } from '../../constants/addOns';
import { theme } from '../../constants/theme';
import { formatHostLocation, getHostPage, HostDetails, HostNotFoundError } from '../../services/hosts';
import { listMyPets, Pet } from '../../services/pets';
import {
  createReservation,
  newIdempotencyKey,
  Reservation,
  ReservationField,
  toReservationError,
} from '../../services/reservations';
import { DateRange, formatDate, fromIsoDate, toIsoDate } from '../../utils/calendar';
import { countNights } from '../../utils/chat';
import { formatCurrency } from '../../utils/money';
import { validateReservation } from '../../utils/validateReservation';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';
type ModalKind = 'unavailable' | 'profile-incomplete' | 'generic';

// Textos dos modais de erro do protótipo
const MODALS: Record<ModalKind, { title: string; message: string; button: string }> = {
  unavailable: {
    title: 'Data indisponível',
    message: 'Infelizmente o hotel não está disponível nos dias selecionados.',
    button: 'Voltar',
  },
  'profile-incomplete': {
    title: 'Cadastro Incompleto',
    message: 'Complete o cadastro para seguir com a reserva.',
    button: 'Completar Cadastro',
  },
  generic: {
    title: 'Algo deu errado',
    message: 'Não conseguimos processar sua informação no momento. Tente novamente mais tarde.',
    button: 'Voltar',
  },
};

export default function ReservationScreen() {
  // Mesmo contexto da busca que chegou ao detalhe: datas e pet são opcionais
  const { id, checkIn, checkOut, petId } = useLocalSearchParams<{
    id: string;
    checkIn?: string;
    checkOut?: string;
    petId?: string;
  }>();
  const insets = useSafeAreaInsets();

  const [host, setHost] = useState<HostDetails | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [attempt, setAttempt] = useState(0);

  const [range, setRange] = useState<DateRange>({
    checkIn: fromIsoDate(checkIn),
    checkOut: fromIsoDate(checkOut),
  });
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<ReservationField, string>>>({});
  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  // Mesma chave enquanto o pet e as datas não mudam: reenviar não cria outra solicitação
  const idempotencyKey = useRef<string | null>(null);
  // O estado "sending" só muda na próxima renderização; o ref trava o envio na hora
  const sendingNow = useRef(false);

  useEffect(() => {
    let active = true;
    setState('loading');
    Promise.all([getHostPage(id), listMyPets()])
      .then(([page, myPets]) => {
        if (!active) {
          return;
        }
        setHost(page.host);
        setPets(myPets);
        // O pet da busca já vem escolhido, se for um pet do Tutor
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

  // Mudou a intenção (pet ou datas): a próxima tentativa é outra solicitação
  function changeRange(next: DateRange) {
    setRange(next);
    setShowCalendar(false);
    setErrors({ ...errors, dates: undefined });
    idempotencyKey.current = null;
  }

  function choosePet(next: string) {
    setSelectedPet(next);
    setErrors({ ...errors, pet: undefined });
    idempotencyKey.current = null;
  }

  function toggleAddOn(addOnId: string) {
    setAddOns(addOns.includes(addOnId) ? addOns.filter((item) => item !== addOnId) : [...addOns, addOnId]);
  }

  async function handleSubmit() {
    const service = host?.services[0];
    const formErrors = validateReservation({
      checkIn: range.checkIn,
      checkOut: range.checkOut,
      petId: selectedPet,
      hasPets: pets.length > 0,
    });
    setErrors(formErrors);
    // O segundo toque, antes de a tela travar o botão, não envia de novo
    if (sendingNow.current || Object.keys(formErrors).length > 0 || !selectedPet || !range.checkIn || !range.checkOut) {
      return;
    }
    if (!service) {
      // Host sem serviço ativo: não há o que solicitar
      setModal('unavailable');
      return;
    }

    if (!idempotencyKey.current) {
      idempotencyKey.current = newIdempotencyKey();
    }
    sendingNow.current = true;
    setSending(true);
    try {
      const created = await createReservation(
        {
          serviceId: service.id,
          petId: selectedPet,
          startDate: toIsoDate(range.checkIn),
          endDate: toIsoDate(range.checkOut),
        },
        idempotencyKey.current,
      );
      setReservation(created);
    } catch (error) {
      const result = toReservationError(error);
      if (result.kind === 'fields') {
        setErrors(result.fields);
      } else if (result.kind !== 'session-expired') {
        setModal(result.kind);
      }
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
        <Skeleton height={24} width={200} />
        <Skeleton height={64} width="100%" />
        <Skeleton height={64} width="100%" />
        <Skeleton height={96} width="100%" />
      </View>
    );
  }

  if (state !== 'ready' || !host) {
    return (
      <View style={[styles.screen, styles.message]}>
        <Text accessibilityRole="header" style={styles.messageTitle}>
          {state === 'not-found' ? 'Hospedagem não encontrada' : 'Algo deu errado'}
        </Text>
        <Text style={styles.messageText}>
          {state === 'not-found'
            ? 'Essa hospedagem não está mais disponível.'
            : 'Não foi possível carregar a reserva. Tente de novo.'}
        </Text>
        {state === 'error' ? <Button onPress={() => setAttempt(attempt + 1)} title="Tentar de novo" /> : null}
        <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.messageLink}>
          <Text style={styles.link}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const location = formatHostLocation(host);

  if (reservation) {
    const start = fromIsoDate(reservation.startDate);
    const end = fromIsoDate(reservation.endDate);
    const petName = pets.find((pet) => pet.id === reservation.petId)?.name ?? '';
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ReservationSuccess
          checkIn={start ? formatDate(start) : reservation.startDate}
          checkOut={end ? formatDate(end) : reservation.endDate}
          hostLocation={location}
          hostName={host.name}
          hostPicture={host.pictureUrl}
          nights={start && end ? countNights(start, end) : 0}
          onGoHome={() => router.dismissTo('/home')}
          // A tela de Reservas do Tutor ainda não existe
          onSeeReservations={() => {}}
          petName={petName}
          total={formatCurrency(reservation.totalValue)}
        />
      </View>
    );
  }

  const service = host.services[0];
  const nights = range.checkIn && range.checkOut ? countNights(range.checkIn, range.checkOut) : 0;
  const modalText = modal ? MODALS[modal] : null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: theme.spacing.footerHeight + insets.bottom + theme.spacing.page },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          {backButton}
          <View style={styles.brand}>
            <Icon color={theme.colors.button} name="pets" size={theme.icon.large} />
            <Text style={styles.brandText}>Hospetse</Text>
          </View>
        </View>

        <Text accessibilityRole="header" style={styles.title}>
          Confirmar Reserva
        </Text>

        <Text style={styles.sectionLabel}>Anfitrião/Local</Text>
        <View style={styles.hostCard}>
          {host.pictureUrl ? (
            <Image
              accessibilityLabel={`Foto de ${host.name}`}
              source={{ uri: host.pictureUrl }}
              style={styles.hostPicture}
            />
          ) : (
            <View style={[styles.hostPicture, styles.hostPlaceholder]}>
              <Icon color={theme.colors.button} name="pets" size={theme.icon.medium} />
            </View>
          )}
          <View style={styles.hostText}>
            <Text style={styles.hostName}>{host.name}</Text>
            <View style={styles.locationRow}>
              <Icon color={theme.colors.button} name="location_on" size={theme.icon.small} />
              <Text style={styles.hostLocation}>{location}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Período da Estadia</Text>
        <View style={styles.dates}>
          {[
            { label: 'Check-in', date: range.checkIn },
            { label: 'Check-out', date: range.checkOut },
          ].map((field) => (
            <TouchableOpacity
              key={field.label}
              accessibilityHint="Abre o calendário"
              accessibilityLabel={`${field.label}, ${field.date ? formatDate(field.date) : 'não escolhido'}`}
              accessibilityRole="button"
              onPress={() => setShowCalendar(true)}
              style={[styles.dateField, errors.dates ? styles.fieldInvalid : null]}
            >
              <Text style={styles.dateLabel}>{field.label}</Text>
              <Text style={[styles.dateValue, !field.date && styles.datePlaceholder]}>
                {field.date ? formatDate(field.date) : 'Escolher'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <FieldError message={errors.dates} />

        <View style={styles.petsHeader}>
          <Text style={styles.sectionLabelInline}>Quem vai se hospedar?</Text>
          {/* O cadastro de pet (HSP-PBI-016) ainda não existe no app */}
          <TouchableOpacity accessibilityRole="button">
            <Text style={styles.link}>Adicionar Pet</Text>
          </TouchableOpacity>
        </View>
        {pets.length > 0 ? (
          <ScrollView
            accessibilityRole="radiogroup"
            contentContainerStyle={styles.pets}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
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
          <Text style={styles.empty}>Você ainda não tem pets cadastrados.</Text>
        )}
        <FieldError message={errors.pet} />

        <Text style={[styles.sectionLabel, styles.addOnsLabel]}>Serviços Adicionais</Text>
        <View style={styles.addOns}>
          {SAMPLE_ADD_ONS.map((addOn) => (
            <AddOnItem
              key={addOn.id}
              description={addOn.description}
              onPress={() => toggleAddOn(addOn.id)}
              price={`+ ${formatCurrency(addOn.pricePerDay)}/dia`}
              selected={addOns.includes(addOn.id)}
              title={addOn.title}
            />
          ))}
        </View>
      </ScrollView>

      {/* Total só com as diárias: os serviços adicionais ainda não somam (DT-23) */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.medium }]}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {service && nights > 0 ? formatCurrency(service.price * nights) : 'Escolha as datas'}
            </Text>
          </View>
          {nights > 0 ? (
            <Text style={styles.nights}>
              {nights} {nights === 1 ? 'diária' : 'diárias'}
            </Text>
          ) : null}
        </View>
        <Button loading={sending} onPress={handleSubmit} title="Solicitar Reserva" />
      </View>

      <DateRangeModal
        onClose={() => setShowCalendar(false)}
        onConfirm={changeRange}
        range={range}
        visible={showCalendar}
      />

      {/* "Completar Cadastro" só fecha o aviso: a tela de conclusão do perfil (HSP-PBI-002) ainda não existe */}
      <ErrorModal
        buttonTitle={modalText?.button}
        message={modalText?.message ?? ''}
        onClose={() => setModal(null)}
        title={modalText?.title ?? ''}
        visible={modal !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  loading: {
    gap: theme.spacing.medium,
    paddingHorizontal: theme.spacing.page,
  },
  content: {
    paddingHorizontal: theme.spacing.page,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
    paddingVertical: theme.spacing.small,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: theme.spacing.tiny,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.tiny,
  },
  brandText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.title,
    marginTop: theme.spacing.small,
  },
  sectionLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.button,
    marginBottom: theme.spacing.small,
    marginTop: theme.spacing.large,
  },
  sectionLabelInline: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.button,
  },
  hostCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.rangeFill,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  hostPicture: {
    borderRadius: theme.radius.round,
    height: theme.spacing.avatar,
    width: theme.spacing.avatar,
  },
  hostPlaceholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    justifyContent: 'center',
  },
  hostText: {
    flex: 1,
  },
  hostName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.tiny,
  },
  hostLocation: {
    color: theme.colors.button,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  dates: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  dateField: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.badge,
    borderWidth: 1,
    flex: 1,
    padding: theme.spacing.small,
  },
  fieldInvalid: {
    borderColor: theme.colors.error,
  },
  dateLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  dateValue: {
    color: theme.colors.title,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.modalTitle,
    textAlign: 'center',
  },
  datePlaceholder: {
    color: theme.colors.placeholder,
  },
  petsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.small,
    marginTop: theme.spacing.large,
  },
  pets: {
    gap: theme.spacing.large,
    paddingVertical: theme.spacing.tiny,
  },
  empty: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  addOnsLabel: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    paddingTop: theme.spacing.large,
  },
  addOns: {
    gap: theme.spacing.medium,
  },
  link: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    bottom: 0,
    boxShadow: theme.shadow.bar,
    left: 0,
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.medium,
    position: 'absolute',
    right: 0,
  },
  totalRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  totalValue: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  nights: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  message: {
    justifyContent: 'center',
    padding: theme.spacing.page,
  },
  messageTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
    textAlign: 'center',
  },
  messageText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  messageLink: {
    alignSelf: 'center',
    marginTop: theme.spacing.large,
  },
});
