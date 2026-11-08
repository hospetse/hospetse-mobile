import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { Icon, IconName } from '../../components/Icon';
import { StatusPill } from '../../components/StatusPill';
import { theme } from '../../constants/theme';
import { HostValidationStatus, useHostRegistration } from '../../context/HostRegistrationContext';

// O que acontece depois do envio, segundo os documentos do produto (HPET10 e HPET20b)
const NEXT_STEPS = [
  'Seu perfil só aparece nas buscas depois da aprovação.',
  'Você só recebe solicitações de reserva depois da aprovação.',
  'Se o cadastro for rejeitado, você recebe um aviso com o motivo.',
];

type StatusView = {
  icon: IconName;
  title: string;
  subtitle: string;
  pill: string;
  pillColor: string;
  pillBackground: string;
  showNextSteps: boolean;
};

// Texto e cores de cada situação do cadastro. Recém-enviado e em análise são a mesma: pendente
const VIEWS: Record<Exclude<HostValidationStatus, 'draft'>, StatusView> = {
  pending: {
    icon: 'hourglass_top',
    title: 'Cadastro enviado para análise',
    subtitle:
      'Recebemos o seu cadastro de Anfitrião. Nossa equipe vai analisar os dados e as fotos do seu espaço.',
    pill: 'Pendente de validação',
    pillColor: theme.colors.subtitle,
    pillBackground: theme.colors.selectedTint,
    showNextSteps: true,
  },
  approved: {
    icon: 'check',
    title: 'Cadastro aprovado',
    subtitle: 'Seu perfil de Anfitrião foi aprovado. Você já aparece nas buscas e pode receber solicitações.',
    pill: 'Aprovado',
    pillColor: theme.colors.green,
    pillBackground: theme.colors.greenTint,
    showNextSteps: false,
  },
  rejected: {
    icon: 'close',
    title: 'Cadastro não aprovado',
    subtitle: 'Seu cadastro de Anfitrião não foi aprovado. O motivo ainda não aparece no aplicativo.',
    pill: 'Não aprovado',
    pillColor: theme.colors.error,
    pillBackground: theme.colors.iconBackground,
    showNextSteps: false,
  },
};

// Tela final do cadastro de Host (#326): mostra a situação do cadastro no back-end.
// Logo depois do envio ela é "pendente de validação"; ao retomar, mostra a situação atual
export default function HostUnderReviewScreen() {
  const { data, reset } = useHostRegistration();
  const view = VIEWS[data.status && data.status !== 'draft' ? data.status : 'pending'];
  const isApproved = data.status === 'approved';

  // O cadastro já foi enviado: sair da tela apaga o que ficou em memória
  function goToProfile() {
    reset();
    router.dismissTo('/perfil');
  }

  function goToHome() {
    reset();
    router.dismissTo('/home');
  }

  // Cadastro aprovado: o painel abre por cima do Perfil, e o voltar do painel cai no Perfil
  function openHostPanel() {
    reset();
    router.dismissTo('/perfil');
    router.push('/anfitriao');
  }

  // Só em desenvolvimento: a aprovação real é do Administrador (painel Web), então este atalho
  // mostra o painel do Anfitrião sem esperar por ela
  function previewHostPanel() {
    router.push('/anfitriao');
  }

  // O botão voltar do Android leva ao Perfil, em vez de reabrir as etapas do cadastro
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goToProfile();
      return true;
    });
    return () => subscription.remove();
  });

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.halo}>
          <View style={styles.circle}>
            <Icon color={theme.colors.white} name={view.icon} size={theme.icon.huge} />
          </View>
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {view.title}
        </Text>
        <Text style={styles.subtitle}>{view.subtitle}</Text>

        <View style={styles.card}>
          <StatusPill
            backgroundColor={view.pillBackground}
            color={view.pillColor}
            label={view.pill}
          />
          {view.showNextSteps
            ? NEXT_STEPS.map((step) => (
                <View key={step} style={styles.stepRow}>
                  <Icon color={theme.colors.button} name="check_circle" size={theme.icon.medium} />
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))
            : null}
        </View>

        {isApproved ? (
          <>
            <Button onPress={openHostPanel} title="Abrir painel do Anfitrião" />
            <TouchableOpacity
              accessibilityRole="button"
              onPress={goToProfile}
              style={styles.homeLink}
            >
              <Text style={styles.homeLinkText}>Voltar ao Perfil</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Button onPress={goToProfile} title="Voltar ao Perfil" />
        )}
        <TouchableOpacity accessibilityRole="button" onPress={goToHome} style={styles.homeLink}>
          <Text style={styles.homeLinkText}>Ir para o Início</Text>
        </TouchableOpacity>
        {__DEV__ && !isApproved ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={previewHostPanel}
            style={styles.homeLink}
          >
            <Text style={styles.previewLinkText}>Ver prévia do painel do Anfitrião (só em desenvolvimento)</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    alignItems: 'stretch',
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.page,
  },
  halo: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.rangeFill,
    borderRadius: theme.radius.round,
    padding: theme.spacing.medium,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: theme.colors.button,
    borderRadius: theme.radius.round,
    height: theme.spacing.successCircle,
    justifyContent: 'center',
    width: theme.spacing.successCircle,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.title,
    marginTop: theme.spacing.large,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.card,
    gap: theme.spacing.medium,
    marginTop: theme.spacing.page,
    padding: theme.spacing.large,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  stepText: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  homeLink: {
    alignSelf: 'center',
    marginTop: theme.spacing.large,
  },
  homeLinkText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  previewLinkText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.label,
    textAlign: 'center',
  },
});
