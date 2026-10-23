export const DS2_COLORS = {
  bgGraphite: '#0E1014',
  bgGraphiteGlow: '#3B2818',
  bgPaper: '#EAE7DF',
  bgFooter: '#08090B',
  textLight: '#F6F4EE',
  textDark: '#141413',
  accentAmber: '#E07A38',
  accentVolt: '#C9F24B',
  borderBrutalist: '#181816',
} as const;

export type DS2ColorKey = keyof typeof DS2_COLORS;

export const DS2_FONTS = {
  display: "'Inter Tight', sans-serif",
  script: "'Caveat', cursive",
  monoTech: "'JetBrains Mono', monospace",
} as const;

export const DS2_CSS_VARS: Record<string, string> = {
  '--bg-graphite': DS2_COLORS.bgGraphite,
  '--bg-graphite-glow': DS2_COLORS.bgGraphiteGlow,
  '--bg-paper': DS2_COLORS.bgPaper,
  '--bg-footer': DS2_COLORS.bgFooter,
  '--text-light': DS2_COLORS.textLight,
  '--text-dark': DS2_COLORS.textDark,
  '--accent-amber': DS2_COLORS.accentAmber,
  '--accent-volt': DS2_COLORS.accentVolt,
  '--border-brutalist': DS2_COLORS.borderBrutalist,
};
