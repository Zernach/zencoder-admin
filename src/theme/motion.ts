export const motion = { fast: 120, base: 180, slow: 260 } as const;

export const ease = {
  standard: "cubic-bezier(0.22, 1, 0.36, 1)",
  emphasized: "cubic-bezier(0.4, 0, 0.2, 1)",
  linear: "linear",
} as const;
