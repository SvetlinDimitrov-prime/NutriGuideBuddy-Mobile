import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { s } from 'react-native-size-matters';

import { BrandLogoSmall } from '@/components/BrandLogo';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useBreakpoints } from '@/theme/responsive';

/* ---------- Stable header components ---------- */
function HeaderTitle() {
  // Removed accessibilityLabel (not in BrandLogoSmall props)
  return <BrandLogoSmall size={24} />;
}

const HeaderRight = () => <ThemeSwitcher />;

/* ---------- Stable drawer icons ---------- */
type IconProps = { color: string; size: number; focused: boolean };
const clamp = (val: number) => Math.min(s(val), 26);

function HomeIcon({ color, size }: IconProps) {
  return <Ionicons name="home" color={color} size={clamp(size)} />;
}
function ProfileIcon({ color, size }: IconProps) {
  return <Ionicons name="person-circle" color={color} size={clamp(size)} />;
}
function SettingsIcon({ color, size }: IconProps) {
  return <Ionicons name="settings" color={color} size={clamp(size)} />;
}

/* ---------- Layout ---------- */
// ...
export default function AppLayout() {
  const theme = useTheme();
  const bp = useBreakpoints();

  // Width + behavior
  const drawerWidth = bp.isXL ? 360 : bp.isLG ? 320 : bp.isMD ? 300 : undefined;

  // Use 'permanent' only on XL. On LG/MD use 'slide' (togglable). On SM use 'front'.
  const drawerType: 'permanent' | 'front' | 'slide' = bp.isXL
    ? 'permanent'
    : bp.isLG || bp.isMD
      ? 'slide'
      : 'front';

  // If you want to hide the header hamburger when permanent:
  const headerLeft = bp.isXL ? () => null : undefined;

  return (
    <Drawer
      screenOptions={{
        headerTitle: HeaderTitle,
        headerRight: HeaderRight,
        headerLeft,

        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,

        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerActiveBackgroundColor: theme.colors.primaryContainer,
        drawerInactiveBackgroundColor: 'transparent',

        drawerType,
        drawerStyle: {
          width: drawerWidth,
          borderRightColor: theme.colors.outlineVariant,
          borderRightWidth: Platform.OS === 'web' ? 1 : 0,
          backgroundColor: theme.colors.surface,
        },

        headerRightContainerStyle: { paddingRight: s(8) },
        headerLeftContainerStyle: { paddingLeft: s(8) },
        // nice-to-have on phones:
        swipeEnabled: !bp.isXL, // allow swipe to open/close when not permanent
        drawerHideStatusBarOnOpen: !bp.isXL, // cosmetic on native
      }}
    >
      <Drawer.Screen name="home" options={{ title: 'Home', drawerIcon: HomeIcon }} />
      <Drawer.Screen name="profile" options={{ title: 'Profile', drawerIcon: ProfileIcon }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings', drawerIcon: SettingsIcon }} />
    </Drawer>
  );
}
