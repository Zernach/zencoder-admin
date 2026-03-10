/**
 * Language and currency type definitions for user preferences.
 */

/** Supported language codes */
export type LanguageCode = "en" | "ru" | "de" | "fr" | "it";

/** Supported currency codes */
export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CNY"
  | "KRW"
  | "INR"
  | "BRL"
  | "CAD"
  | "AUD"
  | "CHF"
  | "SEK"
  | "NOK"
  | "HKD"
  | "NZD"
  | "ZAR"
  | "RUB"
  | "TRY"
  | "MXN"
  | "SGD";

/** A selectable language option */
export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

/** A selectable currency option */
export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
}

/** All supported language options */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ru", label: "Russian", nativeLabel: "Русский" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
];

/** All supported currency options */
export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
  { code: "EUR", symbol: "€", name: "Euro", decimals: 2 },
  { code: "GBP", symbol: "£", name: "British Pound", decimals: 2 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", decimals: 2 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", decimals: 0 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 2 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", decimals: 2 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimals: 2 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", decimals: 2 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", decimals: 2 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", decimals: 2 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", decimals: 2 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", decimals: 2 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", decimals: 2 },
  { code: "ZAR", symbol: "R", name: "South African Rand", decimals: 2 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", decimals: 2 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", decimals: 2 },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", decimals: 2 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", decimals: 2 },
];
