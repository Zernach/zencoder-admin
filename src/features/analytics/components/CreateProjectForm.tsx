import React, { useCallback } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface CreateProjectFormProps {
  onSubmit: (values: { name: string; teamId: string }) => void;
  loading?: boolean;
  error?: string;
}

interface FormFields {
  name: string;
  teamId: string;
}

interface FormErrors {
  name?: string;
  teamId?: string;
}

const INITIAL_FIELDS: FormFields = { name: "", teamId: "" };

export function CreateProjectForm({ onSubmit, loading, error }: CreateProjectFormProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = "Project name is required";
    if (!fields.teamId.trim()) errors.teamId = "Team ID is required";
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors
        ? undefined
        : { name: fields.name.trim(), teamId: fields.teamId.trim() },
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
        label: "Project Name",
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: "e.g. Frontend Dashboard",
      },
    },
    {
      key: "teamId",
      type: "input",
      inputProps: {
        label: "Team ID",
        defaultValue: formFieldsRef.current.teamId,
        onChangeText: (text: string) => updateFormFields({ teamId: text }),
        error: errorsRef.current.teamId,
        placeholder: "e.g. team_engineering",
      },
    },
  ];

  return (
    <InputForm
      title="Create Project"
      items={items}
      footer={
        <>
          {error ? <Text style={[styles.errorText, { color: theme.state.error }]}>{error}</Text> : null}
          <Pressable
            onPress={onPressSubmit}
            style={[styles.submitButton, { backgroundColor: theme.border.brand }]}
            accessibilityRole="button"
            accessibilityLabel="Create Project"
            disabled={loading}
          >
            <Text style={[styles.submitText, { color: theme.text.onBrand }]}>
              {loading ? "Creating..." : "Create Project"}
            </Text>
          </Pressable>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
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
