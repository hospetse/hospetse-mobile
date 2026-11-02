import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import { RoutinePeriod, RoutineStep } from '../services/hosts';
import { Button } from './Button';
import { Icon, IconName } from './Icon';

const PERIODS: Record<RoutinePeriod, { icon: IconName; label: string }> = {
  morning: { icon: 'wb_sunny', label: 'Manhã' },
  afternoon: { icon: 'wb_twilight', label: 'Tarde' },
  night: { icon: 'bedtime', label: 'Noite' },
};

type RoutineModalProps = {
  onClose: () => void;
  steps: RoutineStep[];
  visible: boolean;
};

// Modal que sobe por baixo com a rotina do Host e a garantia veterinária (#519).
// Fecha pelo botão, pelo toque fora e pelo voltar do Android (onRequestClose)
export function RoutineModal({ onClose, steps, visible }: RoutineModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <Pressable accessibilityLabel="Fechar rotina" onPress={onClose} style={StyleSheet.absoluteFill} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.large }]}>
          <View style={styles.handle} />
          <Text accessibilityRole="header" style={styles.title}>
            Rotina
          </Text>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.routineHeader}>
              <Text style={styles.sectionTitle}>Rotina Personalizada</Text>
              <Text style={styles.stepCount}>
                {steps.length} {steps.length === 1 ? 'etapa diária' : 'etapas diárias'}
              </Text>
            </View>

            {steps.map((step) => {
              const period = PERIODS[step.period];
              return (
                // O leitor de tela lê a etapa inteira de uma vez
                <View
                  key={`${step.period}-${step.time}`}
                  accessible
                  accessibilityLabel={`${period.label}, ${step.time}. ${step.title}. ${step.description}`}
                  style={styles.step}
                >
                  <View style={styles.stepIcon}>
                    <Icon color={theme.colors.button} name={period.icon} size={theme.icon.medium} />
                  </View>
                  <View style={styles.stepText}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.period}>{period.label}</Text>
                      <Text style={styles.time}>{step.time}</Text>
                    </View>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
              );
            })}

            <View accessible style={styles.guarantee}>
              <View style={styles.guaranteeHeader}>
                <Icon color={theme.colors.button} name="verified_user" size={theme.icon.large} />
                <Text style={styles.guaranteeTitle}>Garantia Veterinária Hospetse</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Protegido</Text>
                </View>
              </View>
              {/* PROVISÓRIO: texto de exemplo, a confirmar com a PO */}
              <Text style={styles.guaranteeText}>
                Se o seu pet precisar de cuidado veterinário durante a hospedagem, a Hospetse ajuda
                o Host a encontrar atendimento e avisa você na hora.
              </Text>
            </View>
          </ScrollView>

          <Button onPress={onClose} title="Fechar" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: theme.colors.backdrop,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    maxHeight: '85%',
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.medium,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.round,
    height: theme.spacing.tiny,
    marginBottom: theme.spacing.medium,
    width: theme.spacing.page * 2,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
    textAlign: 'center',
  },
  content: {
    gap: theme.spacing.medium,
    paddingTop: theme.spacing.large,
  },
  routineHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.filterTitle,
  },
  stepCount: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  step: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.button,
    boxShadow: theme.shadow.soft,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  stepIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.round,
    height: theme.spacing.serviceIcon,
    justifyContent: 'center',
    width: theme.spacing.serviceIcon,
  },
  stepText: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  period: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  time: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.body,
  },
  stepTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
    marginTop: theme.spacing.tiny,
  },
  stepDescription: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.tiny,
  },
  guarantee: {
    backgroundColor: theme.colors.selectedTint,
    borderColor: theme.colors.rangeFill,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    marginTop: theme.spacing.small,
    padding: theme.spacing.medium,
  },
  guaranteeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  guaranteeTitle: {
    color: theme.colors.title,
    flex: 1,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.button,
  },
  badge: {
    backgroundColor: theme.colors.button,
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny / 2,
  },
  badgeText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
  },
  guaranteeText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
  },
});
