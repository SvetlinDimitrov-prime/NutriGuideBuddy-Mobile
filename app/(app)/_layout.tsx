import { BrandLogoSmall } from '@/components/BrandLogo';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useBreakpoints } from '@/theme/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { s, vs, ms } from 'react-native-size-matters';

import {
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';

// ✅ Safe area for notch / camera island (TOP only)
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function HeaderTitle() {
  return <BrandLogoSmall size={24} />;
}
const HeaderRight = () => <ThemeSwitcher />;

type IconProps = { color: string; size: number; focused: boolean };
const clamp = (val: number) => Math.min(s(val), 26);

const HomeIcon = ({ color, size }: IconProps) => (
  <Ionicons name="home-outline" color={color} size={clamp(size)} />
);
const SettingsIcon = ({ color, size }: IconProps) => (
  <Ionicons name="settings-outline" color={color} size={clamp(size)} />
);
const CaloriesIcon = ({ color, size }: IconProps) => (
  <Ionicons name="flame-outline" color={color} size={clamp(size)} />
);
const NutrientsIcon = ({ color, size }: IconProps) => (
  <Ionicons name="nutrition-outline" color={color} size={clamp(size)} />
);
const TrendsIcon = ({ color, size }: IconProps) => (
  <Ionicons name="stats-chart-outline" color={color} size={clamp(size)} />
);

// --- route grouping ---
const MAIN_ROUTES = ['home'] as const;
const STATS_ROUTES = ['calories', 'nutrients', 'trends'] as const;
const OTHER_ROUTES = ['settings'] as const;

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, descriptors, navigation } = props;

  const currentRouteName = state.routes[state.index]?.name;

  const renderItem = (routeName: string) => {
    // ✅ find real route so we can use route.key for descriptors
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return null;

    const focused = currentRouteName === routeName;
    const descriptor = descriptors[route.key];
    const options = descriptor?.options ?? {};

    const label = options.title ?? routeName;
    const drawerIcon = options.drawerIcon as any;

    return (
      <DrawerItem
        key={route.key}
        label={label}
        focused={focused}
        onPress={() => navigation.navigate(routeName as never)}
        icon={({ color, size }) => drawerIcon?.({ color, size, focused }) ?? null}
        activeTintColor={theme.colors.primary}
        inactiveTintColor={theme.colors.onSurfaceVariant}
        activeBackgroundColor={theme.colors.primaryContainer}
        inactiveBackgroundColor="transparent"
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
    );
  };

  return (
    // ✅ protect TOP notch only; avoid bottom double-padding
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.colors.surface }]}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.drawerContent,
          {
            paddingTop: insets.top + vs(6),
            paddingBottom: vs(10), // small controlled bottom padding
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Main</Text>
        <View style={styles.sectionBlock}>{MAIN_ROUTES.map(renderItem)}</View>

        <Text style={styles.sectionTitle}>Statistics</Text>
        <Text style={styles.sectionSubtitle}>Insights & trends over time</Text>
        <View style={styles.sectionBlock}>{STATS_ROUTES.map(renderItem)}</View>

        <Text style={styles.sectionTitle}>Other</Text>
        <View style={styles.sectionBlock}>{OTHER_ROUTES.map(renderItem)}</View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

export default function AppLayout() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const status = useAuthStatus();

  if (status === 'loading') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
  if (status === 'authenticated-partial') return <Redirect href="/(auth)/complete-profile" />;

  const drawerWidth = bp.isXL ? 360 : bp.isLG ? 320 : bp.isMD ? 300 : undefined;
  const drawerType: 'permanent' | 'front' | 'slide' = bp.isXL
    ? 'permanent'
    : bp.isLG || bp.isMD
      ? 'slide'
      : 'front';
  const headerLeft = bp.isXL ? () => null : undefined;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitle: HeaderTitle,
        headerRight: HeaderRight,
        headerLeft,

        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
          borderBottomWidth: Platform.OS === 'web' ? StyleSheet.hairlineWidth : 0.5,
        },
        headerShadowVisible: false,
        headerTintColor: theme.colors.onSurface,

        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerActiveBackgroundColor: theme.colors.primaryContainer,
        drawerInactiveBackgroundColor: 'transparent',

        drawerType,
        drawerStyle: {
          width: drawerWidth,
          borderRightColor: theme.colors.outlineVariant,
          borderRightWidth: Platform.OS === 'web' ? 1 : StyleSheet.hairlineWidth,
          backgroundColor: theme.colors.surface,
        },

        headerRightContainerStyle: { paddingRight: s(8) },
        headerLeftContainerStyle: { paddingLeft: s(8) },

        swipeEnabled: !bp.isXL,
        drawerHideStatusBarOnOpen: !bp.isXL,
      }}
    >
      <Drawer.Screen name="home" options={{ title: 'Home', drawerIcon: HomeIcon }} />
      <Drawer.Screen name="calories" options={{ title: 'Calories', drawerIcon: CaloriesIcon }} />
      <Drawer.Screen name="nutrients" options={{ title: 'Nutrients', drawerIcon: NutrientsIcon }} />
      <Drawer.Screen name="trends" options={{ title: 'Trends', drawerIcon: TrendsIcon }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings', drawerIcon: SettingsIcon }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  safeArea: {
    flex: 1,
  },

  drawerContent: {
    paddingHorizontal: s(6),
    gap: vs(10),
  },

  sectionTitle: {
    fontSize: ms(11, 0.2),
    fontWeight: '800',
    opacity: 0.75,
    paddingHorizontal: s(10),
    marginTop: vs(2),
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  sectionSubtitle: {
    fontSize: ms(10, 0.2),
    fontWeight: '600',
    opacity: 0.6,
    paddingHorizontal: s(10),
    marginTop: vs(-6),
    marginBottom: vs(2),
    color: '#999',
  },

  sectionBlock: {
    gap: vs(2),
  },

  drawerItem: {
    borderRadius: s(14),
    marginHorizontal: s(6),
  },

  drawerLabel: {
    fontSize: ms(12, 0.2),
    fontWeight: '700',
  },
});
