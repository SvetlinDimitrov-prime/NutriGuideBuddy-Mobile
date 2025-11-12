import { useResponsiveValue } from '@/theme/responsive';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Avatar, Button, Divider, Icon, List, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';

/* ----------------- stable render helpers (module scope) ----------------- */
const LeftAccount = (props: any) => <List.Icon {...props} icon="account" />;
const LeftEmail = (props: any) => <List.Icon {...props} icon="email" />;
const LeftPhone = (props: any) => <List.Icon {...props} icon="phone" />;
const LeftTheme = (props: any) => <List.Icon {...props} icon="theme-light-dark" />;
const LeftTranslate = (props: any) => <List.Icon {...props} icon="translate" />;
const LeftBell = (props: any) => <List.Icon {...props} icon="bell" />;
const LeftLock = (props: any) => <List.Icon {...props} icon="lock" />;
const LeftShield = (props: any) => <List.Icon {...props} icon="shield-check" />;
const LeftDevices = (props: any) => <List.Icon {...props} icon="devices" />;

const RightChevron = (_props: any) => <Icon source="chevron-right" size={24} />;
const RightChange = (_props: any) => (
  <Button compact onPress={() => {}}>
    Change
  </Button>
);
const RightSetup = (_props: any) => (
  <Button compact onPress={() => {}}>
    Set up
  </Button>
);

export default function Profile() {
  const theme = useTheme();
  const router = useRouter();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();

  const bottomSpacerStyle = useMemo(() => ({ height: insets.bottom }), [insets.bottom]);

  const headlineVariant = useResponsiveValue({
    base: 'headlineSmall',
    lg: 'headlineMedium',
    xl: 'headlineLarge',
  }) as 'headlineSmall' | 'headlineMedium' | 'headlineLarge';

  return (
    <SafeAreaView style={styles.page} edges={['right', 'bottom', 'left']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header — identical approach to Settings */}
        <Surface style={styles.header} mode="flat" elevation={0}>
          <Avatar.Text
            size={useResponsiveValue({ base: 72, md: 84, lg: 96, xl: 112 })}
            label="U"
            style={styles.avatar}
            color={theme.colors.onPrimary}
            labelStyle={{ fontSize: ms(28, 0.2) }}
          />
          <View style={styles.headerTextWrap}>
            <Text variant={headlineVariant} style={styles.title} accessibilityRole="header">
              Profile
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              username@example.com
            </Text>
            <View style={styles.headerActions}>
              <Button mode="contained" onPress={() => {}}>
                Edit profile
              </Button>
              <Button mode="outlined" onPress={() => {}}>
                View activity
              </Button>
            </View>
          </View>
        </Surface>

        {/* SINGLE-COLUMN grid (phones) — same visual rhythm as Settings */}
        <View style={styles.grid}>
          {/* Personal info */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              Personal info
            </Text>
            <List.Section>
              <List.Item title="Name" description="User Name" left={LeftAccount} />
              <Divider />
              <List.Item title="Email" description="username@example.com" left={LeftEmail} />
              <Divider />
              <List.Item title="Phone" description="+1 555 0100" left={LeftPhone} />
            </List.Section>
            <View style={styles.cardActions}>
              <Button mode="text" onPress={() => {}}>
                Manage
              </Button>
            </View>
          </Surface>

          {/* Preferences (navigate into Settings) */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              Preferences
            </Text>
            <List.Section>
              <List.Item
                title="Notifications"
                description="Push, email"
                left={LeftBell}
                right={RightChevron}
                onPress={() => router.push('/settings')}
                accessibilityLabel="Open notifications settings"
              />
              <Divider />
              <List.Item
                title="Theme"
                description="System / Light / Dark"
                left={LeftTheme}
                right={RightChevron}
                onPress={() => router.push('/settings')}
              />
              <Divider />
              <List.Item
                title="Language"
                description="English"
                left={LeftTranslate}
                right={RightChevron}
                onPress={() => router.push('/settings')}
              />
            </List.Section>
          </Surface>

          {/* Security */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              Security
            </Text>
            <List.Section>
              <List.Item
                title="Password"
                description="Last changed 2 months ago"
                left={LeftLock}
                right={RightChange}
              />
              <Divider />
              <List.Item
                title="Two-factor authentication"
                description="Recommended"
                left={LeftShield}
                right={RightSetup}
              />
              <Divider />
              <List.Item
                title="Sign-in devices"
                description="3 devices"
                left={LeftDevices}
                right={RightChevron}
                onPress={() => router.push('/settings')}
              />
            </List.Section>
            <View style={styles.cardActions}>
              <Button mode="contained-tonal" onPress={() => {}}>
                Review security
              </Button>
            </View>
          </Surface>
        </View>

        <Surface style={styles.footer} mode="flat" elevation={0}>
          <Button
            mode="outlined"
            textColor={theme.colors.error}
            icon="logout"
            onPress={() => {}}
            accessibilityLabel="Sign out"
          >
            Sign out
          </Button>
        </Surface>
        <View style={bottomSpacerStyle} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: MD3Theme) {
  const padX = s(16);
  const padY = vs(16);
  const gridGap = s(16);

  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: padX, paddingTop: padY, paddingBottom: padY },
    header: {
      paddingHorizontal: padX,
      paddingVertical: padY,
      borderRadius: s(12),
      backgroundColor: theme.colors.surface,
      flexDirection: 'column',
      alignItems: 'center',
      gap: s(12),
    },
    avatar: { backgroundColor: theme.colors.primary },
    headerTextWrap: {
      alignItems: 'center',
      alignSelf: 'stretch',
    },
    title: { textAlign: 'center' },
    subtitle: {
      marginTop: vs(4),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
      fontSize: ms(15, 0.2),
    },
    headerActions: {
      marginTop: vs(12),
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      justifyContent: 'center',
    },

    grid: {
      marginTop: vs(16),
      flexDirection: 'column',
      gap: gridGap,
    },
    card: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      paddingHorizontal: padX,
      paddingVertical: padY,
    },
    cardTitle: {
      fontSize: ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '600' : '700',
      marginBottom: vs(8),
    },
    cardActions: { marginTop: vs(8), alignSelf: 'flex-start' },

    footer: { marginTop: vs(24), alignItems: 'center' },
  });
}
