import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import type { Severity } from "@/features/analytics/types";

interface CreateComplianceRuleFormProps {
  onSubmit: (values: { name: string; description: string; severity: Severity }) => void;
  loading?: boolean;
}

interface FormFields {
  name: string;
  description: string;
  severity: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  severity?: string;
}

const INITIAL_FIELDS: FormFields = { name: "", description: "", severity: "MEDIUM" };

const SEVERITY_OPTIONS: Severity[] = ["HIGH", "MEDIUM", "LOW"];

export function CreateComplianceRuleForm({ onSubmit, loading }: CreateComplianceRuleFormProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = "Name is required";
    if (!fields.description.trim()) errors.description = "Description is required";
    if (!SEVERITY_OPTIONS.includes(fields.severity as Severity)) errors.severity = "Invalid severity";
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors
        ? undefined
        : { name: fields.name.trim(), description: fields.description.trim(), severity: fields.severity as Severity },
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
        label: "Rule Name",
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: "e.g. Max token limit exceeded",
      },
    },
    {
      key: "description",
      type: "input",
      inputProps: {
        label: "Description",
        defaultValue: formFieldsRef.current.description,
        onChangeText: (text: string) => updateFormFields({ description: text }),
        error: errorsRef.current.description,
        placeholder: "Describe when this rule triggers",
      },
    },
    {
      key: "severity",
      type: "input",
      inputProps: {
        label: "Severity (HIGH, MEDIUM, LOW)",
        defaultValue: formFieldsRef.current.severity,
        onChangeText: (text: string) => updateFormFields({ severity: text }),
        error: errorsRef.current.severity,
        placeholder: "MEDIUM",
      },
    },
  ];

  return (
    <InputForm
      title="Create Compliance Rule"
      items={items}
      footer={
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
});
