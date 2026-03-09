import React, { useCallback } from "react";
import { Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface CreateTeamFormProps {
  onSubmit: (values: { name: string }) => void;
  loading?: boolean;
  error?: string;
}

interface FormFields {
  name: string;
}

interface FormErrors {
  name?: string;
}

const INITIAL_FIELDS: FormFields = { name: "" };

export function CreateTeamForm({ onSubmit, loading, error }: CreateTeamFormProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = "Team name is required";
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors ? undefined : { name: fields.name.trim() },
    };
  }, []);

  const { formFieldsRef, errorsRef, updateFormFields, onPressSubmit } = useFormFields({
    initialFields: INITIAL_FIELDS,
    onSubmit,
    validate,
  });

  const items: InputFormItem[] = [
    {
      key: "name",
      type: "input",
      inputProps: {
        label: "Team Name",
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: "e.g. Platform Engineering",
      },
    },
  ];

  return (
    <InputForm
      title="Create Team"
      items={items}
      footer={
        <>
          {error ? <Text style={[styles.errorText, { color: theme.state.error }]}>{error}</Text> : null}
          <CustomButton
            onPress={onPressSubmit}
            style={[styles.submitButton, { borderColor: theme.border.brand }]}
            accessibilityRole="button"
            accessibilityLabel="Submit"
            disabled={loading}
          >
            <Text style={[styles.submitText, { color: theme.border.brand }]}>
              Submit
            </Text>
          </CustomButton>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    textAlign: "center",
  },
});
