// src/components/auth/DevLoginCard.tsx
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

import { DEV_USER_KEYS, DevUserKey } from '@/api/types/auth';

type Props = {
  disabled: boolean;
  loading: boolean;
  onLogin: (userKey: DevUserKey) => void;
};

export default function DevLoginCard({ disabled, loading, onLogin }: Props) {
  const theme = useTheme();
  const [devUser, setDevUser] = useState<DevUserKey>('USER1');
  const [menuVisible, setMenuVisible] = useState(false);

  const devUserLabel = useMemo(() => devUser.replace('USER', 'User '), [devUser]);

  const handleLogin = () => {
    if (disabled) return;
    onLogin(devUser);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text style={[styles.badgeText, { color: theme.colors.onPrimaryContainer }]}>DEV</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Quick login as seeded user
        </Text>
      </View>

      <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        Uses one of the predefined demo accounts. This is only available in development builds.
      </Text>

      <View style={styles.row}>
        <Button
          mode="outlined"
          icon="account"
          onPress={handleLogin}
          disabled={disabled}
          loading={loading}
          style={styles.loginButton}
          contentStyle={styles.loginButtonContent}
          labelStyle={styles.loginButtonLabel}
        >
          Continue as {devUserLabel}
        </Button>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="chevron-down"
              size={22}
              onPress={() => setMenuVisible(true)}
              disabled={disabled}
            />
          }
        >
          {DEV_USER_KEYS.map((key) => (
            <Menu.Item
              key={key}
              title={key.replace('USER', 'User ')}
              onPress={() => {
                setDevUser(key);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: vs(10),
    borderRadius: s(14),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(2),
  },
  badge: {
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(999),
  },
  badgeText: {
    fontSize: ms(10),
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: ms(13, 0.2),
    fontWeight: '600',
  },
  hint: {
    fontSize: ms(11.5, 0.2),
    opacity: 0.85,
    marginTop: vs(2),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(10),
  },
  loginButton: {
    flex: 1,
    borderRadius: s(999),
  },
  loginButtonContent: {
    justifyContent: 'flex-start',
  },
  loginButtonLabel: {
    fontSize: ms(14, 0.2),
  },
});
