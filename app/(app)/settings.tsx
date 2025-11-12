import React, { useState } from 'react';
import { Platform, StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Divider, Icon, List, Surface, Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { s, vs, ms } from 'react-native-size-matters';
import { useBreakpoints, useResponsiveStyles, useResponsiveValue } from '@/theme/responsive';

const LeftAppearance = (props: any) => <List.Icon {...props} icon="theme-light-dark" />;
const LeftLanguage = (props: any) => <List.Icon {...props} icon="translate" />;
const LeftBell = (props: any) => <List.Icon {...props} icon="bell" />;
const LeftEmail = (props: any) => <List.Icon {...props} icon="email" />;
const LeftShield = (props: any) => <List.Icon {...props} icon="shield-lock" />;
const LeftFingerprint = (props: any) => <List.Icon {...props} icon="fingerprint" />;
const LeftInfo = (props: any) => <List.Icon {...props} icon="information-outline" />;
const LeftBook = (props: any) => <List.Icon {...props} icon="book-open-variant" />;

const RightChevron = (_props: any) => <Icon source="chevron-right" size={24} />;

type ToggleRowStyles = Pick<
  ReturnType<typeof makeStyles>,
  | 'toggleRow'
  | 'toggleRowDense'
  | 'toggleRowRegular'
  | 'toggleContent'
  | 'toggleTitle'
  | 'toggleDesc'
>;

import { Switch } from 'react-native-paper';

function ToggleRow({
  left,
  title,
  description,
  value,
  onChange,
  dense = false,
  styles,
}: {
  left: (props: any) => React.ReactNode;
  title: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  dense?: boolean;
  styles: ToggleRowStyles;
}) {
  return (
    <View>
      <View style={[styles.toggleRow, dense ? styles.toggleRowDense : styles.toggleRowRegular]}>
        {left({})}
        <View style={styles.toggleContent}>
          <Text style={styles.toggleTitle}>{title}</Text>
          {!!description && <Text style={styles.toggleDesc}>{description}</Text>}
        </View>
        <Switch value={value} onValueChange={onChange} accessibilityLabel={title} />
      </View>
      <Divider />
    </View>
  );
}

/* -------------------------------- Screen -------------------------------- */

export default function Settings() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  const headlineVariant = useResponsiveValue({
    base: 'headlineSmall',
    lg: 'headlineMedium',
    xl: 'headlineLarge',
  }) as 'headlineSmall' | 'headlineMedium' | 'headlineLarge';

  return (
    <SafeAreaView style={styles.page} edges={['right', 'bottom', 'left']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Surface style={styles.header} mode="flat" elevation={0}>
          <Text variant={headlineVariant} style={styles.title} accessibilityRole="header">
            Settings
          </Text>
          <Text style={styles.subtitle}>Configure your experience</Text>
        </Surface>

        {/* Grid of sections */}
        <View style={styles.grid}>
          {/* General */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              General
            </Text>
            <List.Section>
              <List.Item
                title="Appearance"
                description="System / Light / Dark"
                left={LeftAppearance}
                right={RightChevron}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Language"
                description="English"
                left={LeftLanguage}
                right={RightChevron}
                onPress={() => {}}
              />
            </List.Section>
          </Surface>

          {/* Notifications */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              Notifications
            </Text>
            <List.Section>
              <ToggleRow
                left={LeftBell}
                title="Push notifications"
                description={pushEnabled ? 'Enabled' : 'Disabled'}
                value={pushEnabled}
                onChange={setPushEnabled}
                styles={styles}
              />
              <ToggleRow
                left={LeftEmail}
                title="Email updates"
                description={emailUpdates ? 'Enabled' : 'Disabled'}
                value={emailUpdates}
                onChange={setEmailUpdates}
                styles={styles}
              />
            </List.Section>
          </Surface>

          {/* Privacy & Security */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              Privacy & Security
            </Text>
            <List.Section>
              <ToggleRow
                left={LeftFingerprint}
                title="Use biometrics"
                description={biometrics ? 'Enabled' : 'Disabled'}
                value={biometrics}
                onChange={setBiometrics}
                styles={styles}
              />
              <List.Item
                title="Two-factor authentication"
                description="Recommended"
                left={LeftShield}
                right={RightChevron}
                onPress={() => {}}
              />
            </List.Section>
          </Surface>

          {/* About */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              About
            </Text>
            <List.Section>
              <List.Item title="Version" description="1.0.0" left={LeftInfo} />
              <Divider />
              <List.Item
                title="Licenses"
                description="Third-party notices"
                left={LeftBook}
                right={RightChevron}
                onPress={() => {}}
              />
            </List.Section>
          </Surface>
        </View>

        {/* Footer actions */}
        <Surface style={styles.footer} mode="flat" elevation={0}>
          <Button
            mode="outlined"
            textColor={theme.colors.error}
            icon="restore"
            onPress={() => {}}
            accessibilityLabel="Reset settings"
          >
            Reset settings
          </Button>
        </Surface>
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
      alignItems: 'center',
    },
    title: { textAlign: 'center' },
    subtitle: {
      marginTop: vs(4),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
      fontSize: ms(15, 0.2),
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

    footer: { marginTop: vs(24), alignItems: 'center' },

    toggleRow: { flexDirection: 'row', alignItems: 'center' },
    toggleRowDense: { paddingVertical: vs(6) },
    toggleRowRegular: { paddingVertical: vs(10) },
    toggleContent: { flex: 1, marginLeft: s(8) },
    toggleTitle: { fontSize: ms(16, 0.2) },
    toggleDesc: {
      fontSize: ms(13, 0.2),
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
    },
  });
}
