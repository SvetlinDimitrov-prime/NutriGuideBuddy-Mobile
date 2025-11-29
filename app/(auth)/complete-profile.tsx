// app/(auth)/complete-profile.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

import { useLogout } from '@/api/hooks/useAuth';
import { useUpdateUserDetails } from '@/api/hooks/useUserDetails';
import type { UserDetailsRequest } from '@/api/types/userDetails';
import { UserDetailsFormValues, userDetailsSchema } from '@/api/validation/userDetailsSchema';

import { AuthSteps } from '@/components/auth/complete-profile/AuthSteps';
import PageShell from '@/components/PageShell';
import { ChoiceOption } from '@/components/auth/complete-profile/ChoiceChips';
import NumericFieldsSection from '@/components/auth/complete-profile/NumericFieldsSection';
import SegmentedChoiceField from '@/components/auth/complete-profile/SegmentedChoiceField';

const WORKOUT_OPTIONS: readonly ChoiceOption[] = [
  { value: 'SEDENTARY', label: 'Sedentary', icon: 'sofa-single' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly active', icon: 'walk' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately active', icon: 'run' },
  { value: 'VERY_ACTIVE', label: 'Very active', icon: 'run-fast' },
  { value: 'SUPER_ACTIVE', label: 'Super active', icon: 'lightning-bolt' },
] as const;

const GENDER_OPTIONS: readonly ChoiceOption[] = [
  { value: 'MALE', label: 'Male', icon: 'gender-male' },
  { value: 'FEMALE', label: 'Female', icon: 'gender-female' },
  { value: 'FEMALE_PREGNANT', label: 'Female – pregnant', icon: 'human-pregnant' },
  { value: 'FEMALE_LACTATING', label: 'Female – lactating', icon: 'baby-bottle' },
] as const;

const GOAL_OPTIONS: readonly ChoiceOption[] = [
  { value: 'MAINTAIN_WEIGHT', label: 'Maintain weight', icon: 'target' },
  { value: 'LOSE_WEIGHT', label: 'Lose weight', icon: 'arrow-down-bold' },
  { value: 'GAIN_WEIGHT', label: 'Gain weight', icon: 'arrow-up-bold' },
] as const;

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
      // diet removed from UI; leave out here as well
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
      // diet is no longer sent – backend will use its default/null
    };

    updateMutation.mutate(payload);
  };

  const handleLogout = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate();
  };

  return (
    <PageShell scrollable contentStyle={styles.content}>
      <View style={[styles.inner, containerStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
            Complete your profile
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            All fields are required unless marked as optional.
          </Text>
        </View>

        {/* Stepper */}
        <AuthSteps currentStep={2} />

        {/* Numeric fields */}
        <NumericFieldsSection
          control={control}
          errors={errors}
          theme={theme}
          disabled={interactionDisabled}
        />

        {/* Workout state */}
        <SegmentedChoiceField
          control={control}
          name="workoutState"
          label="Activity level *"
          options={WORKOUT_OPTIONS}
          error={errors.workoutState?.message}
          isWide={isWide}
          disabled={interactionDisabled}
        />

        {/* Gender */}
        <SegmentedChoiceField
          control={control}
          name="gender"
          label="Gender *"
          options={GENDER_OPTIONS}
          error={errors.gender?.message}
          isWide={isWide}
          disabled={interactionDisabled}
        />

        {/* Goal */}
        <SegmentedChoiceField
          control={control}
          name="goal"
          label="Goal *"
          options={GOAL_OPTIONS}
          error={errors.goal?.message}
          isWide={isWide}
          disabled={interactionDisabled}
        />

        {/* Submit */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          disabled={disableButton}
          loading={interactionDisabled}
          style={styles.button}
        >
          Save and continue
        </Button>

        {/* Logout */}
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
    </PageShell>
  );
}

const styles = StyleSheet.create({
  content: {
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
  button: {
    borderRadius: s(12),
    marginTop: vs(12),
  },
  logoutButton: {
    marginTop: vs(4),
    alignSelf: 'center',
  },
});
