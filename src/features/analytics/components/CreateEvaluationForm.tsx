import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet } from "react-native";
import { InputForm } from "@/components/forms";
import type { InputFormItem } from "@/components/forms";
import { CustomButton } from "@/components/buttons";
import { useFormFields } from "@/hooks/useFormFields";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, fontSizes, radius, spacing } from "@/theme/tokens";
import { EVALUATION_CRITERIA_OPTIONS } from "@/features/analytics/constants/evaluationCriteria";

interface CreateEvaluationFormProps {
  onSubmit: (values: { projectId: string; criteriaIds: string[] }) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
}

interface FormFields {
  projectId: string;
}

interface FormErrors {
  projectId?: string;
  criteriaIds?: string;
}

const INITIAL_FIELDS: FormFields = { projectId: "" };

export function CreateEvaluationForm({ onSubmit, onCancel, loading, error }: CreateEvaluationFormProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(new Set());
  const [criteriaError, setCriteriaError] = useState<string | undefined>(undefined);

  const toggleCriterion = useCallback((id: string) => {
    setSelectedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setCriteriaError(undefined);
  }, []);

  const validate = useCallback(
    (fields: FormFields) => {
      const errors: FormErrors = {};
      if (!fields.projectId.trim()) {
        errors.projectId = t("modals.createEvaluation.projectIdRequired");
      }
      if (selectedCriteria.size === 0) {
        errors.criteriaIds = t("modals.createEvaluation.criteriaRequired");
      }
      const hasErrors = Object.keys(errors).length > 0;
      setCriteriaError(errors.criteriaIds);
      return {
        errors,
        values: hasErrors
          ? undefined
          : {
            projectId: fields.projectId.trim(),
            criteriaIds: Array.from(selectedCriteria),
          },
      };
    },
    [selectedCriteria, t],
  );

  const { formFieldsRef, errorsRef, updateFormFields, onPressSubmit } = useFormFields({
    initialFields: INITIAL_FIELDS,
    onSubmit,
    validate,
  });

  const criteriaListElement = (
    <View style={styles.criteriaSection}>
      <Text style={[styles.criteriaLabel, { color: theme.text.primary }]}>
        {t("modals.createEvaluation.criteriaLabel")}
      </Text>
      <Text style={[styles.criteriaHelp, { color: theme.text.secondary }]}>
        {t("modals.createEvaluation.criteriaHelp")}
      </Text>
      <View style={styles.criteriaList}>
        {EVALUATION_CRITERIA_OPTIONS.map((option) => {
          const checked = selectedCriteria.has(option.id);
          return (
            <CustomButton
              key={option.id}
              onPress={() => toggleCriterion(option.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={option.label}
              style={[
                styles.criteriaRow,
                {
                  borderColor: checked ? theme.border.brand : theme.border.default,
                  backgroundColor: checked ? theme.bg.surfaceElevated : theme.bg.surface,
                },
              ]}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    borderColor: checked ? theme.border.brand : theme.border.default,
                    backgroundColor: checked ? theme.border.brand : "transparent",
                  },
                ]}
              >
                {checked ? <Text style={styles.checkboxMark}>{"✓"}</Text> : null}
              </View>
              <View style={styles.criteriaText}>
                <Text style={[styles.criteriaTitle, { color: theme.text.primary }]}>{option.label}</Text>
                <Text style={[styles.criteriaPrompt, { color: theme.text.secondary }]}>{option.prompt}</Text>
              </View>
            </CustomButton>
          );
        })}
      </View>
      {criteriaError ? (
        <Text style={[styles.errorText, { color: theme.state.error }]}>{criteriaError}</Text>
      ) : null}
    </View>
  );

  const items: InputFormItem[] = [
    {
      key: "projectId",
      type: "input",
      inputProps: {
        label: t("modals.createEvaluation.projectId"),
        defaultValue: formFieldsRef.current.projectId,
        onChangeText: (text: string) => updateFormFields({ projectId: text }),
        error: errorsRef.current.projectId,
        placeholder: t("modals.createEvaluation.projectIdPlaceholder"),
      },
    },
    {
      key: "criteria",
      type: "custom",
      element: criteriaListElement,
    },
  ];

  return (
    <InputForm
      title={t("modals.createEvaluationTitle")}
      subtitle={t("modals.createEvaluation.subtitle")}
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
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
  criteriaSection: {
    gap: spacing[8],
  },
  criteriaLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  criteriaHelp: {
    fontSize: fontSizes.xs,
  },
  criteriaList: {
    gap: spacing[8],
  },
  criteriaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[12],
    borderWidth: borderWidth.hairline,
    borderRadius: radius.md,
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[12],
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: borderWidth.hairline,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxMark: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  criteriaText: {
    flex: 1,
    gap: spacing[2],
  },
  criteriaTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  criteriaPrompt: {
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },
});
