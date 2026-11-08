import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { ErrorModal } from '../../components/ErrorModal';
import { HostRequestCard } from '../../components/HostRequestCard';
import { Skeleton } from '../../components/Skeleton';
import { theme } from '../../constants/theme';
import {
  acceptHostReservation,
  hostDecisionErrorMessage,
  HostPendingReservation,
  listPendingHostReservations,
  rejectHostReservation,
} from '../../services/hostReservations';
import { getErrorStatus, isRequestError } from '../../services/auth';

// Confirmação e decisão da solicitação. A lista volta a ser a fonte dos dados após a decisão.
export default function HostReservationDecisionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<HostPendingReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reloadAfterError, setReloadAfterError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPendingHostReservations()
      .then((page) => {
        if (active) {
          setRequest(page.items.find((item) => item.id === id) ?? null);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(hostDecisionErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  async function confirmDecision() {
    if (!request || sending) {
      return;
    }
    if (action === 'reject' && reason.trim().length === 0) {
      setReasonError('Informe o motivo da recusa.');
      return;
    }
    if (action === 'reject' && reason.trim().length > 500) {
      setReasonError('O motivo deve ter até 500 caracteres.');
      return;
    }

    setSending(true);
    setError('');
    try {
      if (action === 'accept') {
        await acceptHostReservation(request.id);
      } else {
        await rejectHostReservation(request.id, reason);
      }
      router.replace('/reservas');
    } catch (decisionError) {
      setAction(null);
      setReloadAfterError(true);
      setError(hostDecisionErrorMessage(decisionError));
    } finally {
      setSending(false);
    }
  }

  const closeError = () => {
    setError('');
    if (reloadAfterError) {
      setReloadAfterError(false);
      setAttempt((value) => value + 1);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.loading}>
          <Skeleton height={30} width={230} />
          <Skeleton height={320} radius={theme.radius.card} width="100%" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !request) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.message}>
          <Text accessibilityRole="header" style={styles.messageTitle}>Algo deu errado</Text>
          <Text style={styles.messageText}>{error}</Text>
          <Button onPress={() => setAttempt((value) => value + 1)} title="Tentar de novo" />
          <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.link}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.message}>
          <Text accessibilityRole="header" style={styles.messageTitle}>Solicitação não encontrada</Text>
          <Button onPress={() => router.replace('/reservas')} title="Voltar para solicitações" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity accessibilityLabel="Voltar" accessibilityRole="button" onPress={() => router.back()}>
          <Text style={styles.back}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text accessibilityRole="header" style={styles.title}>Detalhes da solicitação</Text>
        <Text style={styles.subtitle}>Confira os dados antes de decidir.</Text>

        <View style={styles.cardWrap}>
          <HostRequestCard request={request} />
        </View>

        {request.pet.medicalNotes ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Cuidados médicos</Text>
            <Text style={styles.infoText}>{request.pet.medicalNotes}</Text>
          </View>
        ) : null}
        {request.pet.behavioralNotes ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Comportamento</Text>
            <Text style={styles.infoText}>{request.pet.behavioralNotes}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button onPress={() => setAction('accept')} title="Aceitar solicitação" />
          <TouchableOpacity accessibilityRole="button" onPress={() => setAction('reject')} style={styles.rejectButton}>
            <Text style={styles.rejectText}>Recusar solicitação</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="fade" onRequestClose={() => setAction(null)} transparent visible={action !== null}>
        <View style={styles.modalOverlay}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <Text accessibilityRole="header" style={styles.modalTitle}>
              {action === 'accept' ? 'Aceitar solicitação?' : 'Recusar solicitação?'}
            </Text>
            <Text style={styles.modalText}>
              {action === 'accept'
                ? 'O Tutor será avisado e a solicitação ficará aguardando pagamento.'
                : 'O Tutor receberá o motivo informado.'}
            </Text>
            {action === 'reject' ? (
              <>
                <TextInput
                  accessibilityLabel="Motivo da recusa"
                  maxLength={500}
                  multiline
                  onChangeText={(value) => {
                    setReason(value);
                    setReasonError('');
                  }}
                  placeholder="Informe o motivo"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.reasonInput, reasonError ? styles.inputError : null]}
                  value={reason}
                />
                {reasonError ? <Text style={styles.fieldError}>{reasonError}</Text> : null}
              </>
            ) : null}
            <Button loading={sending} onPress={confirmDecision} title="Confirmar" />
            <TouchableOpacity accessibilityRole="button" onPress={() => setAction(null)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ErrorModal
        message={error}
        onClose={closeError}
        title="Não foi possível decidir"
        visible={Boolean(error && request)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.background, flex: 1 },
  content: { padding: theme.spacing.page, paddingBottom: theme.spacing.page * 2 },
  loading: { gap: theme.spacing.medium, padding: theme.spacing.page },
  back: { color: theme.colors.button, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button },
  title: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.title, marginTop: theme.spacing.large },
  subtitle: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.tiny },
  cardWrap: { marginTop: theme.spacing.large },
  infoBox: { backgroundColor: theme.colors.selectedTint, borderRadius: theme.radius.button, marginTop: theme.spacing.medium, padding: theme.spacing.medium },
  infoTitle: { color: theme.colors.title, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button },
  infoText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.tiny },
  actions: { gap: theme.spacing.small, marginTop: theme.spacing.large },
  rejectButton: { alignItems: 'center', borderColor: theme.colors.button, borderRadius: theme.radius.button, borderWidth: 1, minHeight: 48, justifyContent: 'center', marginTop: theme.spacing.small },
  rejectText: { color: theme.colors.button, fontFamily: theme.fonts.bold, fontSize: theme.typography.button },
  message: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: theme.spacing.page },
  messageTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle, textAlign: 'center' },
  messageText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.small, textAlign: 'center' },
  backLink: { marginTop: theme.spacing.large },
  link: { color: theme.colors.button, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button },
  modalOverlay: { alignItems: 'center', backgroundColor: theme.colors.overlay, flex: 1, justifyContent: 'center', padding: theme.spacing.page },
  modalCard: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, padding: theme.spacing.large, width: '100%' },
  modalTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle, textAlign: 'center' },
  modalText: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.small, textAlign: 'center' },
  reasonInput: { borderColor: theme.colors.divider, borderRadius: theme.radius.button, borderWidth: 1, color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body, marginTop: theme.spacing.medium, minHeight: 96, padding: theme.spacing.medium, textAlignVertical: 'top' },
  inputError: { borderColor: theme.colors.error },
  fieldError: { color: theme.colors.error, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption, marginTop: theme.spacing.tiny },
  cancelButton: { alignItems: 'center', marginTop: theme.spacing.medium, padding: theme.spacing.small },
  cancelText: { color: theme.colors.button, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.button },
});
