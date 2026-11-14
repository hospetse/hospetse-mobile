import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../../components/BottomTabBar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Skeleton } from '../../components/Skeleton';
import { StatusPill } from '../../components/StatusPill';
import { theme } from '../../constants/theme';
import { getTutorTracking, TrackingStep, TutorTracking } from '../../services/tutorTracking';
import { fromIsoDate, formatDate } from '../../utils/calendar';
import { formatCurrency } from '../../utils/money';

type LoadState = 'loading' | 'ready' | 'error';

function stepIcon(step: TrackingStep): 'check' | 'hourglass_top' | 'calendar_month' {
  if (step.status === 'completed') return 'check';
  if (step.status === 'current') return 'hourglass_top';
  return 'calendar_month';
}

function dateLabel(value: string): string {
  const parsed = fromIsoDate(value);
  return parsed ? formatDate(parsed) : value;
}

function statusLabel(status: TutorTracking['reservation']['status']): string {
  return status === 'completed' ? 'Concluída' : 'Em andamento';
}

function statusColors(status: TutorTracking['reservation']['status']): { color: string; background: string } {
  return status === 'completed'
    ? { color: theme.colors.green, background: theme.colors.greenTint }
    : { color: theme.colors.blue, background: theme.colors.blueTint };
}


export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tracking, setTracking] = useState<TutorTracking | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setState('loading');
      try {
        const result = await getTutorTracking(id);
        if (active) {
          setTracking(result);
          setState('ready');
        }
      } catch {
        if (active) setState('error');
      }
    }

    void load();
    // A atualização periódica entra quando a API real estiver disponível.
    return () => {
      active = false;
    };
  }, [id, attempt]);

  function handleTab(key: 'home' | 'buscar' | 'reservas' | 'perfil') {
    if (key === 'home') router.replace('/home');
    if (key === 'buscar') router.push('/home');
    if (key === 'reservas') router.replace('/minhas-contratacoes');
    if (key === 'perfil') router.push('/perfil');
  }

  if (state === 'loading' || !tracking) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.loading} accessibilityLabel="Carregando acompanhamento">
          <Skeleton height={24} width={220} />
          <Skeleton height={110} radius={theme.radius.card} width="100%" />
          <Skeleton height={260} radius={theme.radius.card} width="100%" />
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'error') {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.message}>
          <Text accessibilityRole="header" style={styles.messageTitle}>Algo deu errado</Text>
          <Text style={styles.messageText}>Não foi possível carregar o acompanhamento.</Text>
          <Button onPress={() => setAttempt((value) => value + 1)} title="Tentar de novo" />
        </View>
      </SafeAreaView>
    );
  }

  const { reservation, steps } = tracking;
  const status = statusColors(reservation.status);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Voltar" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Icon color={theme.colors.title} name="arrow_back" size={theme.icon.large} />
          </TouchableOpacity>
          <View style={styles.headerTexts}>
            <Text accessibilityRole="header" style={styles.title}>Acompanhar serviço</Text>
            <Text style={styles.subtitle}>Atualização da sua contratação.</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.hostRow}>
            {reservation.hostPicture ? <Image accessibilityLabel={`Foto de ${reservation.hostName}`} source={{ uri: reservation.hostPicture }} style={styles.hostPicture} /> : <View style={[styles.hostPicture, styles.placeholder]}><Icon color={theme.colors.button} name="pets" size={theme.icon.medium} /></View>}
            <View style={styles.hostText}>
              <Text style={styles.hostName}>{reservation.hostName}</Text>
              <Text style={styles.location}>{reservation.hostLocation}</Text>
            </View>
            <StatusPill backgroundColor={status.background} color={status.color} label={statusLabel(reservation.status)} />
          </View>
          <View style={styles.summaryDetails}>
            <View><Text style={styles.label}>Pet</Text><Text style={styles.value}>{reservation.petName}</Text></View>
            <View><Text style={styles.label}>Período</Text><Text style={styles.value}>{dateLabel(reservation.startDate)} a {dateLabel(reservation.endDate)}</Text></View>
            <View><Text style={styles.label}>Total</Text><Text style={styles.total}>{formatCurrency(reservation.totalValue)}</Text></View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Linha do tempo</Text>
        <View style={styles.timelineCard}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.stepIcon, step.status === 'current' && styles.currentStep, step.status === 'upcoming' && styles.upcomingStep]}>
                  <Icon color={step.status === 'upcoming' ? theme.colors.placeholder : theme.colors.white} name={stepIcon(step)} size={theme.icon.small} />
                </View>
                {index < steps.length - 1 ? <View style={[styles.line, step.status === 'completed' && styles.completedLine]} /> : null}
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, step.status === 'current' && styles.currentText]}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
                {step.date ? <Text style={styles.stepDate}>{dateLabel(step.date)}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.tabBarWrapper}><BottomTabBar activeTab="reservas" onChangeTab={handleTab} /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.background, flex: 1 },
  content: { padding: theme.spacing.page, paddingBottom: theme.spacing.tabBar + theme.spacing.page * 2 },
  loading: { gap: theme.spacing.large, padding: theme.spacing.page },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.medium },
  backButton: { alignItems: 'center', height: theme.spacing.bell, justifyContent: 'center', width: theme.spacing.bell },
  headerTexts: { flex: 1 },
  title: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle },
  subtitle: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.tiny },
  summaryCard: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, marginTop: theme.spacing.page, padding: theme.spacing.large },
  hostRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  hostPicture: { borderRadius: theme.radius.input, height: theme.spacing.avatar, width: theme.spacing.avatar },
  placeholder: { alignItems: 'center', backgroundColor: theme.colors.selectedTint, justifyContent: 'center' },
  hostText: { flex: 1 },
  hostName: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.button },
  location: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption, marginTop: theme.spacing.tiny },
  summaryDetails: { borderTopColor: theme.colors.divider, borderTopWidth: 1, flexDirection: 'row', gap: theme.spacing.medium, justifyContent: 'space-between', marginTop: theme.spacing.medium, paddingTop: theme.spacing.medium },
  label: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption },
  value: { color: theme.colors.title, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.body, marginTop: theme.spacing.tiny },
  total: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.button, marginTop: theme.spacing.tiny },
  sectionTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle, marginTop: theme.spacing.page },
  timelineCard: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, marginTop: theme.spacing.medium, padding: theme.spacing.large },
  timelineRow: { flexDirection: 'row', gap: theme.spacing.medium, minHeight: theme.spacing.footer + theme.spacing.large },
  timelineRail: { alignItems: 'center', width: theme.spacing.large },
  stepIcon: { alignItems: 'center', backgroundColor: theme.colors.green, borderRadius: theme.radius.round, height: theme.spacing.large, justifyContent: 'center', width: theme.spacing.large },
  currentStep: { backgroundColor: theme.colors.button },
  upcomingStep: { backgroundColor: theme.colors.divider },
  line: { backgroundColor: theme.colors.divider, flex: 1, width: theme.spacing.tiny / 2 },
  completedLine: { backgroundColor: theme.colors.green },
  stepText: { flex: 1, paddingBottom: theme.spacing.medium },
  stepTitle: { color: theme.colors.title, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button },
  currentText: { color: theme.colors.button },
  stepDescription: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.tiny },
  stepDate: { color: theme.colors.placeholder, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption, marginTop: theme.spacing.tiny },
  message: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: theme.spacing.page },
  messageTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle },
  messageText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.small, textAlign: 'center' },
  tabBarWrapper: { bottom: theme.spacing.large, left: theme.spacing.page, position: 'absolute', right: theme.spacing.page },
});
