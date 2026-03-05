import { renderHook, act } from "@testing-library/react-native";
import { useTriggerRerender } from "../useTriggerRerender";

describe("useTriggerRerender", () => {
  it("increments key when triggerRerender is called", () => {
    const { result } = renderHook(() => useTriggerRerender());

    expect(result.current.key).toBe(0);

    act(() => {
      result.current.triggerRerender();
    });

    expect(result.current.key).toBe(1);
  });
});

