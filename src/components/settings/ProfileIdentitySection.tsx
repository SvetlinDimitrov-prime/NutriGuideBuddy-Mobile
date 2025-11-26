import { useUpdateUser } from '@/api/hooks/useUsers';
import { useBreakpoints } from '@/theme/responsive';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Button, Divider, List, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Props = {
  twoCols: boolean;
  globalBusy: boolean;
  userId: number;
  username?: string | null;
  email: string;
};

const UsernameLeft = (props: any) => <List.Icon {...props} icon="account" />;
const EmailLeft = (props: any) => <List.Icon {...props} icon="email-outline" />;

export default function ProfileIdentitySection({
  twoCols,
  globalBusy,
  userId,
  username: initialUsername,
  email,
}: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = makeStyles(theme, bp);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | undefined>();

  const updateUserMutation = useUpdateUser(userId, (fieldErrors) => {
    if (fieldErrors.username) setUsernameError(fieldErrors.username);
  });

  const busy = globalBusy || updateUserMutation.isPending;

  useEffect(() => {
    if (!isEditing) {
      setUsername(initialUsername ?? '');
      setUsernameError(undefined);
    }
  }, [initialUsername, isEditing]);

  const startEdit = () => {
    if (busy) return;
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setUsername(initialUsername ?? '');
    setUsernameError(undefined);
    setIsEditing(false);
  };

  const usernameChanged = username.trim().length > 0 && username.trim() !== (initialUsername ?? '');
  const saveDisabled = busy || !usernameChanged;

  const handleSave = async () => {
    if (busy) return;

    const trimmed = username.trim();

    if (!trimmed) {
      setUsernameError('Username is required.');
      return;
    }
    if (trimmed.length < 2) {
      setUsernameError('Username must be at least 2 characters long.');
      return;
    }

    try {
      await updateUserMutation.mutateAsync({ username: trimmed });
      setIsEditing(false);
    } catch {}
  };

  return (
    <Surface style={styles.section} mode="flat" elevation={0}>
      <View style={styles.profileHeaderRow}>
        <Text style={styles.sectionTitle}>Profile</Text>

        {!isEditing ? (
          <Button mode="text" compact onPress={startEdit} disabled={busy}>
            Edit
          </Button>
        ) : (
          <View style={styles.editActionsRow}>
            <Button mode="text" compact onPress={cancelEdit} disabled={busy}>
              Cancel
            </Button>
            <Button
              mode="contained"
              compact
              onPress={handleSave}
              disabled={saveDisabled}
              loading={updateUserMutation.isPending}
            >
              Save
            </Button>
          </View>
        )}
      </View>

      <List.Section style={styles.listSection}>
        {twoCols ? (
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <List.Item
                left={UsernameLeft}
                description="Username"
                title={
                  isEditing ? (
                    <TextInput
                      mode="flat"
                      dense
                      value={username}
                      onChangeText={(val) => {
                        setUsername(val);
                        if (usernameError) setUsernameError(undefined);
                      }}
                      autoCapitalize="none"
                      editable={!busy}
                      style={styles.inlineInput}
                      error={!!usernameError}
                    />
                  ) : (
                    <Text style={styles.itemTitleText}>{initialUsername || '—'}</Text>
                  )
                }
              />
              {!!usernameError && <Text style={styles.inlineError}>{usernameError}</Text>}
            </View>

            <View style={styles.detailCol}>
              <List.Item
                left={EmailLeft}
                title={email}
                description="Email"
                titleStyle={styles.itemTitleText}
              />
            </View>
          </View>
        ) : (
          <>
            <List.Item
              left={UsernameLeft}
              description="Username"
              title={
                isEditing ? (
                  <TextInput
                    mode="flat"
                    dense
                    value={username}
                    onChangeText={(val) => {
                      setUsername(val);
                      if (usernameError) setUsernameError(undefined);
                    }}
                    autoCapitalize="none"
                    editable={!busy}
                    style={styles.inlineInput}
                    error={!!usernameError}
                  />
                ) : (
                  <Text style={styles.itemTitleText}>{initialUsername || '—'}</Text>
                )
              }
            />
            {!!usernameError && <Text style={styles.inlineError}>{usernameError}</Text>}
            <Divider />
            <List.Item
              left={EmailLeft}
              title={email}
              description="Email"
              titleStyle={styles.itemTitleText}
            />
          </>
        )}
      </List.Section>
    </Surface>
  );
}

function makeStyles(theme: any, bp: any) {
  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';

  type Styles = {
    section: ViewStyle;
    profileHeaderRow: ViewStyle;
    sectionTitle: TextStyle;
    editActionsRow: ViewStyle;
    listSection: ViewStyle;
    detailRow: ViewStyle;
    detailCol: ViewStyle;
    itemTitleText: TextStyle;
    inlineInput: TextStyle;
    inlineError: TextStyle;
  };

  return StyleSheet.create<Styles>({
    section: {
      marginTop: vs(10),
      alignSelf: 'center',
      width: '100%',
      maxWidth,
    },

    profileHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: vs(4),
    },

    sectionTitle: {
      fontSize: ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '600' : '700',
      marginBottom: vs(2),
    },

    editActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },

    listSection: {
      marginVertical: 0,
      paddingVertical: 0,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },

    detailCol: {
      flex: 1,
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
  });
}
