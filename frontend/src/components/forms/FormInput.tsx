import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { COLORS } from "../styles";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  characterCount?: number;
  maxCharacters?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  characterCount,
  maxCharacters,
  multiline = false,
  numberOfLines = 1,
  style,
  ...textInputProps
}) => {
  const inputStyle = multiline ? styles.textArea : styles.input;
  const hasError = !!error;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      <TextInput
        style={[inputStyle, hasError && styles.inputError, style]}
        placeholderTextColor={COLORS.gray}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...textInputProps}
      />

      {hasError && <Text style={styles.errorText}>{error}</Text>}

      {characterCount !== undefined && maxCharacters && (
        <Text style={styles.characterCount}>
          {characterCount}/{maxCharacters} characters
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "right",
    marginTop: 4,
  },
});

export default FormInput;
