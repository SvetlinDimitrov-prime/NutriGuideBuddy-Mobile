// components/auth/complete-profile/NumericFieldsSection.tsx
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { HelperText, TextInput } from 'react-native-paper';
import { ms, vs } from 'react-native-size-matters';

import type { UserDetailsFormValues } from '@/api/validation/userDetailsSchema';

type Props = {
  control: Control<UserDetailsFormValues>;
  errors: FieldErrors<UserDetailsFormValues>;
  theme: MD3Theme;
  disabled: boolean;
};

export default function NumericFieldsSection({ control, errors, theme, disabled }: Props) {
  return (
    <View style={styles.fieldGroup}>
      {/* Weight */}
      <Controller
        control={control}
        name="kilograms"
        render={({ field: { value, onChange, onBlur } }) => (
          <>
            <TextInput
              mode="outlined"
              label="Weight (kg)"
              value={value == null ? '' : String(value)}
              onChangeText={(text) => onChange(text as any)}
              onBlur={onBlur}
              keyboardType="numeric"
              left={<TextInput.Icon icon="weight-kilogram" />}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              error={!!errors.kilograms}
              editable={!disabled}
            />
            {!!errors.kilograms && (
              <HelperText type="error" visible style={styles.helper}>
                {errors.kilograms?.message}
              </HelperText>
            )}
          </>
        )}
      />

      {/* Height */}
      <Controller
        control={control}
        name="height"
        render={({ field: { value, onChange, onBlur } }) => (
          <>
            <TextInput
              mode="outlined"
              label="Height (cm)"
              value={value == null ? '' : String(value)}
              onChangeText={(text) => onChange(text as any)}
              onBlur={onBlur}
              keyboardType="numeric"
              left={<TextInput.Icon icon="human-male-height-variant" />}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              error={!!errors.height}
              editable={!disabled}
            />
            {!!errors.height && (
              <HelperText type="error" visible style={styles.helper}>
                {errors.height?.message}
              </HelperText>
            )}
          </>
        )}
      />

      {/* Age */}
      <Controller
        control={control}
        name="age"
        render={({ field: { value, onChange, onBlur } }) => (
          <>
            <TextInput
              mode="outlined"
              label="Age"
              value={value == null ? '' : String(value)}
              onChangeText={(text) => onChange(text as any)}
              onBlur={onBlur}
              keyboardType="numeric"
              left={<TextInput.Icon icon="calendar" />}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              error={!!errors.age}
              editable={!disabled}
            />
            {!!errors.age && (
              <HelperText type="error" visible style={styles.helper}>
                {errors.age?.message}
              </HelperText>
            )}
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 10,
    marginTop: vs(6),
  },
  input: {
    fontSize: ms(16, 0.2),
  },
  helper: {
    marginTop: -vs(6),
  },
});
