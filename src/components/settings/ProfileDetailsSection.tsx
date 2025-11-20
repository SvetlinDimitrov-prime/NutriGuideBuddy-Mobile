import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
  Button,
  Divider,
  List,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';

import { useUpdateUserDetails } from '@/api/hooks/useUserDetails';

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
  { value: 'FEMALE_PREGNANT', label: 'Pregnant', icon: 'human-pregnant' },
  { value: 'FEMALE_LACTATING', label: 'Lactating', icon: 'baby-bottle' },
] as const;

const GOAL_OPTIONS = [
  { value: 'MAINTAIN_WEIGHT', label: 'Maintain', icon: 'target' },
  { value: 'LOSE_WEIGHT', label: 'Lose', icon: 'arrow-down-bold' },
  { value: 'GAIN_WEIGHT', label: 'Gain', icon: 'arrow-up-bold' },
] as const;

type Option = { value: string; label: string; icon: string };

type Props = {
  styles: any;
  twoCols: boolean;
  globalBusy: boolean;
  userDetails: {
    age?: number | null;
    kilograms?: number | null;
    height?: number | null;
    gender?: string | null;
    workoutState?: string | null;
    goal?: string | null;
    diet?: string | null;
  };
};

function valueToLabel(value: string | null | undefined, options: readonly Option[]) {
  return options.find((o) => o.value === value)?.label ?? value ?? '—';
}

/** ✅ stable left-icon renderers */
const CalendarLeft = (props: any) => <List.Icon {...props} icon="calendar" />;
const WeightLeft = (props: any) => <List.Icon {...props} icon="scale-bathroom" />;
const HeightLeft = (props: any) => <List.Icon {...props} icon="human-male-height" />;
const GenderLeft = (props: any) => <List.Icon {...props} icon="gender-male-female" />;
const WorkoutLeft = (props: any) => <List.Icon {...props} icon="run-fast" />;
const GoalLeft = (props: any) => <List.Icon {...props} icon="target" />;
const DietLeft = (props: any) => <List.Icon {...props} icon="food-apple-outline" />;

