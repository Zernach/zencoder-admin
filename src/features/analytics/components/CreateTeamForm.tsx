import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Text, StyleSheet } from "react-native";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface CreateTeamFormProps {
  onSubmit: (values: { name: string }) => void;
  onCancel?: () => void;
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

export function CreateTeamForm({ onSubmit, onCancel, loading, error }: CreateTeamFormProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = t("modals.createTeam.teamNameRequired");
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors ? undefined : { name: fields.name.trim() },
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
        label: t("modals.createTeam.teamName"),
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: t("modals.createTeam.teamNamePlaceholder"),
      },
    },
  ];

  return (
    <InputForm
      title={t("modals.createTeamTitle")}
      items={items}
      footer={
        error ? <Text style={[styles.errorText, { color: theme.state.error }]}>{error}</Text> : null
      }
      onSubmit={onPressSubmit}
      onCancel={onCancel}
      submitLabel={t("common.submit")}
      cancelLabel={t("common.cancel")}
      submitDisabled={loading}
    />
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    textAlign: "center",
  },
});
