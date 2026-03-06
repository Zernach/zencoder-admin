import React, { forwardRef, useCallback } from "react";
import type { FlatListProps, ScrollViewProps } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";

interface CustomListProps<TItem> {
  scrollViewProps?: ScrollViewProps & { key?: string };
  flatListProps?: FlatListProps<TItem> & { key?: string };
  children?: React.ReactNode;
}

export interface CustomListRef {
  scrollTo?: (options: { x?: number; y?: number; animated?: boolean }) => void;
  scrollToOffset?: (params: { offset: number; animated?: boolean }) => void;
}

function setForwardedRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}

function CustomListInner<TItem>(
  { scrollViewProps, flatListProps, children }: CustomListProps<TItem>,
  ref: React.ForwardedRef<CustomListRef | null>,
) {
  const setListRef = useCallback((instance: unknown) => {
    setForwardedRef(ref, instance as CustomListRef | null);
  }, [ref]);

  if (flatListProps) {
    const { key, ...rest } = flatListProps;
    return (
      <FlatList
        {...rest}
        key={key}
        ref={setListRef}
        userSelect="text"
      >
        {children}
      </FlatList>
    );
  }

  if (scrollViewProps) {
    const { key, ...rest } = scrollViewProps;
    return (
      <ScrollView
        {...rest}
        key={key}
        ref={setListRef}
        userSelect="text"
      >
        {children}
      </ScrollView>
    );
  }

  return <>{children}</>;
}

type CustomListComponent = <TItem = never>(
  props: CustomListProps<TItem> & React.RefAttributes<CustomListRef | null>,
) => React.ReactElement | null;

const ForwardedCustomList = forwardRef(CustomListInner);
ForwardedCustomList.displayName = "CustomList";

export const CustomList = ForwardedCustomList as CustomListComponent;

export type { CustomListProps };
