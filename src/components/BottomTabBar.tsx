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

// Barra de navegacao inferior: cada aba ocupa a mesma largura
// e a aba ativa fica dentro de um quadrado laranja
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
            style={styles.tab}
          >
            <View style={[styles.item, isActive && styles.itemActive]}>
              <Icon color={color} name={tab.icon} size={theme.icon.medium} />
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </View>
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
    boxShadow: theme.shadow.bar,
    flexDirection: 'row',
    height: theme.spacing.tabBar,
    paddingHorizontal: theme.spacing.small,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  item: {
    alignItems: 'center',
    borderRadius: theme.radius.tabItem,
    height: theme.spacing.tabItemHeight,
    justifyContent: 'center',
    width: theme.spacing.tabItemWidth,
  },
  itemActive: {
    backgroundColor: theme.colors.button,
    boxShadow: theme.shadow.active,
  },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.tabLabel,
    marginTop: theme.spacing.tiny / 2,
  },
});
