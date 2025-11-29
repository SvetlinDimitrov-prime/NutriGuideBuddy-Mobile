// components/auth/complete-profile/SegmentedChoiceField.tsx
import { Control, Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { HelperText, SegmentedButtons, Text } from 'react-native-paper';
import { ms, vs } from 'react-native-size-matters';

import type { UserDetailsFormValues } from '@/api/validation/userDetailsSchema';
import ChoiceChips, { ChoiceOption } from './ChoiceChips';

type Name = 'workoutState' | 'gender' | 'goal';

type Props = {
  control: Control<UserDetailsFormValues>;
  name: Name;
  label: string;
  options: readonly ChoiceOption[];
  error?: string;
  isWide: boolean;
  disabled: boolean;
};

export default function SegmentedChoiceField({
  control,
  name,
  label,
  options,
  error,
  isWide,
  disabled,
}: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>{label}</Text>
          {isWide ? (
            <SegmentedButtons
              value={value ?? ''}
              onValueChange={(val) => onChange(val as any)}
              buttons={options.map((opt) => ({
                value: opt.value,
                label: opt.label,
                icon: opt.icon,
                disabled,
              }))}
            />
          ) : (
            <ChoiceChips
              value={value}
              onChange={(val) => onChange(val as any)}
              options={options}
              disabled={disabled}
            />
          )}
          {!!error && (
            <HelperText type="error" visible style={styles.helper}>
              {error}
            </HelperText>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: vs(10),
    gap: vs(4),
  },
  groupLabel: {
    fontSize: ms(14, 0.2),
    fontWeight: '500',
  },
  helper: {
    marginTop: -vs(6),
  },
});
