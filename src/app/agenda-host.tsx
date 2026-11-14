import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { ErrorModal } from '../components/ErrorModal';
import { HostAgendaCalendar } from '../components/HostAgendaCalendar';
import { BottomTabBar } from '../components/BottomTabBar';
import { Skeleton } from '../components/Skeleton';
import { theme } from '../constants/theme';
import { AgendaDay, blockHostAgenda, getHostAgenda, hostAgendaErrorMessage, unblockHostAgendaDay } from '../services/hostAgenda';
import { DateRange, toIsoDate } from '../utils/calendar';

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

const STATUS_LEGEND: { color: string; label: string }[] = [
  { color: theme.colors.selectedTint, label: 'Livre' },
  { color: theme.colors.button, label: 'Bloqueado' },
  { color: theme.colors.subtitle, label: 'Ocupado' },
];

export default function HostAgendaScreen() {
  const [month, setMonth] = useState(monthStart(new Date()));
  const [days, setDays] = useState<AgendaDay[]>([]);
  const [capacity, setCapacity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [selectedRange, setSelectedRange] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [selectedBlocked, setSelectedBlocked] = useState<AgendaDay | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [modal, setModal] = useState<'block' | 'unblock' | null>(null);
  const [sending, setSending] = useState(false);
  const [modalError, setModalError] = useState('');

  const startDate = toIsoDate(month);
  const endDate = toIsoDate(monthEnd(month));

  const loadAgenda = useCallback(
    (pullToRefresh = false) => {
      if (pullToRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      getHostAgenda(startDate, endDate)
        .then((agenda) => {
          setDays(agenda.days);
          setCapacity(agenda.capacity);
        })
        .catch((agendaError) => setError(hostAgendaErrorMessage(agendaError)))
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [attempt, endDate, startDate],
  );

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  const dayMap = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

  function handleDay(day: AgendaDay) {
    if (day.status === 'occupied') {
      setModalError('Esse dia já possui hospedagem e não pode ser bloqueado.');
      return;
    }
    if (day.status === 'blocked') {
      setSelectedBlocked(day);
      setModal('unblock');
      return;
    }
    const selected = dayMap.get(day.date) ? day : null;
    if (!selected) return;
    const date = new Date(`${day.date}T00:00:00`);
    if (!selectedRange.checkIn || selectedRange.checkOut || date <= selectedRange.checkIn) {
      setSelectedRange({ checkIn: date, checkOut: null });
      return;
    }
    setSelectedRange({ checkIn: selectedRange.checkIn, checkOut: date });
    setReason('');
    setReasonError('');
    setModal('block');
  }

  async function confirmBlock() {
    if (!selectedRange.checkIn || !selectedRange.checkOut || sending) return;
    setSending(true);
    try {
      await blockHostAgenda({
        startDate: toIsoDate(selectedRange.checkIn),
        endDate: toIsoDate(selectedRange.checkOut),
        reason,
      });
      setModal(null);
      setSelectedRange({ checkIn: null, checkOut: null });
      loadAgenda(true);
    } catch (agendaError) {
      setModal(null);
      setModalError(hostAgendaErrorMessage(agendaError));
    } finally {
      setSending(false);
    }
  }

  async function confirmUnblock() {
    if (!selectedBlocked?.block?.id || sending) return;
    setSending(true);
    try {
      await unblockHostAgendaDay(selectedBlocked.block.id);
      setModal(null);
      setSelectedBlocked(null);
      loadAgenda(true);
    } catch (agendaError) {
      setModal(null);
      setModalError(hostAgendaErrorMessage(agendaError));
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity accessibilityLabel="Voltar" accessibilityRole="button" onPress={() => router.back()}>
          <Text style={styles.back}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text accessibilityRole="header" style={styles.title}>Agenda do Host</Text>
        <Text style={styles.subtitle}>Gerencie os dias disponíveis para hospedagem.</Text>

        <View style={styles.capacity}>
          <Text style={styles.capacityLabel}>Capacidade por dia</Text>
          <Text style={styles.capacityValue}>{capacity} {capacity === 1 ? 'pet' : 'pets'}</Text>
        </View>

        {loading ? (
          <View accessibilityLabel="Carregando agenda" style={styles.loading}>
            <Skeleton height={320} radius={theme.radius.card} width="100%" />
          </View>
        ) : error ? (
          <View style={styles.message}>
            <Text accessibilityRole="header" style={styles.messageTitle}>Algo deu errado</Text>
            <Text style={styles.messageText}>{error}</Text>
            <Button onPress={() => setAttempt((value) => value + 1)} title="Tentar de novo" />
          </View>
        ) : (
          <>
            <View style={styles.calendarWrap}>
              <HostAgendaCalendar days={days} month={month} onChangeMonth={setMonth} onPressDay={handleDay} />
            </View>
            <View style={styles.legend}>
              {STATUS_LEGEND.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendMark, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.hint}>Toque em um dia livre para selecionar um período e bloqueá-lo.</Text>
          </>
        )}
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <BottomTabBar activeTab="reservas" onChangeTab={(key) => key === 'home' ? router.replace('/home') : undefined} />
      </View>

      <Modal animationType="fade" onRequestClose={() => setModal(null)} transparent visible={modal !== null}>
        <View style={styles.modalOverlay}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <Text accessibilityRole="header" style={styles.modalTitle}>
              {modal === 'block' ? 'Bloquear período?' : 'Liberar este dia?'}
            </Text>
            <Text style={styles.modalText}>
              {modal === 'block' ? 'O período ficará indisponível para novas solicitações.' : 'O dia voltará a ficar livre para novas solicitações.'}
            </Text>
            {modal === 'block' ? (
              <>
                <TextInput
                  accessibilityLabel="Motivo do bloqueio"
                  maxLength={500}
                  onChangeText={(value) => { setReason(value); setReasonError(''); }}
                  placeholder="Motivo opcional"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.reasonInput, reasonError ? styles.inputError : null]}
                  value={reason}
                />
                {reasonError ? <Text style={styles.fieldError}>{reasonError}</Text> : null}
              </>
            ) : null}
            <Button loading={sending} onPress={modal === 'block' ? confirmBlock : confirmUnblock} title="Confirmar" />
            <TouchableOpacity accessibilityRole="button" onPress={() => setModal(null)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ErrorModal message={modalError} onClose={() => setModalError('')} title="Não foi possível atualizar" visible={Boolean(modalError)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.background, flex: 1 },
  content: { padding: theme.spacing.page, paddingBottom: theme.spacing.tabBar + theme.spacing.page * 2 },
  back: { color: theme.colors.button, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button },
  title: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.title, marginTop: theme.spacing.large },
  subtitle: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.tiny },
  capacity: { alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.radius.button, boxShadow: theme.shadow.soft, flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.large, padding: theme.spacing.medium },
  capacityLabel: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body },
  capacityValue: { color: theme.colors.button, fontFamily: theme.fonts.bold, fontSize: theme.typography.button },
  loading: { marginTop: theme.spacing.large },
  calendarWrap: {
    marginTop: theme.spacing.medium,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.medium, marginTop: theme.spacing.medium },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.tiny },
  legendMark: { borderRadius: theme.radius.round, height: theme.spacing.small, width: theme.spacing.small },
  legendText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption },
  hint: { color: theme.colors.placeholder, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption, marginTop: theme.spacing.medium },
  message: { alignItems: 'center', paddingTop: theme.spacing.page * 2 },
  messageTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle, textAlign: 'center' },
  messageText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.small, textAlign: 'center' },
  tabBarWrapper: { bottom: theme.spacing.large, left: theme.spacing.page, position: 'absolute', right: theme.spacing.page },
  modalOverlay: { alignItems: 'center', backgroundColor: theme.colors.overlay, flex: 1, justifyContent: 'center', padding: theme.spacing.page },
  modalCard: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, padding: theme.spacing.large, width: '100%' },
  modalTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle, textAlign: 'center' },
  modalText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.small, textAlign: 'center' },
  reasonInput: { borderColor: theme.colors.divider, borderRadius: theme.radius.button, borderWidth: 1, color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.medium, padding: theme.spacing.medium },
  inputError: { borderColor: theme.colors.error },
  fieldError: { color: theme.colors.error, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption, marginTop: theme.spacing.tiny },
  cancelButton: { alignItems: 'center', marginTop: theme.spacing.medium, padding: theme.spacing.small },
  cancelText: { color: theme.colors.button, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button },
});
