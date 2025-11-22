import { useCreateMeal } from '@/api/hooks/useMeals';
import AppModal from '@/components/AppModal';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewMealModal() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { createdAt } = useLocalSearchParams<{ createdAt?: string }>();

  const createMeal = useCreateMeal();
  const busy = createMeal.isPending;

  const [name, setName] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const dateYmd = useMemo(() => createdAt ?? formatYMD(new Date()), [createdAt]);

  const onSave = () => {
    if (busy || !name.trim()) return;

    createMeal.mutate(
      { name: name.trim(), createdAt: dateYmd },
      {
        onSuccess: () => router.back(),
      },
    );
  };

  const onCloseRequest = () => {
    if (busy) return;
    if (name.trim().length > 0) setShowCloseConfirm(true);
    else router.back();
  };

  return (
    <Surface style={styles.page}>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall">New meal</Text>
        <Button onPress={onCloseRequest} disabled={busy}>
          Close
        </Button>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Meal name</Text>
        <TextInput
          mode="outlined"
          placeholder="e.g. Breakfast"
          value={name}
          onChangeText={setName}
          autoFocus
          editable={!busy}
        />

        <Button
          mode="contained"
          onPress={onSave}
          loading={busy}
          disabled={busy || name.trim().length === 0}
          style={styles.saveBtn}
        >
          Create meal
        </Button>
      </View>

      <AppModal
        visible={showCloseConfirm}
        onDismiss={() => setShowCloseConfirm(false)}
        title="Discard meal?"
        confirmLabel="Discard"
        confirmTextColor={theme.colors.error}
        onConfirm={() => router.back()}
        onCancel={() => setShowCloseConfirm(false)}
      >
        <Text>You haven’t saved this meal yet. Discard and close?</Text>
      </AppModal>
    </Surface>
  );
}

function makeStyles(theme: MD3Theme, bp: any) {
  const padX = bp.isXL ? s(28) : bp.isLG ? s(24) : s(16);
  const padY = bp.isXL ? vs(24) : bp.isLG ? vs(20) : vs(16);
  const maxWidth = bp.isXL ? s(720) : '100%';

  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: padX,
      paddingTop: padY,
      alignSelf: 'center',
      width: '100%',
      maxWidth,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: vs(12),
    },
    form: { gap: vs(10) },
    label: {
      fontSize: ms(14, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
    saveBtn: {
      marginTop: vs(8),
      borderRadius: s(10),
      alignSelf: 'flex-start',
    },
  });
}
