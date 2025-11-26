import { useMeal, useUpdateMeal } from '@/api/hooks/useMeals';
import AppModal from '@/components/AppModal';
import PageShell from '@/components/PageShell';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

export default function EditMealModal() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = Number(id);

  const updateMeal = useUpdateMeal();
  const { data: meal, isLoading, isError, error } = useMeal(mealId, !!mealId);

  const [name, setName] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const busy = updateMeal.isPending;

  useEffect(() => {
    if (meal?.name != null) setName(meal.name);
  }, [meal?.name]);

  const onSave = () => {
    if (!meal || busy) return;

    updateMeal.mutate(
      { mealId, dto: { name: name.trim() } },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  const onCloseRequest = () => {
    if (busy) return;

    const original = meal?.name ?? '';
    if (original !== name.trim()) {
      setShowCloseConfirm(true);
    } else {
      router.back();
    }
  };

  return (
    <>
      <PageShell>
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text variant="headlineSmall">Edit meal</Text>
            <Button onPress={onCloseRequest} disabled={busy}>
              Close
            </Button>
          </View>

          {isLoading && <Text style={styles.statusText}>Loading meal…</Text>}

          {isError && (
            <Text style={styles.errorText}>
              Couldn&apos;t load meal: {error?.message ?? 'Unknown error'}
            </Text>
          )}

          {!!meal && (
            <View style={styles.form}>
              <Text style={styles.label}>Meal name</Text>
              <TextInput
                mode="outlined"
                placeholder="Meal name"
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
                Save
              </Button>
            </View>
          )}
        </View>
      </PageShell>

      <AppModal
        visible={showCloseConfirm}
        onDismiss={() => setShowCloseConfirm(false)}
        title="Discard changes?"
        confirmLabel="Discard"
        confirmTextColor={theme.colors.error}
        onConfirm={() => router.back()}
        onCancel={() => setShowCloseConfirm(false)}
      >
        <Text>You have unsaved changes. Are you sure you want to close?</Text>
      </AppModal>
    </>
  );
}

function makeStyles(theme: MD3Theme, _: any) {
  type Styles = {
    content: ViewStyle;
    body: ViewStyle;
    headerRow: ViewStyle;
    statusText: TextStyle;
    errorText: TextStyle;
    form: ViewStyle;
    label: TextStyle;
    saveBtn: ViewStyle;
  };

  return StyleSheet.create<Styles>({
    content: {
      width: '100%',
      alignItems: 'stretch',
    },
    body: {
      width: '100%',
      alignSelf: 'center',
      gap: vs(4),
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: vs(8),
    },

    statusText: {
      marginTop: vs(8),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },

    errorText: {
      marginTop: vs(8),
      textAlign: 'center',
      color: theme.colors.error,
    },

    form: {
      gap: vs(10),
      marginTop: vs(6),
    },

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
