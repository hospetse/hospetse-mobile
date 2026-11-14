import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar, TabKey } from '../components/BottomTabBar';
import { Button } from '../components/Button';
import { Icon, IconName } from '../components/Icon';
import { ProfileMenuItem } from '../components/ProfileMenuItem';
import { SearchFilters, SearchModal } from '../components/SearchModal';
import { StatusPill } from '../components/StatusPill';
import { theme } from '../constants/theme';
import { usePets } from '../context/PetsContext';
import { useSession } from '../context/SessionContext';
import { toSearchParams } from '../utils/searchParams';

type MenuItem = {
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  key: string;
  subtitle: string;
  title: string;
  badge?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { key: 'pagamento', icon: 'credit_card', iconBackground: theme.colors.blueTint, iconColor: theme.colors.blue, title: 'Formas de Pagamento & Cartões', subtitle: 'Cartões salvos para pagar as estadias' },
  { key: 'enderecos', icon: 'location_on', iconBackground: theme.colors.yellowTint, iconColor: theme.colors.yellow, title: 'Endereços Cadastrados', subtitle: 'Casa principal, trabalho e outros' },
  { key: 'vacinacao', icon: 'medical_services', iconBackground: theme.colors.greenTint, iconColor: theme.colors.green, title: 'Carteira de Vacinação & Saúde', subtitle: 'Vermífugos, V10 e Raiva' },
  { key: 'notificacoes', icon: 'tune', iconBackground: theme.colors.purpleTint, iconColor: theme.colors.purple, title: 'Notificações & Preferências', subtitle: 'Avisos de estadias, fotos diárias' },
];

