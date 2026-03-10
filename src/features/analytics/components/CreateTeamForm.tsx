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
