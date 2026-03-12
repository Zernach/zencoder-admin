const originalConsoleLog = console.log.bind(console);

const APP_BOOT_LOG_PREFIX = 'Running application "main" with appParams:';

console.log = (...args: unknown[]): void => {
  const [firstArg] = args;
  if (typeof firstArg === "string" && firstArg.startsWith(APP_BOOT_LOG_PREFIX)) {
    return;
  }

  originalConsoleLog(...args);
};

import "expo-router/entry";
