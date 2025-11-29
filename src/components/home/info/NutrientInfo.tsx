// src/components/home/info/NutrientInfo.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

import ChipsPanel from '@/components/ChipsPanel';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { useFoodComponentsCatalog, useFoodComponentsRdi } from '@/api/hooks/foodComponents';
import type { FoodComponentGroup, FoodComponentLabel } from '@/api/types/mealFoods';
import type { FoodComponentCatalogEntry } from '@/api/types/foodComponentCatalog';
import type { FoodComponentRdiMap, FoodComponentRdi, PopulationGroup } from '@/api/types/foodRdi';
import { getComponentDisplay, getUnitSymbol } from '@/api/utils/foodEnums';

const GROUP_DISPLAY: Partial<Record<FoodComponentGroup, string>> = {
  CARBS: 'Carbs',
  FATS: 'Fats',
  FATTY_ACIDS: 'Fatty Acids',
  PROTEIN: 'Protein',
  AMINO_ACIDS: 'Amino Acids',
  VITAMINS: 'Vitamins',
  MINERALS: 'Minerals',
  OTHER: 'Other',
};

const prettyGroup = (g: FoodComponentGroup) =>
  GROUP_DISPLAY[g] ??
  String(g)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const prettyPopGroup = (g: PopulationGroup) => {
  switch (g) {
    case 'ALL':
      return 'All adults';
    case 'MALE':
      return 'Adult males';
    case 'FEMALE':
      return 'Adult females';
    case 'FEMALE_PREGNANT':
      return 'Pregnant';
    case 'FEMALE_LACTATING':
      return 'Breastfeeding';
    default:
      return String(g).toLowerCase().replace(/_/g, ' ');
  }
};

const pickPopulationGroup = (groups: PopulationGroup[]): PopulationGroup | null => {
  if (groups.includes('ALL')) return 'ALL';
  if (groups.includes('MALE')) return 'MALE';
  if (groups.includes('FEMALE')) return 'FEMALE';
  if (groups.length > 0) return groups[0];
  return null;
};

const pickAdultRange = (rows: FoodComponentRdi[]): FoodComponentRdi | null => {
  if (!rows || rows.length === 0) return null;
  const target = 30;
  const match =
    rows.find((r) => r.ageMin <= target && r.ageMax >= target) ??
    rows.find((r) => r.ageMin <= 19 && r.ageMax >= 19) ??
    rows[0];
  return match ?? null;
};

const formatRdiRange = (row: FoodComponentRdi, unitSymbol: string) => {
  const { rdiMin, rdiMax } = row;
  if (!unitSymbol) return '';

  if (rdiMin != null && rdiMax != null && rdiMin !== rdiMax) {
    return `${rdiMin}–${rdiMax} ${unitSymbol}`;
  }
  if (rdiMin != null && rdiMax != null && rdiMin === rdiMax) {
    return `${rdiMin} ${unitSymbol}`;
  }
  if (rdiMin != null) {
    return `≥ ${rdiMin} ${unitSymbol}`;
  }
  if (rdiMax != null) {
    return `≤ ${rdiMax} ${unitSymbol}`;
  }
  return '';
};

const formatBodyWeightRange = (row: FoodComponentRdi, unitSymbol: string) => {
  const { rdiMin, rdiMax } = row;
  const suffix = unitSymbol ? ` ${unitSymbol} per kg body weight` : ' per kg body weight';

  if (rdiMin != null && rdiMax != null && rdiMin !== rdiMax) {
    return `${rdiMin}–${rdiMax}${suffix}`;
  }
  if (rdiMin != null && rdiMax != null && rdiMin === rdiMax) {
    return `${rdiMin}${suffix}`;
  }
  if (rdiMin != null) {
    return `≥ ${rdiMin}${suffix}`;
  }
  if (rdiMax != null) {
    return `≤ ${rdiMax}${suffix}`;
  }
  return '';
};

