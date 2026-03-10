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
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = t("modals.createAgent.agentNameRequired");
    if (!fields.projectId.trim()) errors.projectId = t("modals.createAgent.projectIdRequired");
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors
        ? undefined
        : { name: fields.name.trim(), projectId: fields.projectId.trim() },
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
        label: t("modals.createAgent.agentName"),
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: t("modals.createAgent.agentNamePlaceholder"),
      },
    },
    {
      key: "projectId",
      type: "input",
      inputProps: {
        label: t("modals.createAgent.projectId"),
        defaultValue: formFieldsRef.current.projectId,
        onChangeText: (text: string) => updateFormFields({ projectId: text }),
        error: errorsRef.current.projectId,
        placeholder: t("modals.createAgent.projectIdPlaceholder"),
      },
    },
  ];

  return (
    <InputForm
      title={t("modals.createAgentTitle")}
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
