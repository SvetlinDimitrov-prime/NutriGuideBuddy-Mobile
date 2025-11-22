import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

type AppModalProps = {
  visible: boolean;
  onDismiss: () => void;

  title?: string;
  subtitle?: string;

  children?: React.ReactNode;

  showCancel?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;

  showConfirm?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmTextColor?: string;

  actions?: React.ReactNode;
};

export default function AppModal({
  visible,
  onDismiss,
  title,
  subtitle,
  children,

  showCancel = true,
  cancelLabel = 'Cancel',
  onCancel,

  showConfirm = true,
  confirmLabel = 'Confirm',
  onConfirm,
  confirmDisabled = false,
  confirmLoading = false,
  confirmTextColor,

  actions,
}: AppModalProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const handleCancel = () => {
    onCancel?.();
    onDismiss();
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        {!!title && <Dialog.Title>{title}</Dialog.Title>}

        <Dialog.Content>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          <View style={styles.body}>{children}</View>
        </Dialog.Content>

        {actions ? (
          <Dialog.Actions>{actions}</Dialog.Actions>
        ) : showCancel || showConfirm ? (
          <Dialog.Actions>
            {showCancel && (
              <Button onPress={handleCancel} disabled={confirmLoading}>
                {cancelLabel}
              </Button>
            )}

            {showConfirm && (
              <Button
                onPress={handleConfirm}
                disabled={confirmDisabled || confirmLoading}
                loading={confirmLoading}
                textColor={confirmTextColor}
              >
                {confirmLabel}
              </Button>
            )}
          </Dialog.Actions>
        ) : null}
      </Dialog>
    </Portal>
  );
}

function makeStyles(theme: MD3Theme) {
  return StyleSheet.create({
    dialog: {
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      alignSelf: 'center',
      width: '92%',
      maxWidth: 420,
    },
    subtitle: {
      marginBottom: 8,
      color: theme.colors.onSurfaceVariant,
    },
    body: {
      marginTop: 2,
    },
  });
}