export default function NutrientInfo() {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const {
    data: catalog,
    isLoading: catalogLoading,
    isError: catalogError,
    error: catalogErr,
  } = useFoodComponentsCatalog();

  const {
    data: rdiMap,
    isLoading: rdiLoading,
    isError: rdiError,
    error: rdiErr,
  } = useFoodComponentsRdi();

  const isLoading = catalogLoading || rdiLoading;
  const isError = catalogError || rdiError;
  const errorMessage = catalogErr?.message ?? rdiErr?.message ?? 'Unknown error';

  // ---------- GROUPS ----------
  const groups = useMemo<FoodComponentGroup[]>(() => {
    const list = catalog ?? [];
    const set = new Set<FoodComponentGroup>();
    for (const e of list) set.add(e.group);
    return Array.from(set);
  }, [catalog]);

  const [selectedGroup, setSelectedGroup] = useState<FoodComponentGroup | null>(null);

  useEffect(() => {
    if (!selectedGroup && groups.length > 0) setSelectedGroup(groups[0]);
    if (selectedGroup && groups.length > 0 && !groups.includes(selectedGroup)) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  // ---------- NUTRIENTS IN GROUP ----------
  const nutrientsInGroup = useMemo<FoodComponentCatalogEntry[]>(() => {
    const list = catalog ?? [];
    if (!selectedGroup) return list;
    return list.filter((e) => e.group === selectedGroup);
  }, [catalog, selectedGroup]);

  const [selectedNutrient, setSelectedNutrient] = useState<FoodComponentLabel | null>(null);

  useEffect(() => {
    if (!selectedNutrient && nutrientsInGroup.length > 0) {
      setSelectedNutrient(nutrientsInGroup[0].label);
    }
    if (
      selectedNutrient &&
      nutrientsInGroup.length > 0 &&
      !nutrientsInGroup.some((e) => e.label === selectedNutrient)
    ) {
      setSelectedNutrient(nutrientsInGroup[0].label);
    }
  }, [nutrientsInGroup, selectedNutrient]);

  const selectedCatalog: FoodComponentCatalogEntry | null =
    nutrientsInGroup.find((e) => e.label === selectedNutrient) ?? null;

  // ---------- RDI for the selected nutrient ----------
  const selectedRdi = useMemo(() => {
    if (!selectedNutrient || !rdiMap) return null;

    const byNutrient = (rdiMap as FoodComponentRdiMap)[selectedNutrient];
    if (!byNutrient) return null;

    const groupsForNutrient = Object.keys(byNutrient) as PopulationGroup[];
    const popGroup = pickPopulationGroup(groupsForNutrient);
    if (!popGroup) return null;

    const rows = byNutrient[popGroup] ?? [];
    if (!rows || rows.length === 0) return null;

    return {
      group: popGroup,
      rows,
    };
  }, [selectedNutrient, rdiMap]);

  const unitSymbol = selectedCatalog ? getUnitSymbol(selectedCatalog.unit) : '';

  const adultRow: FoodComponentRdi | null = useMemo(
    () => (selectedRdi ? pickAdultRange(selectedRdi.rows) : null),
    [selectedRdi],
  );

  const firstRow: FoodComponentRdi | null = useMemo(
    () => (selectedRdi && selectedRdi.rows.length > 0 ? selectedRdi.rows[0] : null),
    [selectedRdi],
  );

  const isBodyWeightBased = !!firstRow && firstRow.isDerived && firstRow.basis === 'BODY_WEIGHT';

  const adultRangeText = adultRow ? formatRdiRange(adultRow, unitSymbol) : '';
  const hasStandardRdi = !!selectedRdi && !!adultRow && !!adultRangeText && !isBodyWeightBased;

  const bodyWeightRow: FoodComponentRdi | null = useMemo(() => {
    if (!selectedRdi) return null;
    const r = pickAdultRange(selectedRdi.rows) ?? selectedRdi.rows[0] ?? null;
    return r;
  }, [selectedRdi]);

  const bodyWeightRangeText =
    bodyWeightRow && isBodyWeightBased ? formatBodyWeightRange(bodyWeightRow, unitSymbol) : '';

  return (
    <List.Accordion
      title="Nutrient guide"
      description="What each nutrient does, where to find it, and usual daily ranges."
      style={styles.accordion}
      titleStyle={styles.accordionTitle}
      descriptionStyle={styles.accordionDescription}
    >
      <View style={styles.accordionBody}>
        {isLoading && <Text style={styles.statusText}>Loading nutrient info…</Text>}
        {isError && <Text style={styles.errorText}>Couldn’t load info: {errorMessage}</Text>}

        {!isLoading && !isError && (catalog?.length ?? 0) > 0 && (
          <>
            <ChipsPanel
              rows={[
                {
                  key: 'groups',
                  title: 'Group',
                  items: groups,
                  selectedId: selectedGroup ?? null,
                  onSelect: (g: FoodComponentGroup) => setSelectedGroup(g),
                  getId: (g: FoodComponentGroup) => g,
                  getLabel: (g: FoodComponentGroup) => prettyGroup(g),
                  maxLabelChars: 14,
                },
                {
                  key: 'nutrients',
                  title: 'Nutrient',
                  items: nutrientsInGroup,
                  selectedId: selectedNutrient ?? null,
                  onSelect: (entry: FoodComponentCatalogEntry) => setSelectedNutrient(entry.label),
                  getId: (entry: FoodComponentCatalogEntry) => entry.label,
                  getLabel: (entry: FoodComponentCatalogEntry) => getComponentDisplay(entry.label),
                  maxLabelChars: 22,
                },
              ]}
            />

            {selectedCatalog && (
              <>
                {/* HEADER BLOCK = title + pill + description */}
                <View style={styles.headerBlock}>
                  <View style={styles.headerRow}>
                    <Text style={styles.nutrientTitle}>
                      {getComponentDisplay(selectedCatalog.label)}
                      {unitSymbol ? ` · ${unitSymbol}` : ''}
                    </Text>

                    <View style={styles.groupPill}>
                      <Text style={styles.groupPillText}>{prettyGroup(selectedCatalog.group)}</Text>
                    </View>
                  </View>

                  <Text style={styles.nutrientSubtitle}>{selectedCatalog.description}</Text>
                </View>

                {/* DAILY GUIDE */}
                {selectedRdi && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daily guide</Text>

                    {isBodyWeightBased && bodyWeightRow && bodyWeightRangeText ? (
                      <>
                        <Text style={styles.sectionHint}>
                          This nutrient is based on your body weight, not a single fixed number. The
                          guide uses grams per kilogram of body weight.
                        </Text>

                        <View style={styles.cardGrid}>
                          <View style={[styles.rangeCard, styles.rangeCardPrimary]}>
                            <Text style={styles.rangeAge}>Rule of thumb</Text>
                            <Text style={styles.rangeValue}>{bodyWeightRangeText}</Text>
                          </View>
                        </View>

                        <Text style={styles.sectionHint}>
                          To estimate your target, multiply your body weight in kg by this number.
                          For example, at 70 kg you’d use roughly 70 × value above.
                        </Text>
                      </>
                    ) : (
                      hasStandardRdi && (
                        <>
                          <Text style={styles.sectionHint}>
                            Based on {prettyPopGroup(selectedRdi.group)}. These are guideline
                            ranges, not strict limits.
                          </Text>

                          <View style={styles.cardGrid}>
                            {adultRow && (
                              <View style={[styles.rangeCard, styles.rangeCardPrimary]}>
                                <Text style={styles.rangeAge}>Adults</Text>
                                <Text style={styles.rangeValue}>{adultRangeText}</Text>
                              </View>
                            )}

                            {selectedRdi.rows.map((row, idx) => {
                              const v = formatRdiRange(row, unitSymbol);
                              if (!v) return null;

                              const isAdult =
                                adultRow &&
                                row.ageMin === adultRow.ageMin &&
                                row.ageMax === adultRow.ageMax;
                              if (isAdult) return null;

                              return (
                                <View key={idx} style={styles.rangeCard}>
                                  <Text style={styles.rangeAge}>
                                    {row.ageMin}–{row.ageMax} yrs
                                  </Text>
                                  <Text style={styles.rangeValue}>{v}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </>
                      )
                    )}
                  </View>
                )}

                {/* SOURCES */}
                {(selectedCatalog.richSources?.length ?? 0) > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Often found in</Text>
                    <View style={styles.sourceRow}>
                      {selectedCatalog.richSources.map((src, idx) => (
                        <View key={`${src}-${idx}`} style={styles.sourceChip}>
                          <Text style={styles.sourceChipText}>{src}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* NOTE / FUN FACT */}
                {selectedCatalog.funFact && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Note</Text>
                    <Text style={styles.funFact}>{selectedCatalog.funFact}</Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </View>
    </List.Accordion>
  );
}

function makeStyles(theme: MD3Theme, _bp: { isXL: boolean; isLG: boolean; isMD: boolean }) {
  return StyleSheet.create({
    accordion: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
      overflow: 'hidden',
    },
    accordionTitle: {
      fontSize: ms(14, 0.2),
      fontWeight: '700',
    },
    accordionDescription: {
      fontSize: ms(11.5, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
    accordionBody: {
      paddingHorizontal: s(16),
      paddingBottom: vs(14),
      paddingTop: 0,
      gap: vs(10),
    },

    statusText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginTop: vs(6),
    },
    errorText: {
      textAlign: 'center',
      color: theme.colors.error,
      marginTop: vs(6),
    },

    headerBlock: {
      gap: vs(2),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: s(8),
    },
    nutrientTitle: {
      fontSize: ms(16, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurface,
    },
    groupPill: {
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
      borderRadius: s(999),
      backgroundColor: theme.colors.surfaceVariant,
    },
    groupPillText: {
      fontSize: ms(11, 0.2),
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    nutrientSubtitle: {
      marginTop: 0,
      fontSize: ms(12.5, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    section: {
      gap: vs(4),
      marginTop: vs(8),
    },
    sectionTitle: {
      fontSize: ms(12.5, 0.2),
      fontWeight: '700',
    },
    sectionHint: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurfaceVariant,
      marginBottom: vs(4),
    },

    cardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
    },
    rangeCard: {
      paddingHorizontal: s(10),
      paddingVertical: vs(8),
      borderRadius: s(18),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
      minWidth: s(140),
      flexGrow: 1,
      gap: vs(2),
    },
    rangeCardPrimary: {
      borderColor: theme.colors.primary,
    },
    rangeAge: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
    rangeValue: {
      fontSize: ms(13, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurface,
    },

    sourceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
    },
    sourceChip: {
      paddingHorizontal: s(10),
      paddingVertical: vs(5),
      borderRadius: s(999),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
    },
    sourceChipText: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurface,
      fontWeight: '500',
    },

    funFact: {
      fontSize: ms(11.5, 0.2),
      color: theme.colors.onSurface,
    },
  });
}
