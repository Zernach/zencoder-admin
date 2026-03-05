import { useCallback, useRef } from "react";
import type { MutableRefObject } from "react";
import { useTriggerRerender } from "./useTriggerRerender";

export interface UseFormFieldsValidationResult<TErrors, TValues> {
  errors: TErrors;
  values?: TValues;
}

export interface UseFormFieldsParams<TFields extends object, TErrors, TValues> {
  initialFields: TFields;
  onSubmit: (values: TValues) => void | Promise<void>;
  validate: (fields: TFields) => UseFormFieldsValidationResult<TErrors, TValues>;
}

export interface UseFormFieldsResult<TFields extends object, TErrors> {
  formFieldsRef: MutableRefObject<TFields>;
  errorsRef: MutableRefObject<TErrors>;
  updateFormFields: (updates: Partial<TFields>) => void;
  triggerRerender: () => void;
  onPressSubmit: () => void;
}

/**
 * Stores editable form values in refs to avoid per-keystroke screen re-renders.
 * Validation errors are committed to a ref and surfaced after submit is pressed.
 */
export function useFormFields<TFields extends object, TErrors, TValues>({
  initialFields,
  onSubmit,
  validate,
}: UseFormFieldsParams<TFields, TErrors, TValues>): UseFormFieldsResult<TFields, TErrors> {
  const formFieldsRef = useRef<TFields>({ ...initialFields });
  const errorsRef = useRef<TErrors>({} as TErrors);
  const { triggerRerender } = useTriggerRerender();

  const updateFormFields = useCallback((updates: Partial<TFields>) => {
    Object.assign(formFieldsRef.current, updates);
  }, []);

  const onPressSubmit = useCallback(() => {
    const currentFields = formFieldsRef.current;
    const { errors, values } = validate(currentFields);

    errorsRef.current = errors;
    triggerRerender();

    if (values === undefined) {
      return;
    }

    void onSubmit(values);
  }, [onSubmit, triggerRerender, validate]);

  return {
    formFieldsRef,
    errorsRef,
    updateFormFields,
    triggerRerender,
    onPressSubmit,
  };
}

