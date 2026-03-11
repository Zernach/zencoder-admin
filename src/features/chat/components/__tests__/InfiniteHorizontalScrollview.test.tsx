import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import type { SuggestedPrompt } from "@/features/chat/constants/suggestedPrompts";
import { InfiniteHorizontalScrollview } from "../InfiniteHorizontalScrollview";

const mockCancelAnimation = jest.fn();

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { FlatList, ScrollView, View } = require("react-native");

  return {
    __esModule: true,
    default: {
      FlatList,
      ScrollView,
      View,
      createAnimatedComponent: (component: unknown) => component,
    },
    Easing: {
      linear: {},
    },
    cancelAnimation: (...args: readonly unknown[]) => mockCancelAnimation(...args),
    runOnJS:
      <TArgs extends readonly unknown[], TResult>(
        fn: (...args: TArgs) => TResult,
      ) =>
      (...args: TArgs) =>
        fn(...args),
    runOnUI:
      <TArgs extends readonly unknown[], TResult>(
        fn: (...args: TArgs) => TResult,
      ) =>
      (...args: TArgs) =>
        fn(...args),
    scrollTo: jest.fn(),
    useAnimatedRef: () => React.createRef(),
    useAnimatedScrollHandler: (handlers: unknown) => handlers,
    useDerivedValue: (worklet: () => void) => worklet(),
    useSharedValue: <T,>(value: T) => ({ value }),
    withRepeat: <T,>(value: T) => value,
    withTiming: <T,>(value: T) => value,
  };
});

jest.mock("react-native-gesture-handler", () => {
  const { Pressable } = require("react-native");
  return {
    __esModule: true,
    Pressable,
  };
});

describe("InfiniteHorizontalScrollview", () => {
  const prompts: SuggestedPrompt[] = [
    { label: "Prompt one", message: "Prompt one message" },
    { label: "Prompt two", message: "Prompt two message" },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    mockCancelAnimation.mockClear();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("calls onPressPrompt when a suggestion card is pressed", () => {
    const onPressPrompt = jest.fn();
    const { getByTestId } = render(
      <InfiniteHorizontalScrollview
        prompts={prompts}
        onPressPrompt={onPressPrompt}
      />,
    );

    fireEvent.press(getByTestId("suggestion-0"));

    expect(onPressPrompt).toHaveBeenCalledWith("Prompt one message");
  });

  it("pauses auto-scroll immediately when a suggestion card touch starts", () => {
    const { getByTestId } = render(
      <InfiniteHorizontalScrollview
        prompts={prompts}
        onPressPrompt={jest.fn()}
      />,
    );

    mockCancelAnimation.mockClear();
    fireEvent(getByTestId("suggestion-0"), "touchStart", { nativeEvent: {} });

    expect(mockCancelAnimation).toHaveBeenCalled();
  });

  it("pauses on touch start and schedules resume on touch end", () => {
    const setTimeoutSpy = jest.spyOn(global, "setTimeout");
    const { getByTestId } = render(
      <InfiniteHorizontalScrollview
        prompts={prompts}
        onPressPrompt={jest.fn()}
      />,
    );
    const scrollView = getByTestId("infinite-horizontal-scrollview");

    mockCancelAnimation.mockClear();
    fireEvent(scrollView, "touchStart", { nativeEvent: {} });
    fireEvent(scrollView, "touchEnd", { nativeEvent: {} });

    expect(mockCancelAnimation).toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 1200);

    setTimeoutSpy.mockRestore();
  });

  it("keeps manual scrolling enabled for interactive suggestions", () => {
    const { getByTestId } = render(
      <InfiniteHorizontalScrollview
        prompts={prompts}
        onPressPrompt={jest.fn()}
      />,
    );

    expect(getByTestId("infinite-horizontal-scrollview").props.scrollEnabled).toBe(true);
  });
});
