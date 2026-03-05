import { renderHook, act } from "@testing-library/react-native";
import { useFormFields } from "../useFormFields";

interface DemoFields {
  name: string;
  email: string;
}

interface DemoErrors {
  name?: string;
  email?: string;
}

interface DemoValues {
  name: string;
  email: string;
}

describe("useFormFields", () => {
  it("updates fields in ref without requiring a submit", () => {
    const onSubmit = jest.fn<void, [DemoValues]>();
    const { result } = renderHook(() =>
      useFormFields<DemoFields, DemoErrors, DemoValues>({
        initialFields: { name: "", email: "" },
        onSubmit,
        validate: (fields) => ({ errors: {}, values: fields }),
      }),
    );

    act(() => {
      result.current.updateFormFields({ name: "Ada" });
      result.current.updateFormFields({ email: "ada@example.com" });
    });

    expect(result.current.formFieldsRef.current).toEqual({
      name: "Ada",
      email: "ada@example.com",
    });
  });

  it("stores validation errors and does not submit when validate returns no values", () => {
    const onSubmit = jest.fn<void, [DemoValues]>();
    const { result } = renderHook(() =>
      useFormFields<DemoFields, DemoErrors, DemoValues>({
        initialFields: { name: "", email: "" },
        onSubmit,
        validate: () => ({
          errors: { name: "Name is required", email: "Email is required" },
          values: undefined,
        }),
      }),
    );

    act(() => {
      result.current.onPressSubmit();
    });

    expect(result.current.errorsRef.current).toEqual({
      name: "Name is required",
      email: "Email is required",
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits typed values when validation succeeds", () => {
    const onSubmit = jest.fn<void, [DemoValues]>();
    const { result } = renderHook(() =>
      useFormFields<DemoFields, DemoErrors, DemoValues>({
        initialFields: { name: "Ada", email: "ada@example.com" },
        onSubmit,
        validate: (fields) => ({ errors: {}, values: fields }),
      }),
    );

    act(() => {
      result.current.onPressSubmit();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
    });
  });
});

