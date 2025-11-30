import React, { useMemo, useState } from 'react';
import PageShell from '@/components/PageShell';
import PageHeader from '@/components/PageHeader';
import { useDietPresets, type DietPreset } from '@/hooks/useDietPresets';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Divider,
  HelperText,
  Text,
  TextInput,
  useTheme,
  type MD3Theme,
} from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import { useUpdateUserDetails } from '@/api/hooks/useUserDetails';
import {
  useCustomRdiComponents,
  useCreateCustomRdiComponents,
  useUpdateCustomRdiComponent,
} from '@/api/hooks/useCustomRdi';
import type {
  CustomFoodComponentRdiCreateRequest,
  CustomFoodComponentRdiUpdateRequest,
} from '@/api/types/customRdi';
import type { FoodComponentLabel } from '@/api/types/mealFoods';
import { getComponentDisplay, getUnitSymbol } from '@/api/utils/foodEnums';

export default function DietsScreen() {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { presets, currentPresetId, user, isLoading, isError, error } = useDietPresets();
  const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId);

  const selectedPreset: DietPreset | null = presets.find((p) => p.id === selectedPresetId) ?? null;

  const updateUserDetails = useUpdateUserDetails();
  const { data: customComponents = [], isLoading: overridesLoading } = useCustomRdiComponents();
  const createCustomRdi = useCreateCustomRdiComponents();
  const updateCustomRdi = useUpdateCustomRdiComponent();

  const [manualComponent, setManualComponent] = useState<FoodComponentLabel | null>(null);
  const [manualMin, setManualMin] = useState<string>('');
  const [manualMax, setManualMax] = useState<string>('');
  const [manualBusy, setManualBusy] = useState(false);

  const manualUnit = useMemo(
    () =>
      manualComponent
        ? getUnitSymbol(customComponents.find((c) => c.name === manualComponent)?.unit ?? 'G')
        : '',
    [manualComponent, customComponents],
  );

  const savingDiet =
    updateUserDetails.isPending || createCustomRdi.isPending || updateCustomRdi.isPending;

  async function applyPresetOverrides(preset: DietPreset | null) {
    if (!preset) return;

    const existingByName = new Map<FoodComponentLabel, number>();
    customComponents.forEach((c) => {
      existingByName.set(c.name, c.id);
    });

    const toCreate: CustomFoodComponentRdiCreateRequest[] = [];
    const toUpdate: { id: number; dto: CustomFoodComponentRdiUpdateRequest }[] = [];

    for (const ov of preset.overrides) {
      const id = existingByName.get(ov.name);
      if (!id) {
        toCreate.push(ov);
      } else {
        toUpdate.push({
          id,
          dto: {
            rdiMin: ov.rdiMin ?? null,
            rdiMax: ov.rdiMax ?? null,
          },
        });
      }
    }

    if (toCreate.length > 0) {
      await createCustomRdi.mutateAsync({ components: toCreate });
    }

    for (const u of toUpdate) {
      await updateCustomRdi.mutateAsync({ componentId: u.id, dto: u.dto });
    }
  }

  const handleSaveDiet = async () => {
    if (!user || !selectedPreset) return;
    if (savingDiet) return;

    // 1) update user diet field
    updateUserDetails.mutate(
      { diet: selectedPreset.id },
      {
        onSuccess: async () => {
          try {
            // 2) then apply overrides
            await applyPresetOverrides(selectedPreset);
          } catch {
            // API layer already surfaces errors via toasts
          }
        },
      },
    );
  };

  const handleManualSave = async () => {
    if (!manualComponent || manualBusy) return;

    const minVal = manualMin.trim().length ? Number(manualMin) : null;
    const maxVal = manualMax.trim().length ? Number(manualMax) : null;

    if (minVal == null && maxVal == null) return;

    const existing = customComponents.find((c) => c.name === manualComponent);
    setManualBusy(true);
    try {
      if (!existing) {
        const payload: CustomFoodComponentRdiCreateRequest = {
          name: manualComponent,
          unit: existing?.unit ?? 'G',
          rdiMin: minVal,
          rdiMax: maxVal,
        };
        await createCustomRdi.mutateAsync({ components: [payload] });
      } else {
        const dto: CustomFoodComponentRdiUpdateRequest = {
          rdiMin: minVal,
          rdiMax: maxVal,
        };
        await updateCustomRdi.mutateAsync({ componentId: existing.id, dto });
      }
    } finally {
      setManualBusy(false);
    }
  };

  return (
    <PageShell contentStyle={styles.content} bottomExtra={vs(40)}>
      <PageHeader
        title="Diets & targets"
        subtitle="Pick a general diet style or adjust individual nutrients. The app will tune your daily targets based on what you choose."
      />

      <View style={styles.aiCallout}>
        <Text style={styles.aiCalloutTitle}>Important</Text>
        <Text style={styles.aiCalloutText}>
          These diet presets and target tweaks are generated with the help of AI and general
          nutrition guidelines. They are for tracking and experimentation only, not medical advice.
          Always follow your doctor or dietitian first.
        </Text>
      </View>

      {isLoading && <Text style={styles.statusText}>Loading your details…</Text>}

      {isError && (
        <Text style={styles.errorText}>
          Couldn&apos;t load your details: {error?.message ?? 'Unknown error'}
        </Text>
      )}

      {!isLoading && !isError && (
        <>
          {/* ---------- diet presets ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Diet style</Text>
            <Text style={styles.cardParagraph}>
              Choose the overall pattern that feels closest to how you eat. You can still change
              individual nutrients below.
            </Text>

            <View style={styles.chipRow}>
              {presets.map((preset) => (
                <Chip
                  key={preset.id}
                  selected={preset.id === selectedPresetId}
                  onPress={() => setSelectedPresetId(preset.id)}
                  style={styles.dietChip}
                  mode={preset.id === selectedPresetId ? 'flat' : 'outlined'}
                >
                  {preset.shortLabel}
                </Chip>
              ))}
            </View>

            {selectedPreset && (
              <View style={styles.selectedBlock}>
                <Text style={styles.selectedTitle}>{selectedPreset.label}</Text>
                <Text style={styles.selectedDescription}>{selectedPreset.description}</Text>
                {selectedPreset.note ? (
                  <Text style={styles.selectedNote}>{selectedPreset.note}</Text>
                ) : null}
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSaveDiet}
              loading={savingDiet || overridesLoading}
              disabled={savingDiet || overridesLoading || !selectedPreset}
              style={styles.saveButton}
            >
              Save diet &amp; update targets
            </Button>
          </View>

          <Divider style={styles.divider} />

          {/* ---------- manual overrides ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Manual overrides</Text>
            <Text style={styles.cardParagraph}>
              Want to tweak one nutrient without changing your whole diet style? Pick a nutrient and
              set your own minimum/maximum. This will override the automatic range for that
              nutrient.
            </Text>

            <Text style={styles.fieldLabel}>Nutrient name (as shown in the app)</Text>
            <TextInput
              mode="outlined"
              placeholder="e.g. Protein, Fiber, Sodium"
              value={manualComponent ?? ''}
              onChangeText={(val) =>
                setManualComponent(val.trim().toUpperCase() as FoodComponentLabel)
              }
              style={styles.input}
            />
            {manualComponent && (
              <HelperText type="info">
                Tracking as: {getComponentDisplay(manualComponent)}{' '}
                {manualUnit ? `(${manualUnit})` : ''}
              </HelperText>
            )}

            <View style={styles.manualRow}>
              <View style={styles.manualCol}>
                <Text style={styles.fieldLabel}>Min (optional)</Text>
                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  value={manualMin}
                  onChangeText={setManualMin}
                  placeholder="e.g. 70"
                  style={styles.input}
                />
              </View>
              <View style={styles.manualCol}>
                <Text style={styles.fieldLabel}>Max (optional)</Text>
                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  value={manualMax}
                  onChangeText={setManualMax}
                  placeholder="e.g. 120"
                  style={styles.input}
                />
              </View>
            </View>

            <Button
              mode="outlined"
              onPress={handleManualSave}
              loading={manualBusy}
              disabled={manualBusy || !manualComponent}
              style={styles.saveButton}
            >
              Save manual override
            </Button>
          </View>
        </>
      )}
    </PageShell>
  );
}

function makeStyles(theme: MD3Theme, bp: { isXL: boolean; isLG: boolean; isMD: boolean }) {
  const maxWidth = bp.isXL ? s(900) : bp.isLG ? s(760) : bp.isMD ? s(640) : '100%';

  return StyleSheet.create({
    content: {
      width: '100%',
      alignItems: 'stretch',
      gap: vs(12),
    },

    aiCallout: {
      alignSelf: 'center',
      maxWidth,
      width: '100%',
      borderRadius: s(12),
      paddingHorizontal: s(12),
      paddingVertical: vs(10),
      backgroundColor: theme.colors.errorContainer,
    },
    aiCalloutTitle: {
      fontSize: ms(11.5, 0.2),
      fontWeight: '700',
      marginBottom: vs(2),
      color: theme.colors.onErrorContainer,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    aiCalloutText: {
      fontSize: ms(11.5, 0.2),
      color: theme.colors.onErrorContainer,
    },

    statusText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    errorText: {
      textAlign: 'center',
      color: theme.colors.error,
    },

    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth,
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      paddingHorizontal: s(14),
      paddingVertical: vs(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
      gap: vs(8),
    },

    cardTitle: {
      fontSize: ms(16, 0.2),
      fontWeight: '700',
    },
    cardParagraph: {
      fontSize: ms(12.5, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
      marginTop: vs(4),
    },
    dietChip: {
      borderRadius: s(16),
    },

    selectedBlock: {
      marginTop: vs(6),
      gap: vs(2),
    },
    selectedTitle: {
      fontSize: ms(13.5, 0.2),
      fontWeight: '600',
    },
    selectedDescription: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurface,
    },
    selectedNote: {
      fontSize: ms(11.5, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    saveButton: {
      marginTop: vs(8),
      alignSelf: 'flex-start',
    },

    divider: {
      marginVertical: vs(8),
      opacity: 0.4,
    },

    fieldLabel: {
      fontSize: ms(11.5, 0.2),
      fontWeight: '500',
      marginBottom: vs(2),
    },
    input: {
      backgroundColor: theme.colors.surface,
    },

    manualRow: {
      flexDirection: 'row',
      gap: s(8),
      marginTop: vs(4),
    },
    manualCol: {
      flex: 1,
    },
  });
}
