import { useLogout } from '@/api/hooks/useAuth';
import { useCurrentUserWithDetails, useDeleteUser } from '@/api/hooks/useUsers';
import AppModal from '@/components/AppModal';
import PageShell from '@/components/PageShell';
import ProfileDetailsSection from '@/components/settings/ProfileDetailsSection';
import ProfileIdentitySection from '@/components/settings/ProfileIdentitySection';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

export default function SettingsScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();

  const styles = useResponsiveStyles(theme, bp, makeStyles);
  const twoCols = bp.isLG || bp.isXL;

  const { data: userDetails, isLoading, isError, error } = useCurrentUserWithDetails();

  const deleteUserMutation = useDeleteUser();
  const logoutMutation = useLogout();

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const globalBusy = useMemo(
    () => deleteUserMutation.isPending || logoutMutation.isPending,
    [deleteUserMutation.isPending, logoutMutation.isPending],
  );

  const confirmDelete = () => {
    if (!userDetails || globalBusy) return;

    deleteUserMutation.mutate(userDetails.id, {
      onSuccess: () => {
        setDeleteDialogVisible(false);
        router.replace('/(auth)/login');
      },
    });
  };

  const confirmLogout = () => {
    if (globalBusy) return;

    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLogoutDialogVisible(false);
        router.replace('/(auth)/login');
      },
    });
  };

  return (
    <>
      <PageShell bottomExtra={vs(40)} contentStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Settings
          </Text>
          <Text style={styles.subtitle}>Manage your profile and account.</Text>
        </View>

        {isLoading && <Text style={styles.statusText}>Loading your account details…</Text>}

        {isError && (
          <Text style={styles.errorText}>
            Couldn&apos;t load your details: {error?.message ?? 'Unknown error'}
          </Text>
        )}

        {userDetails && (
          <>
            <ProfileIdentitySection
              twoCols={twoCols}
              globalBusy={globalBusy}
              userId={userDetails.id}
              username={userDetails.username}
              email={userDetails.email}
            />

            <ProfileDetailsSection
              twoCols={twoCols}
              globalBusy={globalBusy}
              userDetails={userDetails}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>

              <View style={styles.buttonColumn}>
                <Button
                  mode="outlined"
                  icon="logout"
                  onPress={() => setLogoutDialogVisible(true)}
                  disabled={globalBusy}
                >
                  Log out
                </Button>

                <Button
                  mode="contained-tonal"
                  buttonColor={theme.colors.errorContainer}
                  textColor={theme.colors.onErrorContainer}
                  icon="trash-can-outline"
                  onPress={() => setDeleteDialogVisible(true)}
                  disabled={globalBusy}
                  loading={deleteUserMutation.isPending}
                >
                  Delete account
                </Button>
              </View>

              <Text style={styles.dangerNote}>
                Deleting your account is permanent and cannot be undone.
              </Text>
            </View>
          </>
        )}
      </PageShell>

      <AppModal
        visible={logoutDialogVisible}
        onDismiss={() => (globalBusy ? null : setLogoutDialogVisible(false))}
        title="Log out"
        confirmLabel="Log out"
        confirmLoading={logoutMutation.isPending}
        confirmDisabled={globalBusy}
        confirmTextColor={theme.colors.primary}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutDialogVisible(false)}
      >
        <Text>Are you sure you want to log out?</Text>
      </AppModal>

      <AppModal
        visible={deleteDialogVisible}
        onDismiss={() => (globalBusy ? null : setDeleteDialogVisible(false))}
        title="Delete account"
        confirmLabel="Delete"
        confirmLoading={deleteUserMutation.isPending}
        confirmDisabled={globalBusy}
        confirmTextColor={theme.colors.error}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogVisible(false)}
      >
        <Text>
          Are you sure you want to permanently delete your account? This action cannot be undone.
        </Text>
      </AppModal>
    </>
  );
}

function makeStyles(
  theme: MD3Theme,
  bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const sectionPadY = bp.isXL ? vs(18) : bp.isLG ? vs(16) : bp.isMD ? vs(14) : vs(12);
  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';

  type Styles = {
    content: ViewStyle;
    header: ViewStyle;
    title: TextStyle;
    subtitle: TextStyle;
    statusText: TextStyle;
    section: ViewStyle;
    sectionTitle: TextStyle;
    buttonColumn: ViewStyle;
    dangerNote: TextStyle;
    errorText: TextStyle;
  };

  return StyleSheet.create<Styles>({
    content: {
      width: '100%',
      alignItems: 'stretch',
      gap: vs(16),
    },

    header: {
      alignItems: 'flex-start',
      marginBottom: vs(8),
      alignSelf: 'center',
      width: '100%',
      maxWidth,
    },
    title: {
      textAlign: 'left',
      marginTop: vs(2),
    },
    subtitle: {
      marginTop: vs(4),
      color: theme.colors.onSurfaceVariant,
      fontSize: ms(14, 0.2),
    },

    statusText: {
      marginTop: vs(12),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },

    section: {
      marginTop: vs(10),
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      paddingVertical: sectionPadY,
      alignSelf: 'center',
      width: '100%',
      maxWidth,
    },

    sectionTitle: {
      fontSize: ms(18, 0.2),
      fontWeight: '600',
      marginBottom: vs(8),
    },

    buttonColumn: {
      marginTop: vs(4),
      gap: vs(8),
    },

    dangerNote: {
      marginTop: vs(8),
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    errorText: {
      color: theme.colors.error,
      marginTop: vs(8),
      textAlign: 'center',
    },
  });
}
