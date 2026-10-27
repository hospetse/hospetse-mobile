import { ComponentRef, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { theme } from '../constants/theme';

type CodeInputProps = {
  length?: number;
  onChange: (code: string) => void;
  value: string;
};

// Caixas individuais para digitar um codigo, uma por digito
export function CodeInput({ length = 6, onChange, value }: CodeInputProps) {
  const inputs = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);

  function handleChange(text: string, index: number) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const digits = value.padEnd(length, ' ').split('');
    digits[index] = digit || ' ';
    onChange(digits.join('').trimEnd());

    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleBackspace(key: string, index: number) {
    if (key === 'Backspace' && !value[index]?.trim() && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.container}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          accessibilityLabel={`Dígito ${index + 1} do código`}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
          ref={(input) => {
            inputs.current[index] = input;
          }}
          selectTextOnFocus
          style={styles.box}
          value={value[index]?.trim() ?? ''}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.input,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.title,
    height: theme.spacing.codeBoxHeight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
    textAlign: 'center',
    width: theme.spacing.codeBoxWidth,
  },
});
