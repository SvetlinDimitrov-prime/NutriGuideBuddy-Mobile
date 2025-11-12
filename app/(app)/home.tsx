import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Chip, Divider, List, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';
import { useBreakpoints, useResponsiveStyles, useResponsiveValue } from '@/theme/responsive';

/* ---------- stable render helpers (no inline components) ---------- */
const LeftBell = (props: any) => <List.Icon {...props} icon="bell-outline" />;
const LeftAccountEdit = (props: any) => <List.Icon {...props} icon="account-edit" />;
const LeftCog = (props: any) => <List.Icon {...props} icon="cog-outline" />;

export default function Home() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const insets = useSafeAreaInsets();

  const headlineVariant = useResponsiveValue({
    base: 'headlineSmall',
    lg: 'headlineMedium',
    xl: 'headlineLarge',
  }) as 'headlineSmall' | 'headlineMedium' | 'headlineLarge';

  const styles = useResponsiveStyles(theme, bp, makeStyles);

  return (
    <Surface mode="flat" elevation={0} style={styles.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: styles.scrollContent.paddingBottom + insets.bottom },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            variant={headlineVariant}
            style={styles.title}
            accessibilityRole="header"
            {...(Platform.OS === 'web' ? { accessibilityLevel: 1 as any } : {})}
          >
            Home
          </Text>
          <Text style={styles.subtitle}>This is your main screen.</Text>
        </View>

        {/* Quick actions (compact Surface, no stretching) */}
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsRow}>
            <Button mode="contained" icon="plus" onPress={() => {}}>
              Add new
            </Button>
            <Button mode="outlined" icon="magnify" onPress={() => {}}>
              Search
            </Button>
            <Button mode="outlined" icon="share-variant" onPress={() => {}}>
              Share
            </Button>
          </View>
        </Surface>

        {/* Grid (no flexGrow, so no huge empty space) */}
        <View style={styles.grid}>
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.sectionTitle}>Today</Text>

            <View style={styles.filters}>
              <Chip selected>All</Chip>
              <Chip>Important</Chip>
              <Chip>Done</Chip>
            </View>

            <List.Section>
              <List.Item
                title="Check notifications"
                description="Review recent updates"
                left={LeftBell}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Update profile"
                description="Keep your info fresh"
                left={LeftAccountEdit}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Review settings"
                description="Privacy & preferences"
                left={LeftCog}
                onPress={() => {}}
              />
            </List.Section>
          </Surface>

          <Surface style={styles.card} elevation={1}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <Text style={styles.insightText}>
              You’re all set! Explore features, tweak preferences, or jump into your most common
              actions.
            </Text>
            <View style={styles.inlineButtons}>
              <Button mode="contained-tonal" icon="palette" onPress={() => {}}>
                Theme
              </Button>
              <Button mode="contained-tonal" icon="translate" onPress={() => {}}>
                Language
              </Button>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </Surface>
  );
}

function makeStyles(
  theme: MD3Theme,
  bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const padX = bp.isXL ? s(32) : bp.isLG ? s(28) : bp.isMD ? s(20) : s(16);
  const padY = bp.isXL ? vs(28) : bp.isLG ? vs(24) : bp.isMD ? vs(20) : vs(16);
  const gridGap = bp.isXL ? s(24) : bp.isLG ? s(20) : s(16);
  const twoCols = bp.isLG || bp.isXL;
  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';

  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: {
      paddingHorizontal: padX,
      paddingTop: padY,
      paddingBottom: padY,
      alignItems: 'stretch',
    },

    header: { alignItems: 'center' },
    title: { textAlign: 'center', marginTop: vs(4) },
    subtitle: {
      marginTop: vs(6),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
      fontSize: ms(15, 0.2),
    },

    section: {
      marginTop: vs(12),
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      paddingHorizontal: padX,
      paddingVertical: padY,
      alignSelf: 'center',
      width: '100%',
      maxWidth,
    },
    sectionTitle: {
      fontSize: ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '600' : '700',
      marginBottom: vs(8),
    },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
      justifyContent: 'center',
      marginTop: vs(4),
    },

    grid: {
      marginTop: vs(16),
      flexDirection: twoCols ? 'row' : 'column',
      gap: gridGap,
      alignSelf: 'center',
      width: '100%',
      maxWidth,
    },
    card: {
      // IMPORTANT: no flexGrow → the card height fits content (no huge blank space)
      flexBasis: twoCols ? '48%' : '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      paddingHorizontal: padX,
      paddingVertical: padY,
    },

    filters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginBottom: vs(8),
    },
    insightText: {
      color: theme.colors.onSurfaceVariant,
      opacity: 0.95,
      fontSize: ms(15, 0.2),
      marginBottom: vs(10),
    },
    inlineButtons: {
      flexDirection: 'row',
      gap: s(10),
      flexWrap: 'wrap',
    },
  });
}
