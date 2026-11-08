import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { HostRequestCard } from '../components/HostRequestCard';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { theme } from '../constants/theme';
import { listPendingHostReservations, HostPendingReservation } from '../services/hostReservations';
import { getErrorStatus, isRequestError } from '../services/auth';

export function hostReservationsErrorMessage(error: unknown): string {
  if (isRequestError(error) && getErrorStatus(error) === 403) {
    return 'Esta área está disponível apenas para prestadores de serviço.';
  }
  if (isRequestError(error) && getErrorStatus(error) === null) {
    return 'Não foi possível conectar. Verifique sua internet e tente de novo.';
  }
  return 'Não foi possível carregar as solicitações. Tente de novo.';
}

export default function HostReservationsScreen() {
  const [requests, setRequests] = useState<HostPendingReservation[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(
    (pullToRefresh = false) => {
      if (pullToRefresh) {
        setRefreshing(true);
      } else {
        setRequests(null);
      }
      setError('');
      listPendingHostReservations()
        .then((page) => {
          setRequests(page.items);
          setTotal(page.total);
        })
        .catch((requestError) => setError(hostReservationsErrorMessage(requestError)))
        .finally(() => setRefreshing(false));
    },
    [attempt],
  );

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  function handleChangeTab(key: 'home' | 'buscar' | 'reservas' | 'perfil') {
    if (key === 'home') {
      router.replace('/home');
    }
    if (key === 'buscar') {
      router.push('/home');
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={() => loadRequests(true)} refreshing={refreshing} />}
        showsVerticalScrollIndicator={false}
      >
        <Text accessibilityRole="header" style={styles.title}>
          Solicitações pendentes
        </Text>
        <Text style={styles.subtitle}>
          {total === 1 ? '1 solicitação aguardando sua resposta' : `${total} solicitações aguardando sua resposta`}
        </Text>

        {error ? (
          <View style={styles.message}>
            <Text accessibilityRole="header" style={styles.messageTitle}>Algo deu errado</Text>
            <Text style={styles.messageText}>{error}</Text>
            <Button onPress={() => setAttempt((value) => value + 1)} title="Tentar de novo" />
          </View>
        ) : requests === null ? (
          <View accessibilityLabel="Carregando solicitações" style={styles.list}>
            <Skeleton height={280} radius={theme.radius.card} width="100%" />
            <Skeleton height={280} radius={theme.radius.card} width="100%" />
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.message}>
            <Text accessibilityRole="header" style={styles.messageTitle}>Nenhuma solicitação pendente</Text>
            <Text style={styles.messageText}>Quando um Tutor solicitar um serviço, ele aparecerá aqui.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {requests.map((request) => (
              <HostRequestCard key={request.id} request={request} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <BottomTabBar activeTab="reservas" onChangeTab={handleChangeTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.tabBar + theme.spacing.page * 2,
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.page,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.title,
  },
  subtitle: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.tiny,
  },
  list: {
    gap: theme.spacing.medium,
    marginTop: theme.spacing.page,
  },
  message: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.page * 2,
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
  tabBarWrapper: {
    bottom: theme.spacing.large,
    left: theme.spacing.page,
    position: 'absolute',
    right: theme.spacing.page,
  },
});
