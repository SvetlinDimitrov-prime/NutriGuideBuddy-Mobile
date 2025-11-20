import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';

import { useLogout } from '@/api/hooks/useAuth'; // ✅ use your logout hook
import { useUpdateUserDetails } from '@/api/hooks/useUserDetails';
import type { UserDetailsRequest } from '@/api/types/userDetails';
import { UserDetailsFormValues, userDetailsSchema } from '@/api/validation/userDetailsSchema';
import { AuthSteps } from '@/components/AuthSteps';

const WORKOUT_OPTIONS = [
  { value: 'SEDENTARY', label: 'Sedentary', icon: 'sofa-single' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly active', icon: 'walk' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately active', icon: 'run' },
  { value: 'VERY_ACTIVE', label: 'Very active', icon: 'run-fast' },
  { value: 'SUPER_ACTIVE', label: 'Super active', icon: 'lightning-bolt' },
] as const;

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male', icon: 'gender-male' },
  { value: 'FEMALE', label: 'Female', icon: 'gender-female' },
  { value: 'FEMALE_PREGNANT', label: 'Female – pregnant', icon: 'human-pregnant' },
  { value: 'FEMALE_LACTATING', label: 'Female – lactating', icon: 'baby-bottle' },
] as const;

const GOAL_OPTIONS = [
  { value: 'MAINTAIN_WEIGHT', label: 'Maintain weight', icon: 'target' },
  { value: 'LOSE_WEIGHT', label: 'Lose weight', icon: 'arrow-down-bold' },
  { value: 'GAIN_WEIGHT', label: 'Gain weight', icon: 'arrow-up-bold' },
] as const;

type Option = {
  value: string;
  label: string;
  icon: string;
};

type ChoiceChipsProps = {
  value?: string | null;
  onChange: (value: string) => void;
  options: readonly Option[];
  disabled?: boolean;
};

function ChoiceChips({ value, onChange, options, disabled }: ChoiceChipsProps) {
  return (
    <View style={styles.chipsRow}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Button
            key={opt.value}
            mode={selected ? 'contained' : 'outlined'}
            icon={opt.icon}
            onPress={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            compact
            style={styles.chipButton}
            contentStyle={styles.chipContent}
          >
            {opt.label}
          </Button>
        );
      })}
    </View>
  );
}