export default function PerfilScreen() {
  const { currentUser, logout } = useSession();
  const { pets, loading: petsLoading } = usePets();
  const [searchOpen, setSearchOpen] = useState(false);
  const userName = currentUser?.user?.name || 'Usuário';
  const userEmail = currentUser?.user?.email;
  const version = Constants.expoConfig?.version;
  const petSummaries = pets.map((pet) => ({ id: pet.id, imageUri: null, name: pet.name }));
  const isProfileIncomplete = currentUser?.profile?.status === 'incomplete';
  const profileItem: MenuItem = {
    key: 'perfil', icon: 'edit', iconBackground: theme.colors.selectedTint, iconColor: theme.colors.button,
    title: isProfileIncomplete ? 'Completar perfil' : 'Editar perfil',
    subtitle: isProfileIncomplete ? 'Complete seus dados para contratar serviços' : 'Atualize seus dados pessoais',
    badge: isProfileIncomplete ? 'Pendente' : undefined,
  };

  function handleChangeTab(key: TabKey) {
    if (key === 'home') router.dismissTo('/home');
    else if (key === 'buscar') setSearchOpen(true);
    else if (key === 'reservas') router.push('/reservas');
  }

  function handleSearch(filters: SearchFilters) {
    router.push({ pathname: '/resultados', params: toSearchParams(filters) });
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <View style={styles.logoBox}><Icon color={theme.colors.button} name="pets" size={theme.icon.large} /></View>
            <Text accessibilityRole="header" style={styles.pageTitle}>Meu Perfil</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity accessibilityLabel="Notificações" accessibilityRole="button" style={styles.headerButton}>
              <Icon color={theme.colors.title} name="notifications" size={theme.icon.medium} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Configurações" accessibilityRole="button" style={styles.headerButton}>
              <Icon color={theme.colors.title} name="settings" size={theme.icon.medium} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.avatar}><Icon color={theme.colors.button} name="person" size={theme.icon.huge} /></View>
          <Text style={styles.name}>{userName}</Text>
          {userEmail ? <View style={styles.contact}><Icon color={theme.colors.button} name="mail" size={theme.icon.medium} /><Text style={styles.contactText}>{userEmail}</Text></View> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}><Icon color={theme.colors.button} name="pets" size={theme.icon.large} /></View>
            <View style={styles.texts}><Text style={styles.cardTitle}>Meus Pets</Text><Text style={styles.cardSubtitle}>{pets.length ? `${pets.length} pet${pets.length === 1 ? '' : 's'} cadastrado${pets.length === 1 ? '' : 's'}` : 'Fichas veterinárias & rotinas'}</Text></View>
            {petsLoading ? null : <StatusPill backgroundColor={theme.colors.selectedTint} color={theme.colors.subtitle} label={pets.length ? 'Atualizado' : 'Comece agora'} />}
          </View>
          <Button icon="arrow_forward" onPress={() => router.push('/pets')} title="Acessar Meus Pets" />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text accessibilityRole="header" style={styles.sectionLabel}>MINHA CONTA</Text><Text style={styles.sectionHint}>Preferências & Dados</Text></View>
          <View style={[styles.card, styles.menuCard]}>
            {[...MENU_ITEMS, profileItem].map((item, index) => (
              <View key={item.key} style={index > 0 ? styles.menuDivider : undefined}>
                <ProfileMenuItem badge={item.badge} icon={item.icon} iconBackground={item.iconBackground} iconColor={item.iconColor} subtitle={item.subtitle} title={item.title} />
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity accessibilityLabel="Sair da conta" accessibilityRole="button" onPress={handleLogout} style={styles.logout}>
          <Icon color={theme.colors.error} name="logout" size={theme.icon.medium} /><Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>{`Hospetse App${version ? ` v${version}` : ''} • Feito com amor para pets`}</Text>
      </ScrollView>

      <View style={styles.tabBarWrapper}><BottomTabBar activeTab="perfil" onChangeTab={handleChangeTab} /></View>
      <SearchModal
        onAddPet={() => { setSearchOpen(false); router.push('/pets/cadastro'); }}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
        pets={petSummaries}
        petsLoading={petsLoading}
        visible={searchOpen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.background, flex: 1 },
  content: { gap: theme.spacing.section, paddingBottom: theme.spacing.tabBar + theme.spacing.page * 2, paddingHorizontal: theme.spacing.page, paddingTop: theme.spacing.large },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  logoBox: { alignItems: 'center', backgroundColor: theme.colors.selectedTint, borderRadius: theme.radius.input, height: theme.spacing.bell, justifyContent: 'center', width: theme.spacing.bell },
  pageTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small },
  headerButton: { alignItems: 'center', backgroundColor: theme.colors.iconButton, borderRadius: theme.radius.round, boxShadow: theme.shadow.soft, height: theme.spacing.bell, justifyContent: 'center', width: theme.spacing.bell },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, padding: theme.spacing.large },
  profileCard: { alignItems: 'center' },
  avatar: { alignItems: 'center', backgroundColor: theme.colors.selectedTint, borderColor: theme.colors.button, borderRadius: theme.radius.round, borderWidth: 2, height: theme.spacing.profileAvatar, justifyContent: 'center', width: theme.spacing.profileAvatar },
  name: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.modalTitle, marginTop: theme.spacing.medium, textAlign: 'center' },
  contact: { alignItems: 'center', alignSelf: 'stretch', flexDirection: 'row', gap: theme.spacing.tiny, justifyContent: 'center', marginTop: theme.spacing.small },
  contactText: { color: theme.colors.text, flexShrink: 1, fontFamily: theme.fonts.regular, fontSize: theme.typography.label },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  iconBox: { alignItems: 'center', backgroundColor: theme.colors.selectedTint, borderRadius: theme.radius.input, height: theme.spacing.menuIcon, justifyContent: 'center', width: theme.spacing.menuIcon },
  texts: { flex: 1 },
  cardTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.userName },
  cardSubtitle: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption },
  section: { gap: theme.spacing.small },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionLabel: { color: theme.colors.textMuted, fontFamily: theme.fonts.bold, fontSize: theme.typography.caption },
  sectionHint: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption },
  menuCard: { overflow: 'hidden', padding: 0 },
  menuDivider: { borderTopColor: theme.colors.divider, borderTopWidth: 1 },
  logout: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.small, justifyContent: 'center', minHeight: theme.spacing.footer },
  logoutText: { color: theme.colors.error, fontFamily: theme.fonts.bold, fontSize: theme.typography.button },
  footer: { color: theme.colors.textMuted, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption, textAlign: 'center' },
  tabBarWrapper: { bottom: theme.spacing.large, left: theme.spacing.page, position: 'absolute', right: theme.spacing.page },
});