function ChoiceChips({
  value,
  onChange,
  options,
  disabled,
  styles,
}: {
  value?: string | null;
  onChange: (val: string) => void;
  options: readonly Option[];
  disabled?: boolean;
  styles: any;
}) {
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

export default function ProfileDetailsSection({ styles, twoCols, globalBusy, userDetails }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const updateDetailsMutation = useUpdateUserDetails();
  const busy = globalBusy || updateDetailsMutation.isPending;

  const [isEditing, setIsEditing] = useState(false);

  const [age, setAge] = useState('');
  const [kilograms, setKilograms] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [workoutState, setWorkoutState] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [diet, setDiet] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setAge(userDetails.age != null ? String(userDetails.age) : '');
      setKilograms(userDetails.kilograms != null ? String(userDetails.kilograms) : '');
      setHeight(userDetails.height != null ? String(userDetails.height) : '');
      setGender(userDetails.gender ?? null);
      setWorkoutState(userDetails.workoutState ?? null);
      setGoal(userDetails.goal ?? null);
      setDiet(userDetails.diet ?? '');
    }
  }, [userDetails, isEditing]);

  const startEdit = () => {
    if (busy) return;
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const detailsChanged =
    age.trim() !== (userDetails.age != null ? String(userDetails.age) : '') ||
    kilograms.trim() !== (userDetails.kilograms != null ? String(userDetails.kilograms) : '') ||
    height.trim() !== (userDetails.height != null ? String(userDetails.height) : '') ||
    (gender ?? '') !== (userDetails.gender ?? '') ||
    (workoutState ?? '') !== (userDetails.workoutState ?? '') ||
    (goal ?? '') !== (userDetails.goal ?? '') ||
    diet.trim() !== (userDetails.diet ?? '');

  const saveDisabled = busy || !detailsChanged;

  const handleSave = async () => {
    if (busy) return;

    const payload = {
      kilograms: kilograms.trim() ? Number(kilograms.trim().replace(',', '.')) : undefined,
      height: height.trim() ? Number(height.trim().replace(',', '.')) : undefined,
      age: age.trim() ? Number(age.trim()) : undefined,
      workoutState: workoutState ?? undefined,
      gender: gender ?? undefined,
      goal: goal ?? undefined,
      diet: diet.trim() || undefined,
    };

    try {
      await updateDetailsMutation.mutateAsync(payload as any);
      setIsEditing(false);
    } catch {
      // handled by mutation toasts
    }
  };

  return (
    <Surface style={styles.section} elevation={1}>
      <View style={styles.profileHeaderRow}>
        <Text style={styles.sectionTitle}>Health details</Text>

        {!isEditing ? (
          <Button mode="text" compact onPress={startEdit} disabled={busy}>
            Edit
          </Button>
        ) : (
          <View style={styles.editActionsRow}>
            <Button mode="text" compact onPress={cancelEdit} disabled={busy}>
              Cancel
            </Button>
            <Button
              mode="contained"
              compact
              onPress={handleSave}
              disabled={saveDisabled}
              loading={updateDetailsMutation.isPending}
            >
              Save
            </Button>
          </View>
        )}
      </View>

      <List.Section style={styles.listSection}>
        {/* =========================
            VIEW MODE (twoCols)
            ========================= */}
        {twoCols && !isEditing && (
          <>
            {/* Row 1: Age | Weight */}
            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <List.Item
                  left={CalendarLeft}
                  description="Age"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <Text style={styles.itemTitleText}>
                      {userDetails.age != null ? userDetails.age : '—'}
                    </Text>
                  }
                />
              </View>
              <View style={styles.detailCol}>
                <List.Item
                  left={WeightLeft}
                  description="Weight (kg)"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <Text style={styles.itemTitleText}>
                      {userDetails.kilograms != null ? userDetails.kilograms : '—'}
                    </Text>
                  }
                />
              </View>
            </View>
            <Divider />

            {/* Row 2: Height | Gender */}
            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <List.Item
                  left={HeightLeft}
                  description="Height (cm)"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <Text style={styles.itemTitleText}>
                      {userDetails.height != null ? userDetails.height : '—'}
                    </Text>
                  }
                />
              </View>
              <View style={styles.detailCol}>
                <List.Item
                  left={GenderLeft}
                  description="Gender"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <Text style={styles.itemTitleText}>
                      {valueToLabel(userDetails.gender, GENDER_OPTIONS)}
                    </Text>
                  }
                />
              </View>
            </View>
            <Divider />

            {/* Row 3: Activity | Goal */}
            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <List.Item
                  left={WorkoutLeft}
                  description="Activity level"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <Text style={styles.itemTitleText}>
                      {valueToLabel(userDetails.workoutState, WORKOUT_OPTIONS)}
                    </Text>
                  }
                />
              </View>
              <View style={styles.detailCol}>
                <List.Item
                  left={GoalLeft}
                  description="Goal"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <Text style={styles.itemTitleText}>
                      {valueToLabel(userDetails.goal, GOAL_OPTIONS)}
                    </Text>
                  }
                />
              </View>
            </View>
            <Divider />

            {/* Row 4: Diet | empty */}
            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <List.Item
                  left={DietLeft}
                  description="Diet"
                  descriptionStyle={styles.descriptionSpaced}
                  title={<Text style={styles.itemTitleText}>{userDetails.diet ?? '—'}</Text>}
                />
              </View>
              <View style={styles.detailCol} />
            </View>
          </>
        )}

        {/* =========================
            EDIT MODE (twoCols)
            numeric pairs stay 2 cols,
            enums get full width
            ========================= */}
        {twoCols && isEditing && (
          <>
            {/* Row 1: Age | Weight */}
            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <List.Item
                  left={CalendarLeft}
                  description="Age"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <TextInput
                      mode="flat"
                      dense
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      editable={!busy}
                      style={styles.inlineInput}
                    />
                  }
                />
              </View>
              <View style={styles.detailCol}>
                <List.Item
                  left={WeightLeft}
                  description="Weight (kg)"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <TextInput
                      mode="flat"
                      dense
                      value={kilograms}
                      onChangeText={setKilograms}
                      keyboardType="numeric"
                      editable={!busy}
                      style={styles.inlineInput}
                    />
                  }
                />
              </View>
            </View>
            <Divider />

            {/* Row 2: Height | Diet */}
            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <List.Item
                  left={HeightLeft}
                  description="Height (cm)"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <TextInput
                      mode="flat"
                      dense
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                      editable={!busy}
                      style={styles.inlineInput}
                    />
                  }
                />
              </View>
              <View style={styles.detailCol}>
                <List.Item
                  left={DietLeft}
                  description="Diet"
                  descriptionStyle={styles.descriptionSpaced}
                  title={
                    <TextInput
                      mode="flat"
                      dense
                      value={diet}
                      onChangeText={setDiet}
                      editable={!busy}
                      style={styles.inlineInput}
                    />
                  }
                />
              </View>
            </View>
            <Divider />

            {/* Gender full width */}
            <List.Item
              left={GenderLeft}
              description="Gender"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isWide ? (
                  <SegmentedButtons
                    value={gender ?? ''}
                    onValueChange={(val) => setGender(val)}
                    buttons={GENDER_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                      icon: o.icon,
                      disabled: busy,
                    }))}
                  />
                ) : (
                  <ChoiceChips
                    value={gender}
                    onChange={setGender}
                    options={GENDER_OPTIONS}
                    disabled={busy}
                    styles={styles}
                  />
                )
              }
            />
            <Divider />

            {/* Activity full width */}
            <List.Item
              left={WorkoutLeft}
              description="Activity level"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isWide ? (
                  <SegmentedButtons
                    value={workoutState ?? ''}
                    onValueChange={(val) => setWorkoutState(val)}
                    buttons={WORKOUT_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                      icon: o.icon,
                      disabled: busy,
                    }))}
                  />
                ) : (
                  <ChoiceChips
                    value={workoutState}
                    onChange={setWorkoutState}
                    options={WORKOUT_OPTIONS}
                    disabled={busy}
                    styles={styles}
                  />
                )
              }
            />
            <Divider />

            {/* Goal full width */}
            <List.Item
              left={GoalLeft}
              description="Goal"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isWide ? (
                  <SegmentedButtons
                    value={goal ?? ''}
                    onValueChange={(val) => setGoal(val)}
                    buttons={GOAL_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                      icon: o.icon,
                      disabled: busy,
                    }))}
                  />
                ) : (
                  <ChoiceChips
                    value={goal}
                    onChange={setGoal}
                    options={GOAL_OPTIONS}
                    disabled={busy}
                    styles={styles}
                  />
                )
              }
            />
          </>
        )}

        {/* =========================
            SMALL SCREENS (stacked)
            keep your old behavior
            ========================= */}
        {!twoCols && (
          <>
            <List.Item
              left={CalendarLeft}
              description="Age"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isEditing ? (
                  <TextInput
                    mode="flat"
                    dense
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    editable={!busy}
                    style={styles.inlineInput}
                  />
                ) : (
                  <Text style={styles.itemTitleText}>
                    {userDetails.age != null ? userDetails.age : '—'}
                  </Text>
                )
              }
            />
            <Divider />
            <List.Item
              left={WeightLeft}
              description="Weight (kg)"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isEditing ? (
                  <TextInput
                    mode="flat"
                    dense
                    value={kilograms}
                    onChangeText={setKilograms}
                    keyboardType="numeric"
                    editable={!busy}
                    style={styles.inlineInput}
                  />
                ) : (
                  <Text style={styles.itemTitleText}>
                    {userDetails.kilograms != null ? userDetails.kilograms : '—'}
                  </Text>
                )
              }
            />
            <Divider />
            <List.Item
              left={HeightLeft}
              description="Height (cm)"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isEditing ? (
                  <TextInput
                    mode="flat"
                    dense
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    editable={!busy}
                    style={styles.inlineInput}
                  />
                ) : (
                  <Text style={styles.itemTitleText}>
                    {userDetails.height != null ? userDetails.height : '—'}
                  </Text>
                )
              }
            />
            <Divider />
            <List.Item
              left={GenderLeft}
              description="Gender"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isEditing ? (
                  isWide ? (
                    <SegmentedButtons
                      value={gender ?? ''}
                      onValueChange={(val) => setGender(val)}
                      buttons={GENDER_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                        icon: o.icon,
                        disabled: busy,
                      }))}
                    />
                  ) : (
                    <ChoiceChips
                      value={gender}
                      onChange={setGender}
                      options={GENDER_OPTIONS}
                      disabled={busy}
                      styles={styles}
                    />
                  )
                ) : (
                  <Text style={styles.itemTitleText}>
                    {valueToLabel(userDetails.gender, GENDER_OPTIONS)}
                  </Text>
                )
              }
            />
            <Divider />
            <List.Item
              left={WorkoutLeft}
              description="Activity level"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isEditing ? (
                  isWide ? (
                    <SegmentedButtons
                      value={workoutState ?? ''}
                      onValueChange={(val) => setWorkoutState(val)}
                      buttons={WORKOUT_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                        icon: o.icon,
                        disabled: busy,
                      }))}
                    />
                  ) : (
                    <ChoiceChips
                      value={workoutState}
                      onChange={setWorkoutState}
                      options={WORKOUT_OPTIONS}
                      disabled={busy}
                      styles={styles}
                    />
                  )
                ) : (
                  <Text style={styles.itemTitleText}>
                    {valueToLabel(userDetails.workoutState, WORKOUT_OPTIONS)}
                  </Text>
                )
              }
            />
            <Divider />
            <List.Item
              left={GoalLeft}
              description="Goal"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isEditing ? (
                  isWide ? (
                    <SegmentedButtons
                      value={goal ?? ''}
                      onValueChange={(val) => setGoal(val)}
                      buttons={GOAL_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                        icon: o.icon,
                        disabled: busy,
                      }))}
                    />
                  ) : (
                    <ChoiceChips
                      value={goal}
                      onChange={setGoal}
                      options={GOAL_OPTIONS}
                      disabled={busy}
                      styles={styles}
                    />
                  )
                ) : (
                  <Text style={styles.itemTitleText}>
                    {valueToLabel(userDetails.goal, GOAL_OPTIONS)}
                  </Text>
                )
              }
            />
            <Divider />
            <List.Item
              left={DietLeft}
              description="Diet"
              descriptionStyle={styles.descriptionSpaced}
              title={
                isEditing ? (
                  <TextInput
                    mode="flat"
                    dense
                    value={diet}
                    onChangeText={setDiet}
                    editable={!busy}
                    style={styles.inlineInput}
                  />
                ) : (
                  <Text style={styles.itemTitleText}>{userDetails.diet ?? '—'}</Text>
                )
              }
            />
          </>
        )}
      </List.Section>
    </Surface>
  );
}