export default function CompleteProfile() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const containerStyle = useMemo(() => [{ maxWidth: isWide ? s(520) : s(480) }], [isWide]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UserDetailsFormValues>({
    resolver: zodResolver(userDetailsSchema) as Resolver<UserDetailsFormValues>,
    defaultValues: {
      kilograms: undefined as any,
      height: undefined as any,
      age: undefined as any,
      workoutState: undefined as any,
      gender: undefined as any,
      goal: undefined as any,
      diet: '',
    },
    mode: 'onChange',
  });

  const updateMutation = useUpdateUserDetails((fieldErrors) => {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field as keyof UserDetailsFormValues, {
        type: 'server',
        message,
      });
    });
  });

  const logoutMutation = useLogout();

  const interactionDisabled = isSubmitting || updateMutation.isPending;
  const disableButton = interactionDisabled || !isValid;

  const onSubmit = (values: UserDetailsFormValues) => {
    if (interactionDisabled) return;

    const payload: UserDetailsRequest = {
      kilograms: values.kilograms,
      height: values.height,
      age: values.age,
      workoutState: values.workoutState,
      gender: values.gender,
      goal: values.goal,
      ...(values.diet && values.diet.trim() ? { diet: values.diet.trim() } : {}),
    };

    updateMutation.mutate(payload);
  };

  const handleLogout = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate();
  };

  return (
    <SafeAreaView
      style={[styles.page, { backgroundColor: theme.colors.background }]}
      edges={['right', 'bottom', 'left', 'top']}
    >
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.inner, containerStyle]}>
            {/* header */}
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
                Complete your profile
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                All fields are required unless marked as optional.
              </Text>
            </View>

            {/* steps */}
            <AuthSteps currentStep={2} />

            {/* numeric fields */}
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
                      value={value === null || value === undefined ? '' : String(value)}
                      onChangeText={(text) => onChange(text as any)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="weight-kilogram" />}
                      style={[styles.input, { backgroundColor: theme.colors.surface }]}
                      error={!!errors.kilograms}
                      editable={!interactionDisabled}
                    />
                    {!!errors.kilograms && (
                      <HelperText type="error" visible style={styles.helper}>
                        {errors.kilograms.message}
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
                      value={value === null || value === undefined ? '' : String(value)}
                      onChangeText={(text) => onChange(text as any)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="human-male-height-variant" />}
                      style={[styles.input, { backgroundColor: theme.colors.surface }]}
                      error={!!errors.height}
                      editable={!interactionDisabled}
                    />
                    {!!errors.height && (
                      <HelperText type="error" visible style={styles.helper}>
                        {errors.height.message}
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
                      value={value === null || value === undefined ? '' : String(value)}
                      onChangeText={(text) => onChange(text as any)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="calendar" />}
                      style={[styles.input, { backgroundColor: theme.colors.surface }]}
                      error={!!errors.age}
                      editable={!interactionDisabled}
                    />
                    {!!errors.age && (
                      <HelperText type="error" visible style={styles.helper}>
                        {errors.age.message}
                      </HelperText>
                    )}
                  </>
                )}
              />
            </View>

            {/* Workout state */}
            <Controller
              control={control}
              name="workoutState"
              render={({ field: { value, onChange } }) => (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Activity level *</Text>
                  {isWide ? (
                    <SegmentedButtons
                      value={value ?? ''}
                      onValueChange={(val) => onChange(val as any)}
                      buttons={WORKOUT_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        icon: opt.icon,
                        disabled: interactionDisabled,
                      }))}
                    />
                  ) : (
                    <ChoiceChips
                      value={value}
                      onChange={(val) => onChange(val as any)}
                      options={WORKOUT_OPTIONS}
                      disabled={interactionDisabled}
                    />
                  )}
                  {!!errors.workoutState && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.workoutState.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            {/* Gender */}
            <Controller
              control={control}
              name="gender"
              render={({ field: { value, onChange } }) => (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Gender *</Text>
                  {isWide ? (
                    <SegmentedButtons
                      value={value ?? ''}
                      onValueChange={(val) => onChange(val as any)}
                      buttons={GENDER_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        icon: opt.icon,
                        disabled: interactionDisabled,
                      }))}
                    />
                  ) : (
                    <ChoiceChips
                      value={value}
                      onChange={(val) => onChange(val as any)}
                      options={GENDER_OPTIONS}
                      disabled={interactionDisabled}
                    />
                  )}
                  {!!errors.gender && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.gender.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            {/* Goal */}
            <Controller
              control={control}
              name="goal"
              render={({ field: { value, onChange } }) => (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Goal *</Text>
                  {isWide ? (
                    <SegmentedButtons
                      value={value ?? ''}
                      onValueChange={(val) => onChange(val as any)}
                      buttons={GOAL_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        icon: opt.icon,
                        disabled: interactionDisabled,
                      }))}
                    />
                  ) : (
                    <ChoiceChips
                      value={value}
                      onChange={(val) => onChange(val as any)}
                      options={GOAL_OPTIONS}
                      disabled={interactionDisabled}
                    />
                  )}
                  {!!errors.goal && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.goal.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            {/* Diet (optional) */}
            <Controller
              control={control}
              name="diet"
              render={({ field: { value, onChange, onBlur } }) => (
                <>
                  <TextInput
                    mode="outlined"
                    label="Diet (optional)"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    multiline
                    numberOfLines={3}
                    editable={!interactionDisabled}
                    left={<TextInput.Icon icon="food-apple-outline" />}
                  />
                  {!!errors.diet && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.diet.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            {/* submit */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              disabled={disableButton}
              loading={interactionDisabled}
              style={styles.button}
            >
              Save and continue
            </Button>

            {/* logout */}
            <Button
              mode="text"
              onPress={handleLogout}
              style={styles.logoutButton}
              loading={logoutMutation.isPending}
              disabled={logoutMutation.isPending}
            >
              Log out
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingVertical: vs(16),
  },
  flex1: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    gap: s(14),
  },
  header: {
    alignItems: 'center',
    marginBottom: vs(4),
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: vs(4),
    opacity: 0.9,
    fontSize: ms(14, 0.2),
    textAlign: 'center',
  },
  fieldGroup: {
    gap: s(10),
    marginTop: vs(6),
  },
  input: {
    fontSize: ms(16, 0.2),
  },
  helper: {
    marginTop: -vs(6),
  },
  group: {
    marginTop: vs(10),
    gap: vs(4),
  },
  groupLabel: {
    fontSize: ms(14, 0.2),
    fontWeight: '500',
  },
  button: {
    borderRadius: s(12),
    marginTop: vs(12),
  },
  logoutButton: {
    marginTop: vs(4),
    alignSelf: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: vs(4),
  },
  chipButton: {
    marginRight: s(8),
    marginBottom: vs(6),
    borderRadius: s(999),
  },
  chipContent: {
    paddingHorizontal: s(10),
  },
});
