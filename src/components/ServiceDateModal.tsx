import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { DateRange } from '../utils/calendar';
import { Button } from './Button';
import { Calendar } from './Calendar';

type ServiceDateModalProps = {
  onClose: () => void;
  onConfirm: (date: Date) => void;
  selectedDate: Date | null;
  visible: boolean;
};

// Calendário de um dia para visita ou passeio. A segunda data do Calendar é ignorada.
export function ServiceDateModal({ onClose, onConfirm, selectedDate, visible }: ServiceDateModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      {visible ? (
        <ServiceDateForm onClose={onClose} onConfirm={onConfirm} selectedDate={selectedDate} />
      ) : null}
    </Modal>
  );
}

function ServiceDateForm({ onClose, onConfirm, selectedDate }: Omit<ServiceDateModalProps, 'visible'>) {
  const [range, setRange] = useState<DateRange>({ checkIn: selectedDate, checkOut: null });

  return (
    <View style={styles.backdrop}>
      <Pressable accessibilityLabel="Fechar calendário" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityViewIsModal style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          Escolha a data
        </Text>
        <Calendar
          onChange={(next) => setRange({ checkIn: next.checkOut ?? next.checkIn, checkOut: null })}
          range={range}
        />
        <Text style={styles.hint}>{range.checkIn ? 'Data escolhida.' : 'Escolha o dia do serviço.'}</Text>
        <Button
          onPress={() => {
            if (range.checkIn) {
              onConfirm(range.checkIn);
            }
          }}
          title="Confirmar data"
        />
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
    marginBottom: theme.spacing.small,
    marginTop: theme.spacing.small,
  },
});
