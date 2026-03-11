import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Text, StyleSheet } from "react-native";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface CreateHumanFormProps {
  onSubmit: (values: { name: string; email: string; teamId: string }) => void;
  onCancel?: () => void;
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

export function CreateHumanForm({ onSubmit, onCancel, loading, error }: CreateHumanFormProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = t("modals.createUser.fullNameRequired");
    if (!fields.email.trim()) errors.email = t("modals.createUser.emailRequired");
    else if (!EMAIL_RE.test(fields.email.trim())) errors.email = t("modals.createUser.emailInvalid");
    if (!fields.teamId.trim()) errors.teamId = t("modals.createUser.teamIdRequired");
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors
        ? undefined
        : { name: fields.name.trim(), email: fields.email.trim(), teamId: fields.teamId.trim() },
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
        label: t("modals.createUser.fullName"),
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: t("modals.createUser.fullNamePlaceholder"),
      },
    },
    {
      key: "email",
      type: "input",
      inputProps: {
        label: t("modals.createUser.email"),
        defaultValue: formFieldsRef.current.email,
        onChangeText: (text: string) => updateFormFields({ email: text }),
        error: errorsRef.current.email,
        placeholder: t("modals.createUser.emailPlaceholder"),
      },
    },
    {
      key: "teamId",
      type: "input",
      inputProps: {
        label: t("modals.createUser.teamId"),
        defaultValue: formFieldsRef.current.teamId,
        onChangeText: (text: string) => updateFormFields({ teamId: text }),
        error: errorsRef.current.teamId,
        placeholder: t("modals.createUser.teamIdPlaceholder"),
      },
    },
  ];

  return (
    <InputForm
      title={t("modals.addUser")}
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
