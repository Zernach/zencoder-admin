import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing } from "@/theme/tokens";

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
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = t("modals.createProject.projectNameRequired");
    if (!fields.teamId.trim()) errors.teamId = t("modals.createProject.teamIdRequired");
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors
        ? undefined
        : { name: fields.name.trim(), teamId: fields.teamId.trim() },
    };
  }, [t]);

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
        label: t("modals.createProject.projectName"),
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: t("modals.createProject.projectNamePlaceholder"),
      },
    },
    {
      key: "teamId",
      type: "input",
      inputProps: {
        label: t("modals.createProject.teamId"),
        defaultValue: formFieldsRef.current.teamId,
        onChangeText: (text: string) => updateFormFields({ teamId: text }),
        error: errorsRef.current.teamId,
        placeholder: t("modals.createProject.teamIdPlaceholder"),
      },
    },
  ];

  return (
    <InputForm
      title={t("modals.createProject")}
      items={items}
      footer={
        <>
          {error ? <Text style={[styles.errorText, { color: theme.state.error }]}>{error}</Text> : null}
          <CustomButton
            onPress={onPressSubmit}
            style={styles.submitButton}
            buttonMode="primary"
            buttonSize="lg"
            label={t("common.submit")}
            accessibilityRole="button"
            accessibilityLabel={t("common.submit")}
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
