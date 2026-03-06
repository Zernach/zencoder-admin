import React, { useCallback } from "react";
import { Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface CreateHumanFormProps {
  onSubmit: (values: { name: string; email: string; teamId: string }) => void;
  loading?: boolean;
  error?: string;
}

interface FormFields {
  name: string;
  email: string;
  teamId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  teamId?: string;
}

const INITIAL_FIELDS: FormFields = { name: "", email: "", teamId: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateHumanForm({ onSubmit, loading, error }: CreateHumanFormProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = "Full name is required";
    if (!fields.email.trim()) errors.email = "Email is required";
    else if (!EMAIL_RE.test(fields.email.trim())) errors.email = "Invalid email address";
    if (!fields.teamId.trim()) errors.teamId = "Team ID is required";
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors
        ? undefined
        : { name: fields.name.trim(), email: fields.email.trim(), teamId: fields.teamId.trim() },
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
        label: "Full Name",
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: "e.g. Jane Doe",
      },
    },
    {
      key: "email",
      type: "input",
      inputProps: {
        label: "Email",
        defaultValue: formFieldsRef.current.email,
        onChangeText: (text: string) => updateFormFields({ email: text }),
        error: errorsRef.current.email,
        placeholder: "e.g. jane@company.com",
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
      title="Add Seat / Team Member"
      items={items}
      footer={
        <>
          {error ? <Text style={[styles.errorText, { color: theme.state.error }]}>{error}</Text> : null}
          <CustomButton
            onPress={onPressSubmit}
            style={[styles.submitButton, { backgroundColor: theme.border.brand }]}
            accessibilityRole="button"
            accessibilityLabel="Add Seat"
            disabled={loading}
          >
            <Text style={[styles.submitText, { color: theme.text.onBrand }]}>
              {loading ? "Adding..." : "Add Seat"}
            </Text>
          </CustomButton>
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
