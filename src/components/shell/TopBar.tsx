import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/buttons";
import { CustomModal } from "@/components/modals";
import type { TextInput as TextInputHandle } from "react-native";
import { Search, Clock, X, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import {
  useDashboardFilterActions,
  useDashboardPreset,
  useDashboardSearchQuery,
} from "@/features/analytics/hooks/useDashboardFilters";
import { useSearchAutocomplete } from "@/features/analytics/hooks/useSearchAutocomplete";
import type { TimeRangePreset, SearchSuggestion, SearchSuggestionsResponse } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { CustomTextInput } from "@/components/inputs";
import { SearchAutocompletePanel } from "@/components/search";
import { buildEntityRoute, ROUTES } from "@/constants/routes";
import { isIos } from "@/constants";
import { useAppSelector, selectMostRecentTab } from "@/store";
import { spacing, radius } from "@/theme/tokens";

type SelectableTimeRangePreset = Exclude<TimeRangePreset, "custom">;

const TIME_PRESET_OPTIONS: {
  value: SelectableTimeRangePreset;
  labelKey: string;
  fullLabelKey: string;
}[] = [
  { value: "24h", labelKey: "timeRange.short24h", fullLabelKey: "timeRange.last24Hours" },
  { value: "7d", labelKey: "timeRange.short7d", fullLabelKey: "timeRange.last7Days" },
  { value: "30d", labelKey: "timeRange.short30d", fullLabelKey: "timeRange.last30Days" },
  { value: "90d", labelKey: "timeRange.short90d", fullLabelKey: "timeRange.last90Days" },
];

const PRESET_LABEL_KEYS: Record<TimeRangePreset, string> = {
  "24h": "timeRange.last24Hours",
  "7d": "timeRange.last7Days",
  "30d": "timeRange.last30Days",
  "90d": "timeRange.last90Days",
  custom: "timeRange.customRange",
};

const PRESET_SHORT_LABEL_KEYS: Record<TimeRangePreset, string> = {
  "24h": "timeRange.short24h",
  "7d": "timeRange.short7d",
  "30d": "timeRange.short30d",
  "90d": "timeRange.short90d",
  custom: "timeRange.shortCustom",
};

const CONTROL_HORIZONTAL_PADDING = 12;
const CONTROL_TEXT_SIZE = 13;
const CONTROL_HEIGHT = 36;

export interface TopBarAutocompleteOverride {
  suggestions: SearchSuggestionsResponse | null;
  loading: boolean;
  error: string | undefined;
  selectSuggestion: (suggestion: SearchSuggestion) => void;
  setQuery: (query: string) => void;
  clear: () => void;
}

export interface TopBarProps {
  /** Custom placeholder for the search input. */
  placeholder?: string;
  /** Whether to show the time-range selector. Defaults to true. */
  showTimeRange?: boolean;
  /** When provided, replaces the built-in analytics autocomplete with custom suggestions. */
  autocomplete?: TopBarAutocompleteOverride;
}

/**
 * Isolated search section — owns localQuery + isPanelOpen state so that
 * keystrokes only re-render the search area, not the time-range or profile buttons.
 */
const TopBarSearchSection = React.memo(function TopBarSearchSection({
  placeholder,
  autocompleteOverride,
}: {
  placeholder?: string;
  autocompleteOverride?: TopBarAutocompleteOverride;
}) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const router = useRouter();
  const mostRecentTab = useAppSelector(selectMostRecentTab);
  const searchQuery = useDashboardSearchQuery();
  const { setSearchQuery } = useDashboardFilterActions();
  const searchInputRef = useRef<TextInputHandle>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const mostRecentTabRef = useRef(mostRecentTab);
  mostRecentTabRef.current = mostRecentTab;

  const autocompleteOverrideRef = useRef(autocompleteOverride);
  autocompleteOverrideRef.current = autocompleteOverride;

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      setLocalQuery(suggestion.title);
      setSearchQuery(suggestion.title);
      setIsPanelOpen(false);
      const route = buildEntityRoute(mostRecentTabRef.current, suggestion.entityType, suggestion.id);
      setTimeout(() => {
        router.push(route as never);
      }, 0);
    },
    [setSearchQuery, router],
  );

  const autocomplete = useSearchAutocomplete(handleSuggestionSelect);
  const autocompleteRef = useRef(autocomplete);
  autocompleteRef.current = autocomplete;

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setLocalQuery(text);
      const custom = autocompleteOverrideRef.current;
      if (custom) {
        custom.setQuery(text);
      } else {
        autocompleteRef.current.setQuery(text);
      }
      setIsPanelOpen(text.trim().length >= 2);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setLocalQuery("");
    const custom = autocompleteOverrideRef.current;
    if (custom) {
      custom.clear();
    } else {
      setSearchQuery("");
      autocompleteRef.current.clear();
    }
    setIsPanelOpen(false);
    searchInputRef.current?.focus();
  }, [setSearchQuery]);

  const handleDismissPanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const handlePanelSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      const custom = autocompleteOverrideRef.current;
      if (custom) {
        custom.selectSuggestion(suggestion);
        setLocalQuery(suggestion.title);
        setIsPanelOpen(false);
      } else {
        autocompleteRef.current.selectSuggestion(suggestion);
      }
    },
    [],
  );

  const hasQuery = localQuery.length > 0;

  const searchContainerStyle = useMemo(
    () => [
      styles.searchContainer,
      { backgroundColor: theme.bg.surface, borderColor: hasQuery ? theme.border.brand : theme.border.default },
    ],
    [theme.bg.surface, theme.border.brand, theme.border.default, hasQuery],
  );

  return (
    <View style={searchContainerStyle}>
      <Search size={14} color={hasQuery ? theme.border.brand : theme.text.tertiary} />
      <CustomTextInput
        ref={searchInputRef}
        containerStyle={styles.searchInputWrapper}
        showInputContainer={false}
        style={[styles.searchInput, isIos ? styles.searchInputIos : undefined]}
        placeholder={placeholder ?? t("search.placeholder")}
        value={localQuery}
        onChangeText={handleSearchChange}
        accessibilityLabel={t("search.searchLabel")}
        accessibilityHint={t("search.searchHint")}
      />
      {hasQuery && (
        <CustomButton
          onPress={handleClearSearch}
          hitSlop={8}
          buttonMode="ghost"
          buttonSize="iconSm"
          accessibilityRole="button"
          accessibilityLabel={t("search.clearSearch")}
          style={styles.clearButton}
        >
          <X size={14} color={theme.icon.secondary} />
        </CustomButton>
      )}
      <SearchAutocompletePanel
        suggestions={autocompleteOverride?.suggestions ?? autocomplete.suggestions}
        loading={autocompleteOverride?.loading ?? autocomplete.loading}
        error={autocompleteOverride?.error ?? autocomplete.error}
        onSelect={handlePanelSelect}
        onDismiss={handleDismissPanel}
        visible={isPanelOpen}
      />
    </View>
  );
});

