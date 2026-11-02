import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { DateRange } from '../utils/calendar';
import { Button } from './Button';
import { Calendar } from './Calendar';

type DateRangeModalProps = {
  onClose: () => void;
  onConfirm: (range: DateRange) => void;
  range: DateRange;
  visible: boolean;
};

// Calendário por cima da tela para trocar o período da estadia
export function DateRangeModal({ onClose, onConfirm, range, visible }: DateRangeModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      {/* Montado só aberto: cada abertura começa das datas atuais */}
      {visible ? <DateRangeForm onClose={onClose} onConfirm={onConfirm} range={range} /> : null}
    </Modal>
  );
}

function DateRangeForm({ onClose, onConfirm, range }: Omit<DateRangeModalProps, 'visible'>) {
  const [draft, setDraft] = useState<DateRange>(range);
  const complete = draft.checkIn !== null && draft.checkOut !== null;

  function handleConfirm() {
    if (complete) {
      onConfirm(draft);
    }
  }

  return (
    <View style={styles.backdrop}>
      <Pressable accessibilityLabel="Fechar calendário" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityViewIsModal style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          Período da Estadia
        </Text>
        <Calendar onChange={setDraft} range={draft} />
        <Text style={styles.hint}>
          {complete ? ' ' : draft.checkIn ? 'Agora escolha o check-out.' : 'Escolha o check-in.'}
        </Text>
        <Button onPress={handleConfirm} title="Confirmar datas" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: theme.colors.backdrop,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.page,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: theme.spacing.large,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.modalTitle,
    marginBottom: theme.spacing.medium,
  },
  hint: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.small,
  },
});
