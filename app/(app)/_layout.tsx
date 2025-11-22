import { BrandLogoSmall } from '@/components/BrandLogo';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useBreakpoints } from '@/theme/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { s } from 'react-native-size-matters';

function HeaderTitle() {
  return <BrandLogoSmall size={24} />;
}
const HeaderRight = () => <ThemeSwitcher />;

type IconProps = { color: string; size: number; focused: boolean };
const clamp = (val: number) => Math.min(s(val), 26);

const HomeIcon = ({ color, size }: IconProps) => (
  <Ionicons name="home" color={color} size={clamp(size)} />
);

const SettingsIcon = ({ color, size }: IconProps) => (
  <Ionicons name="settings-outline" color={color} size={clamp(size)} />
);

// ✅ NEW icon
const StatisticsIcon = ({ color, size }: IconProps) => (
  <Ionicons name="stats-chart-outline" color={color} size={clamp(size)} />
);

export default function AppLayout() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const status = useAuthStatus();

  // --- AUTH GUARD ---
  if (status === 'loading') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === 'authenticated-partial') {
    return <Redirect href="/(auth)/complete-profile" />;
  }

  // status === 'authenticated-full'

  const drawerWidth = bp.isXL ? 360 : bp.isLG ? 320 : bp.isMD ? 300 : undefined;
  const drawerType: 'permanent' | 'front' | 'slide' = bp.isXL
    ? 'permanent'
    : bp.isLG || bp.isMD
      ? 'slide'
      : 'front';
  const headerLeft = bp.isXL ? () => null : undefined;

  return (
    <Drawer
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

      <Drawer.Screen
        name="statistics/index"
        options={{ title: 'Statistics', drawerIcon: StatisticsIcon }}
      />

      <Drawer.Screen name="settings" options={{ title: 'Settings', drawerIcon: SettingsIcon }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
