import React, { useCallback } from "react";
import { Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";

interface CreateAgentFormProps {
  onSubmit: (values: { name: string; projectId: string }) => void;
  loading?: boolean;
  error?: string;
}

interface FormFields {
  name: string;
  projectId: string;
}

interface FormErrors {
  name?: string;
  projectId?: string;
}

const INITIAL_FIELDS: FormFields = { name: "", projectId: "" };

export function CreateAgentForm({ onSubmit, loading, error }: CreateAgentFormProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = "Agent name is required";
    if (!fields.projectId.trim()) errors.projectId = "Project ID is required";
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors
        ? undefined
        : { name: fields.name.trim(), projectId: fields.projectId.trim() },
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
        label: "Agent Name",
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: "e.g. Code Review Bot",
      },
    },
    {
      key: "projectId",
      type: "input",
      inputProps: {
        label: "Project ID",
        defaultValue: formFieldsRef.current.projectId,
        onChangeText: (text: string) => updateFormFields({ projectId: text }),
        error: errorsRef.current.projectId,
        placeholder: "e.g. proj_dashboard",
      },
    },
  ];

  return (
    <InputForm
      title="Create Agent"
      items={items}
      footer={
        <>
          {error ? <Text style={[styles.errorText, { color: theme.state.error }]}>{error}</Text> : null}
          <CustomButton
            onPress={onPressSubmit}
            style={styles.submitButton}
            buttonMode="primary"
            buttonSize="lg"
            label="Submit"
            accessibilityRole="button"
            accessibilityLabel="Submit"
            disabled={loading}
          />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: spacing[4],
  },
  errorText: {
    fontSize: 12,
    textAlign: "center",
  },
});
