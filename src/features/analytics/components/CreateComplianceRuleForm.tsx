import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { useFormFields } from "@/hooks/useFormFields";
import type { Severity } from "@/features/analytics/types";

interface CreateComplianceRuleFormProps {
  onSubmit: (values: { name: string; description: string; severity: Severity }) => void;
  onCancel?: () => void;
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

export function CreateComplianceRuleForm({ onSubmit, onCancel, loading }: CreateComplianceRuleFormProps) {
  const { t } = useTranslation();

  const validate = useCallback((fields: FormFields) => {
    const errors: FormErrors = {};
    if (!fields.name.trim()) errors.name = t("modals.createComplianceRule.ruleNameRequired");
    if (!fields.description.trim()) errors.description = t("modals.createComplianceRule.descriptionRequired");
    if (!SEVERITY_OPTIONS.includes(fields.severity as Severity)) errors.severity = t("modals.createComplianceRule.severityInvalid");
    const hasErrors = Object.keys(errors).length > 0;
    return {
      errors,
      values: hasErrors
        ? undefined
        : { name: fields.name.trim(), description: fields.description.trim(), severity: fields.severity as Severity },
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
        label: t("modals.createComplianceRule.ruleName"),
        defaultValue: formFieldsRef.current.name,
        onChangeText: (text: string) => updateFormFields({ name: text }),
        error: errorsRef.current.name,
        placeholder: t("modals.createComplianceRule.ruleNamePlaceholder"),
      },
    },
    {
      key: "description",
      type: "input",
      inputProps: {
        label: t("modals.createComplianceRule.description"),
        defaultValue: formFieldsRef.current.description,
        onChangeText: (text: string) => updateFormFields({ description: text }),
        error: errorsRef.current.description,
        placeholder: t("modals.createComplianceRule.descriptionPlaceholder"),
      },
    },
    {
      key: "severity",
      type: "input",
      inputProps: {
        label: t("modals.createComplianceRule.severityLabel"),
        defaultValue: formFieldsRef.current.severity,
        onChangeText: (text: string) => updateFormFields({ severity: text }),
        error: errorsRef.current.severity,
        placeholder: t("modals.createComplianceRule.severityPlaceholder"),
      },
    },
  ];

  return (
    <InputForm
      title={t("modals.createComplianceRuleTitle")}
      items={items}
      onSubmit={onPressSubmit}
      onCancel={onCancel}
      submitLabel={t("common.submit")}
      cancelLabel={t("common.cancel")}
      submitDisabled={loading}
    />
  );
}