/**
 * Isolated time-range button + modal — owns isTimeRangeOverlayVisible state
 * so opening/closing the modal doesn't re-render search or profile.
 */
const TopBarTimeRange = React.memo(function TopBarTimeRange() {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const preset = useDashboardPreset();
  const { setTimeRange } = useDashboardFilterActions();
  const [isTimeRangeOverlayVisible, setTimeRangeOverlayVisible] = useState(false);

  const openTimeRangeOverlay = useCallback(
    () => setTimeRangeOverlayVisible(true),
    [],
  );

  const closeTimeRangeOverlay = useCallback(
    () => setTimeRangeOverlayVisible(false),
    [],
  );

  const handleSelectTimeRange = useCallback(
    (nextPreset: SelectableTimeRangePreset) => {
      setTimeRange(nextPreset);
      setTimeRangeOverlayVisible(false);
    },
    [setTimeRange],
  );

  const timeRangeHandlerCache = useRef(new Map<string, () => void>()).current;
  const handleSelectTimeRangeRef = useRef(handleSelectTimeRange);
  handleSelectTimeRangeRef.current = handleSelectTimeRange;
  const getTimeRangeHandler = useCallback((value: SelectableTimeRangePreset) => {
    let handler = timeRangeHandlerCache.get(value);
    if (!handler) {
      handler = () => handleSelectTimeRangeRef.current(value);
      timeRangeHandlerCache.set(value, handler);
    }
    return handler;
  }, [timeRangeHandlerCache]);

  const presetButtonLabel =
    breakpoint === "mobile" ? t(PRESET_SHORT_LABEL_KEYS[preset]) : t(PRESET_LABEL_KEYS[preset]);

  return (
    <>
      <CustomButton
        style={styles.presetBtn}
        buttonMode="surface"
        accessibilityRole="button"
        accessibilityLabel={t("timeRange.openSelector")}
        onPress={openTimeRangeOverlay}
      >
        <Clock size={14} color={theme.text.secondary} />
        <Text
          allowFontScaling={false}
          style={[styles.presetText, { color: theme.text.secondary }]}
        >
          {presetButtonLabel}
        </Text>
      </CustomButton>
      <CustomModal
        visible={isTimeRangeOverlayVisible}
        onClose={closeTimeRangeOverlay}
        accessibilityLabel="Close time range selector"
        title={t("timeRange.selectTimeRange")}
        panelWidth={320}
        panelStyle={styles.timeRangePanel}
      >
        <View style={styles.overlayOptions}>
          {TIME_PRESET_OPTIONS.map((option) => {
            const isSelected = preset === option.value;
            return (
              <CustomButton
                key={option.value}
                style={[
                  styles.overlayOptionButton,
                  { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
                  isSelected && { borderColor: theme.border.brand, backgroundColor: theme.bg.brandSubtle },
                ]}
                onPress={getTimeRangeHandler(option.value)}
                accessibilityRole="button"
                accessibilityLabel={t(option.fullLabelKey)}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.overlayOptionText,
                    { color: theme.text.secondary },
                    isSelected && { color: theme.text.brand },
                  ]}
                >
                  {t(option.labelKey)}
                </Text>
              </CustomButton>
            );
          })}
        </View>
      </CustomModal>
    </>
  );
});

