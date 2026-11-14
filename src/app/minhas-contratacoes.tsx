import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { ErrorModal } from '../components/ErrorModal';
import { Icon } from '../components/Icon';
import { Skeleton } from '../components/Skeleton';
import { TutorReservationCard } from '../components/TutorReservationCard';
import { theme } from '../constants/theme';
import { listMyReservations, TutorReservation } from '../services/tutorReservations';

export default function MyReservationsScreen() {
  const [reservations, setReservations] = useState<TutorReservation[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setReservations(null);
    setError(false);
    listMyReservations()
      .then((page) => {
        if (active) setReservations(page.items);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  function showUnavailable() {
    // A API de pagamento/acompanhamento ainda pertence às tarefas seguintes.
    setError(true);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Voltar" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Icon color={theme.colors.title} name="arrow_back" size={theme.icon.large} />
          </TouchableOpacity>
          <View style={styles.headerTexts}>
            <Text accessibilityRole="header" style={styles.title}>Minhas contratações</Text>
            <Text style={styles.subtitle}>Acompanhe seus serviços e hospedagens.</Text>
          </View>
        </View>

        {reservations === null ? (
          <View accessibilityLabel="Carregando contratações" style={styles.list}>
            <Skeleton height={300} radius={theme.radius.card} width="100%" />
            <Skeleton height={260} radius={theme.radius.card} width="100%" />
          </View>
        ) : reservations.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Icon color={theme.colors.button} name="calendar_month" size={theme.icon.huge} /></View>
            <Text style={styles.emptyTitle}>Você ainda não tem contratações</Text>
            <Text style={styles.emptyText}>Encontre um Host e solicite uma hospedagem para acompanhar tudo por aqui.</Text>
            <ButtonLike onPress={() => router.push('/home')} title="Buscar hospedagem" />
          </View>
        ) : (
          <View style={styles.list}>
            {reservations.map((reservation) => (
              <TutorReservationCard
                key={reservation.id}
                onChat={() => router.push({ pathname: '/chat/[id]', params: { id: reservation.hostId } })}
                onPrimaryAction={() => {
                  if (reservation.status === 'in_progress' || reservation.status === 'completed') {
                    router.push({ pathname: '/acompanhamento/[id]', params: { id: reservation.id } });
                  } else {
                    showUnavailable();
                  }
                }}
                reservation={reservation}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.tabBarWrapper}><BottomTabBar activeTab="reservas" onChangeTab={(key) => {
        if (key === 'home') router.replace('/home');
        if (key === 'perfil') router.push('/perfil');
        if (key === 'buscar') router.push('/home');
      }} /></View>
      <ErrorModal
        buttonTitle={reservations === null ? 'Tentar novamente' : 'Fechar'}
        message={reservations === null ? 'Não foi possível carregar suas contratações.' : 'Esta etapa ainda será integrada ao backend.'}
        onClose={() => {
          if (reservations === null) setAttempt((value) => value + 1);
          else setError(false);
        }}
        title={reservations === null ? 'Algo deu errado' : 'Integração pendente'}
        visible={error}
      />
    </SafeAreaView>
  );
}

function ButtonLike({ onPress, title }: { onPress: () => void; title: string }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.emptyButton}><Text style={styles.emptyButtonText}>{title}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.background, flex: 1 },
  content: { padding: theme.spacing.page, paddingBottom: theme.spacing.tabBar + theme.spacing.page * 2 },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.medium },
  backButton: { alignItems: 'center', height: theme.spacing.bell, justifyContent: 'center', width: theme.spacing.bell },
  headerTexts: { flex: 1 },
  title: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle },
  subtitle: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.tiny },
  list: { gap: theme.spacing.large, marginTop: theme.spacing.page },
  empty: { alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, marginTop: theme.spacing.page, padding: theme.spacing.page },
  emptyIcon: { alignItems: 'center', backgroundColor: theme.colors.selectedTint, borderRadius: theme.radius.round, height: theme.spacing.successCircle, justifyContent: 'center', width: theme.spacing.successCircle },
  emptyTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.modalTitle, marginTop: theme.spacing.large, textAlign: 'center' },
  emptyText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.small, textAlign: 'center' },
  emptyButton: { alignItems: 'center', backgroundColor: theme.colors.button, borderRadius: theme.radius.button, marginTop: theme.spacing.large, minHeight: theme.spacing.footer, justifyContent: 'center', paddingHorizontal: theme.spacing.large },
  emptyButtonText: { color: theme.colors.white, fontFamily: theme.fonts.bold, fontSize: theme.typography.button },
  tabBarWrapper: { bottom: theme.spacing.large, left: theme.spacing.page, position: 'absolute', right: theme.spacing.page },
});
