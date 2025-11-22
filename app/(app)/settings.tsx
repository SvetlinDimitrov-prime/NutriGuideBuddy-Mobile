import { useLogout } from '@/api/hooks/useAuth';
import { useCurrentUserWithDetails, useDeleteUser } from '@/api/hooks/useUsers';
import ProfileDetailsSection from '@/components/settings/ProfileDetailsSection';
import ProfileIdentitySection from '@/components/settings/ProfileIdentitySection';
import AppModal from '@/components/AppModal';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';

export default function SettingsScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const insets = useSafeAreaInsets();

  const styles = useResponsiveStyles(theme, bp, makeStyles);
  const twoCols = bp.isLG || bp.isXL;

  const { data: userDetails, isLoading, isError, error } = useCurrentUserWithDetails();

  const deleteUserMutation = useDeleteUser();
  const logoutMutation = useLogout();

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  // parent only blocks for account-wide actions
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
      <Surface mode="flat" elevation={0} style={styles.page}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: styles.scrollContent.paddingBottom + insets.bottom },
          ]}
        >
          {/* HEADER like the rest of the app */}
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
              {/* IDENTITY SECTION (username + email) */}
              <ProfileIdentitySection
                styles={styles}
                twoCols={twoCols}
                globalBusy={globalBusy}
                userId={userDetails.id}
                username={userDetails.username}
                email={userDetails.email}
              />

              {/* DETAILS SECTION (rest of fields) */}
              <ProfileDetailsSection
                styles={styles}
                twoCols={twoCols}
                globalBusy={globalBusy}
                userDetails={userDetails}
              />

              {/* ACCOUNT SECTION */}
              <Surface style={styles.section} elevation={1}>
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
              </Surface>
            </>
          )}
        </ScrollView>
      </Surface>

      {/* LOGOUT MODAL */}
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

      {/* DELETE ACCOUNT MODAL */}
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
  const padX = bp.isXL ? s(32) : bp.isLG ? s(28) : bp.isMD ? s(20) : s(16);
  const scrollPadY = bp.isXL ? vs(28) : bp.isLG ? vs(24) : bp.isMD ? vs(20) : vs(16);
  const sectionPadY = bp.isXL ? vs(18) : bp.isLG ? vs(16) : bp.isMD ? vs(14) : vs(12);
  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';

  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background },

    scrollContent: {
      paddingHorizontal: padX,
      paddingTop: scrollPadY,
      paddingBottom: scrollPadY,
      alignItems: 'stretch',
    },

    // header like other pages
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
      paddingHorizontal: padX,
      paddingVertical: sectionPadY,
      alignSelf: 'center',
      width: '100%',
      maxWidth,
    },

    sectionTitle: {
      fontSize: ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '600' : '700',
      marginBottom: vs(8),
    },

    listSection: {
      marginVertical: 0,
      paddingVertical: 0,
    },

    listItemTight: {
      paddingVertical: vs(2),
    },

    profileHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: vs(4),
    },
    editActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },

    itemTitleText: {
      fontSize: ms(15, 0.2),
      fontWeight: Platform.OS === 'ios' ? '500' : '600',
    },

    inlineInput: {
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
    },

    inlineError: {
      marginLeft: s(56),
      marginTop: -vs(4),
      marginBottom: vs(4),
      color: theme.colors.error,
      fontSize: ms(12, 0.2),
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    detailCol: {
      flex: 1,
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

    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: vs(4),
    },
    chipButton: {
      marginRight: s(8),
      marginBottom: vs(6),
      borderRadius: s(999),
    },
    chipContent: {
      paddingHorizontal: s(10),
    },
  });
}
