import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, IconName } from '../components/Icon';
import { ProfileMenuItem } from '../components/ProfileMenuItem';
import { StatusPill } from '../components/StatusPill';
import { SAMPLE_HOST_PANEL } from '../constants/sampleData';
import { theme } from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { formatCurrency } from '../utils/money';

type PanelItem = {
  key: string;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  // Rota da tela, quando ela já existe. Sem rota, o acesso ainda não faz nada
  route?: '/reservas';
};

// As funções do Anfitrião, na ordem de uso do dia a dia. Vêm dos casos de uso do módulo Host:
// solicitações (HPET12, HPET12a), hospedagem ativa (HPET12b, HPET12c, HPET12d), agenda (HPET11),
// preços (HPET11a), financeiro e repasse (HPET12e, HPET12f), Assistente de IA (HPET06b, HPET06c)
// e perfil (HPET10a, HPET10b)
const PANEL_ITEMS: PanelItem[] = [
  {
    key: 'solicitacoes',
    icon: 'inbox',
    iconBackground: theme.colors.selectedTint,
    iconColor: theme.colors.button,
    title: 'Solicitações de reserva',
    subtitle: 'Veja o pet e o tutor e aceite ou recuse',
    // Lista real das solicitações pendentes (#486 e #492)
    route: '/reservas',
  },
  {
    key: 'hospedagem',
    icon: 'pets',
    iconBackground: theme.colors.greenTint,
    iconColor: theme.colors.green,
    title: 'Hospedagem ativa',
    subtitle: 'Check-in, rotina diária com fotos e check-out',
    badge: `${SAMPLE_HOST_PANEL.activeStays} em andamento`,
  },
  {
    key: 'agenda',
    icon: 'calendar_month',
    iconBackground: theme.colors.blueTint,
    iconColor: theme.colors.blue,
    title: 'Agenda',
    subtitle: 'Datas disponíveis e períodos bloqueados',
  },
  {
    key: 'precos',
    icon: 'sell',
    iconBackground: theme.colors.yellowTint,
    iconColor: theme.colors.yellow,
    title: 'Preços e serviços',
    subtitle: 'Valor da diária mostrado na busca',
  },
  {
    key: 'financeiro',
    icon: 'payments',
    iconBackground: theme.colors.purpleTint,
    iconColor: theme.colors.purple,
    title: 'Financeiro e repasse',
    subtitle: 'Ganhos, transações e pedido de repasse',
  },
  {
    key: 'assistente',
    icon: 'smart_toy',
    iconBackground: theme.colors.iconBackground,
    iconColor: theme.colors.icon,
    title: 'Assistente de IA e conversas',
    subtitle: 'Perguntas frequentes e conversas escaladas',
  },
  {
    key: 'perfil',
    icon: 'home_work',
    iconBackground: theme.colors.selectedTint,
    iconColor: theme.colors.button,
    title: 'Perfil do Anfitrião',
    subtitle: 'Editar estrutura, capacidade e documentos, ou inativar',
  },
];

// Painel do Anfitrião (#326): a tela que o usuário vê depois que o cadastro de Host é aprovado.
// ESQUELETO: os números de ganhos, saldo e hospedagem são de exemplo, e só "Solicitações de reserva"
// tem tela (a lista real da #486). A estrutura segue os casos de uso do módulo Host; cada item
// restante vira uma tela nas tasks do Host (jornada J08)
export default function HostPanelScreen() {
  const { currentUser } = useSession();
  const firstName = currentUser?.user?.name?.split(' ')[0] ?? 'Anfitrião';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <View style={styles.logoBox}>
              <Icon color={theme.colors.button} name="home_work" size={theme.icon.large} />
            </View>
            <View>
              <Text accessibilityRole="header" style={styles.pageTitle}>
                Painel do Anfitrião
              </Text>
              <Text style={styles.greeting}>Olá, {firstName}</Text>
            </View>
          </View>
          <TouchableOpacity
            accessibilityLabel="Notificações"
            accessibilityRole="button"
            style={styles.headerButton}
          >
            <Icon color={theme.colors.title} name="notifications" size={theme.icon.medium} />
          </TouchableOpacity>
        </View>

        <View style={styles.welcome}>
          <View style={styles.welcomeIcon}>
            <Icon color={theme.colors.white} name="check" size={theme.icon.large} />
          </View>
          <View style={styles.welcomeTexts}>
            <StatusPill
              backgroundColor={theme.colors.white}
              color={theme.colors.green}
              label="Cadastro aprovado"
            />
            <Text style={styles.welcomeTitle}>Você agora é um Anfitrião!</Text>
            <Text style={styles.welcomeText}>
              Seu perfil já aparece nas buscas e você pode receber solicitações de reserva.
            </Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ganhos do mês</Text>
            <Text style={styles.statValue}>{formatCurrency(SAMPLE_HOST_PANEL.monthEarnings)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Saldo disponível</Text>
            <Text style={styles.statValue}>
              {formatCurrency(SAMPLE_HOST_PANEL.availableBalance)}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.menuCard]}>
          {PANEL_ITEMS.map((item, index) => (
            <View key={item.key} style={index > 0 && styles.menuDivider}>
              <ProfileMenuItem
                badge={item.badge}
                icon={item.icon}
                iconBackground={item.iconBackground}
                iconColor={item.iconColor}
                onPress={item.route ? () => router.push(item.route!) : undefined}
                subtitle={item.subtitle}
                title={item.title}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.dismissTo('/home')}
          style={styles.switchMode}
        >
          <Icon color={theme.colors.button} name="swap_horiz" size={theme.icon.medium} />
          <Text style={styles.switchModeText}>Voltar ao modo Tutor</Text>
        </TouchableOpacity>

        <Text style={styles.sampleNote}>
          Prévia com valores de exemplo. Os itens ainda não têm tela.
        </Text>
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
    gap: theme.spacing.section,
    padding: theme.spacing.page,
    paddingBottom: theme.spacing.page * 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.input,
    height: theme.spacing.bell,
    justifyContent: 'center',
    width: theme.spacing.bell,
  },
  pageTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  greeting: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.label,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.iconButton,
    borderRadius: theme.radius.round,
    boxShadow: theme.shadow.soft,
    height: theme.spacing.bell,
    justifyContent: 'center',
    width: theme.spacing.bell,
  },
  welcome: {
    backgroundColor: theme.colors.greenTint,
    borderRadius: theme.radius.card,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    padding: theme.spacing.large,
  },
  welcomeIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.green,
    borderRadius: theme.radius.round,
    height: theme.spacing.menuIcon,
    justifyContent: 'center',
    width: theme.spacing.menuIcon,
  },
  welcomeTexts: {
    flex: 1,
    gap: theme.spacing.tiny,
  },
  welcomeTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.modalTitle,
    marginTop: theme.spacing.tiny,
  },
  welcomeText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  statCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.soft,
    flex: 1,
    padding: theme.spacing.large,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.label,
  },
  statValue: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
    marginTop: theme.spacing.tiny,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.soft,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuDivider: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
  },
  switchMode: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
    justifyContent: 'center',
    minHeight: theme.spacing.footer,
  },
  switchModeText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.button,
  },
  sampleNote: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    textAlign: 'center',
  },
});
