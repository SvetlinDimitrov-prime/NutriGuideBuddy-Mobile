import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Divider, List, Surface, Text, TextInput } from 'react-native-paper';
import { useUpdateUser } from '@/api/hooks/useUsers';

type Props = {
  styles: any;
  twoCols: boolean;
  globalBusy: boolean; // logout/delete etc from parent
  userId: number;
  username?: string | null;
  email: string;
};

// stable icon renderers
const UsernameLeft = (props: any) => <List.Icon {...props} icon="account" />;
const EmailLeft = (props: any) => <List.Icon {...props} icon="email-outline" />;

export default function ProfileIdentitySection({
  styles,
  twoCols,
  globalBusy,
  userId,
  username: initialUsername,
  email,
}: Props) {
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
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <Surface style={styles.section} elevation={1}>
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
