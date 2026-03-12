const ORIGINAL_CONSOLE_LOG = console.log.bind(console);
const ORIGINAL_CONSOLE_INFO = console.info.bind(console);

const BLOCKED_BOOT_LOG_PATTERNS: RegExp[] = [
  /^Running application "main" with appParams:/,
  /^Development-level warnings: ON\.$/,
  /^Performance optimizations: OFF\.$/,
];

const shouldSuppressLog = (firstArg: unknown): boolean =>
  typeof firstArg === "string" &&
  BLOCKED_BOOT_LOG_PATTERNS.some((pattern) => pattern.test(firstArg));

const DEV_BANNER_BORDER = "==============================================";
const DEV_WELCOME_MESSAGE = "Welcome, Zencoder Software Engineers 🩵 😊 🚀";
const DEV_INTRO_MESSAGE = "Hi, I'm Ryan Zernach. Great to build with you.";
const DEV_REPO_LABEL_MESSAGE = "Here is the link to the GitHub repository:";
const DEV_EMAIL_MESSAGE = "Email: ryan@zernach.com";
const DEV_GITHUB_MESSAGE = "GitHub: https://github.com/Zernach/zencoder-admin";
const DEV_WEBSITE_MESSAGE = "Website: ryan.zernach.com";
const DEV_SIGN_OFF_MESSAGE = "Have a happy, pleasant, and productive session ✨";
const DEV_BANNER_LINES: string[] = [
  DEV_BANNER_BORDER,
  DEV_WELCOME_MESSAGE,
  "",
  DEV_INTRO_MESSAGE,
  "",
  DEV_REPO_LABEL_MESSAGE,
  DEV_GITHUB_MESSAGE,
  "",
  DEV_EMAIL_MESSAGE,
  DEV_WEBSITE_MESSAGE,
  "",
  DEV_SIGN_OFF_MESSAGE,
  DEV_BANNER_BORDER,
];

console.log = (...args: unknown[]): void => {
  if (shouldSuppressLog(args[0])) {
    return;
  }
  ORIGINAL_CONSOLE_LOG(...args);
};

console.info = (...args: unknown[]): void => {
  if (shouldSuppressLog(args[0])) {
    return;
  }
  ORIGINAL_CONSOLE_INFO(...args);
};

console.log(DEV_BANNER_LINES.join("\n"));

require("expo-router/entry");
