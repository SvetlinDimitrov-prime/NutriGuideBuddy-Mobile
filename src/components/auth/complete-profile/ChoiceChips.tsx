// components/auth/complete-profile/ChoiceChips.tsx
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';

export type ChoiceOption = {
  value: string;
  label: string;
  icon: string;
};

type Props = {
  value?: string | null;
  onChange: (value: string) => void;
  options: readonly ChoiceOption[];
  disabled?: boolean;
};

export function ChoiceChips({ value, onChange, options, disabled }: Props) {
  return (
    <View style={styles.row}>
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

const styles = StyleSheet.create({
  row: {
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

export default ChoiceChips;
