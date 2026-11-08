import { Ref } from 'react';
import { StyleSheet, Text, TextInput, TextInputInstance, TextInputProps, View } from 'react-native';

import { theme } from '../constants/theme';
import { FieldError } from './FieldError';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  // Texto pequeno ao lado do nome do campo, ex.: "(Opcional)"
  labelHint?: string;
  // Campo preenchido pelo app (ex.: pelo CEP): aparece cinza e não aceita digitação
  readOnly?: boolean;
  inputRef?: Ref<TextInputInstance>;
};

// Campo de texto com nome em cima e a mensagem de erro embaixo
export function FormField({
  label,
  error,
  labelHint,
  readOnly = false,
  inputRef,
  style,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {labelHint ? <Text style={styles.labelHint}> {labelHint}</Text> : null}
      </Text>
      <TextInput
        accessibilityHint={error}
        accessibilityLabel={label}
        editable={!readOnly}
        placeholderTextColor={theme.colors.placeholder}
        ref={inputRef}
        style={[
          styles.input,
          readOnly ? styles.inputReadOnly : null,
          error ? styles.inputError : null,
          style,
        ]}
        {...inputProps}
      />
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    alignSelf: 'stretch',
  },
  label: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    marginBottom: theme.spacing.tiny,
  },
  labelHint: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  input: {
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    minHeight: theme.spacing.footer,
    paddingHorizontal: theme.spacing.input,
  },
  inputReadOnly: {
    backgroundColor: theme.colors.iconButton,
    borderColor: theme.colors.iconButton,
    color: theme.colors.textMuted,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
});