/**
 * Isolated profile button — doesn't re-render when search or time-range state changes.
 */
const TopBarProfileButton = React.memo(function TopBarProfileButton() {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const router = useRouter();

  const handleOpenSettings = useCallback(
    () => {
      router.push(ROUTES.SETTINGS as never);
    },
    [router],
  );

  return (
    <CustomButton
      style={styles.profileBtnOutline}
      buttonMode="unstyled"
      buttonSize="none"
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      onPress={handleOpenSettings}
    >
      <View style={styles.profileIconOffset}>
        <User size={18} color={theme.icon.primary} strokeWidth={1.5} />
      </View>
    </CustomButton>
  );
});

/**
 * TopBar — now a thin layout shell. State is isolated into sub-components
 * so that search keystrokes, time-range toggles, and profile interactions
 * each only re-render their own subtree.
 */
export const TopBar = React.memo(function TopBar({
  placeholder,
  showTimeRange = true,
  autocomplete: autocompleteOverride,
}: TopBarProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme.bg.canvas, borderBottomColor: theme.border.default }],
    [theme.bg.canvas, theme.border.default],
  );

  return (
    <View style={containerStyle}>
      <View style={styles.left}>
        <TopBarSearchSection
          placeholder={placeholder}
          autocompleteOverride={autocompleteOverride}
        />
      </View>
      <View style={styles.right}>
        {showTimeRange && <TopBarTimeRange />}
        <TopBarProfileButton />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[16],
    borderBottomWidth: 1,
    overflow: "visible",
    zIndex: 200,
    elevation: 200,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[12],
    flex: 1,
    overflow: "visible",
    zIndex: 201,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    marginLeft: spacing[12],
  },
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
    height: CONTROL_HEIGHT,
    borderRadius: radius.md,
    paddingHorizontal: CONTROL_HORIZONTAL_PADDING,
    paddingVertical: spacing[0],
    flex: 1,
    maxWidth: 400,
    borderWidth: 1,
    overflow: "visible",
    zIndex: 202,
    elevation: 202,
  },
  searchInput: {
    flex: 1,
    fontSize: CONTROL_TEXT_SIZE,
    minHeight: 0,
    paddingTop: spacing[0],
    paddingBottom: spacing[0],
    paddingVertical: spacing[0],
    paddingHorizontal: spacing[0],
    marginVertical: spacing[0],
  },
  searchInputIos: {
    paddingTop: spacing[0],
    paddingBottom: spacing[0],
  },
  searchInputWrapper: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
  },
  clearButton: {
    marginRight: -spacing[4],
    flexShrink: 0,
  },
  presetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[6],
    height: CONTROL_HEIGHT,
    paddingHorizontal: CONTROL_HORIZONTAL_PADDING,
    paddingVertical: spacing[0],
  },
  presetText: {
    fontSize: CONTROL_TEXT_SIZE,
  },
  profileBtn: {
    width: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtnOutline: {
    width: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E65100",
  },
  profileIconOffset: {
    marginTop: 0.5,
    marginLeft: -1,
  },
  timeRangePanel: {
    padding: spacing[12],
  },
  overlayOptions: {
    gap: spacing[8],
  },
  overlayOptionButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[12],
  },
  overlayOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
