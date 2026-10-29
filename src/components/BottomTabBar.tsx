import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon, IconName } from './Icon';

export type TabKey = 'home' | 'buscar' | 'reservas' | 'perfil';

type Tab = {
  icon: IconName;
  key: TabKey;
  label: string;
};

type BottomTabBarProps = {
  activeTab: TabKey;
  onChangeTab: (key: TabKey) => void;
};

const TABS: Tab[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'buscar', label: 'Buscar', icon: 'search' },
  { key: 'reservas', label: 'Reservas', icon: 'calendar_month' },
  { key: 'perfil', label: 'Perfil', icon: 'person' },
];

// Barra de navegacao inferior; a aba ativa fica dentro de um quadrado laranja
export function BottomTabBar({ activeTab, onChangeTab }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const color = isActive ? theme.colors.white : theme.colors.title;

        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityLabel={tab.label}
            onPress={() => onChangeTab(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Icon color={color} name={tab.icon} size={theme.icon.large} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.tabBar,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: theme.spacing.tabBar,
    paddingHorizontal: theme.spacing.small,
    shadowColor: theme.colors.title,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  tab: {
    alignItems: 'center',
    borderRadius: theme.radius.tabItem,
    height: theme.spacing.tabItem,
    justifyContent: 'center',
    width: theme.spacing.tabItem,
  },
  tabActive: {
    backgroundColor: theme.colors.button,
  },
  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.tabLabel,
    marginTop: theme.spacing.tiny / 2,
  },
});
