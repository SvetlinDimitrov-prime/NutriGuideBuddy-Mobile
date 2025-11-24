import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { ms, s, vs } from 'react-native-size-matters';
import dayjs from 'dayjs';
import { useBreakpoints } from '@/theme/responsive';

type Props = {
  date: Date;
  onChange: (d: Date) => void;
  headlineVariant?: 'headlineSmall' | 'headlineMedium' | 'headlineLarge';
};

function prettyShort(d: Date) {
  return dayjs(d).format('ddd, MMM D');
}

// ✅ renamed internal keys to match behavior
type SegmentKey = 'past' | 'today' | 'future';

export default function DateHeader({ date, onChange, headlineVariant = 'headlineSmall' }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = makeStyles(theme, bp);

  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedPretty = useMemo(() => prettyShort(date), [date]);

  // keep original navigation (relative to selected date)
  const shiftDay = useCallback(
    (delta: number) => {
      const d = new Date(date);
      d.setDate(d.getDate() + delta);
      onChange(d);
    },
    [date, onChange],
  );

  const onSelect = (key: SegmentKey) => {
    if (key === 'today') onChange(new Date());
    else if (key === 'past') shiftDay(-1);
    else shiftDay(1); // future
  };

  // highlight rule: past / today / future (relative to real today)
  const activeSegment: SegmentKey = useMemo(() => {
    const today = dayjs();

    if (dayjs(date).isSame(today, 'day')) return 'today';
    if (dayjs(date).isBefore(today, 'day')) return 'past';
    return 'future';
  }, [date]);

  return (
    <View style={styles.header}>
      {/* Top row: date + calendar */}
      <View style={styles.headerRow}>
        <Text variant={headlineVariant} style={styles.title}>
          {selectedPretty}
        </Text>

        <IconButton
          icon="calendar-month-outline"
          size={s(22)}
          onPress={() => setPickerOpen(true)}
          style={styles.calendarBtn}
          accessibilityLabel="Change date"
        />
      </View>

      {/* Segmented control: Past | Today | Future */}
      <Surface style={styles.segmentWrap} elevation={0}>
        <Pressable
          onPress={() => onSelect('past')}
          style={[
            styles.segmentBtn,
            styles.segmentLeft,
            activeSegment === 'past' && styles.segmentBtnActive,
          ]}
        >
          <Text style={[styles.segmentText, activeSegment === 'past' && styles.segmentTextActive]}>
            Past
          </Text>
        </Pressable>

        <View style={styles.segmentDivider} />

        <Pressable
          onPress={() => onSelect('today')}
          style={[
            styles.segmentBtn,
            styles.segmentMiddle,
            activeSegment === 'today' && styles.segmentBtnActive,
          ]}
        >
          <Text style={[styles.segmentText, activeSegment === 'today' && styles.segmentTextActive]}>
            Today
          </Text>
        </Pressable>

        <View style={styles.segmentDivider} />

        <Pressable
          onPress={() => onSelect('future')}
          style={[
            styles.segmentBtn,
            styles.segmentRight,
            activeSegment === 'future' && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[styles.segmentText, activeSegment === 'future' && styles.segmentTextActive]}
          >
            Future
          </Text>
        </Pressable>
      </Surface>

      {/* Picker modal */}
      <DatePickerModal
        locale="en"
        mode="single"
        visible={pickerOpen}
        date={date}
        onDismiss={() => setPickerOpen(false)}
        onConfirm={({ date: picked }) => {
          if (picked) onChange(picked);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}

function makeStyles(theme: any, bp: any) {
  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';

  return StyleSheet.create({
    header: {
      alignItems: 'center',
      alignSelf: 'center',
      width: '100%',
      maxWidth,
      marginBottom: vs(8),
      gap: vs(10),
    },

    headerRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    title: {
      textAlign: 'left',
      marginTop: vs(2),
    },

    calendarBtn: {
      marginRight: -s(4),
      borderRadius: s(999),
      backgroundColor: theme.colors.surfaceVariant,
    },

    // ---- segmented control ----
    segmentWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: s(999),
      backgroundColor: theme.colors.surfaceVariant,
      overflow: 'hidden',
      width: '100%',
      maxWidth: s(360),
      alignSelf: 'center',
    },

    segmentBtn: {
      flex: 1,
      paddingVertical: vs(7),
      alignItems: 'center',
      justifyContent: 'center',
    },

    segmentLeft: {},
    segmentMiddle: {},
    segmentRight: {},

    segmentDivider: {
      width: StyleSheet.hairlineWidth,
      height: '60%',
      backgroundColor: theme.colors.outlineVariant,
      opacity: 0.7,
    },

    segmentBtnActive: {
      backgroundColor: theme.colors.primaryContainer,
    },

    segmentText: {
      fontSize: ms(12, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
    },

    segmentTextActive: {
      color: theme.colors.primary,
    },
  });
}
