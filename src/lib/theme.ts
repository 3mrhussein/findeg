export const lightTheme = {
  primary: '#14b8a6', // teal-500
  primaryDark: '#0f766e', // teal-700
  secondary: '#f59e0b', // amber-500
  secondaryDark: '#b45309', // amber-700
  background: '#ffffff', // white
  foreground: '#111827', // gray-900
  card: '#ffffff', // white
  cardForeground: '#111827', // gray-900
  muted: '#f3f4f6', // gray-100
  mutedForeground: '#6b7280', // gray-500
  border: '#e5e7eb', // gray-200
};

export const darkTheme = {
  primary: '#14b8a6', // teal-500
  primaryDark: '#5eead4', // teal-300
  secondary: '#fbb_f24', // amber-400
  secondaryDark: '#fcd34d', // amber-300
  background: '#111827', // gray-900
  foreground: '#f3f4f6', // gray-100
  card: '#1f2937', // gray-800
  cardForeground: '#f3f4f6', // gray-100
  muted: '#374151', // gray-700
  mutedForeground: '#9ca3af', // gray-400
  border: '#374151', // gray-700
};

export const themeOptions = {
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  gradients: {
    primary: `linear-gradient(to right, ${lightTheme.primary}, ${lightTheme.primaryDark})`,
  }
};
