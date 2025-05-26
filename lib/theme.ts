/**
 * Theme utilities for Tailwind CSS v4
 * 
 * This file provides utilities for working with the new OKLCH color system
 * and theme configuration in Tailwind CSS v4.
 */

/**
 * Available theme colors in the OKLCH color space
 */
export const themeColors = {
  background: 'background',
  foreground: 'foreground',
  card: 'card',
  'card-foreground': 'card-foreground',
  popover: 'popover',
  'popover-foreground': 'popover-foreground',
  primary: 'primary',
  'primary-foreground': 'primary-foreground',
  secondary: 'secondary',
  'secondary-foreground': 'secondary-foreground',
  muted: 'muted',
  'muted-foreground': 'muted-foreground',
  accent: 'accent',
  'accent-foreground': 'accent-foreground',
  destructive: 'destructive',
  'destructive-foreground': 'destructive-foreground',
  border: 'border',
  input: 'input',
  ring: 'ring',
  'chart-1': 'chart-1',
  'chart-2': 'chart-2',
  'chart-3': 'chart-3',
  'chart-4': 'chart-4',
  'chart-5': 'chart-5',
  sidebar: 'sidebar',
  'sidebar-foreground': 'sidebar-foreground',
  'sidebar-primary': 'sidebar-primary',
  'sidebar-primary-foreground': 'sidebar-primary-foreground',
  'sidebar-accent': 'sidebar-accent',
  'sidebar-accent-foreground': 'sidebar-accent-foreground',
  'sidebar-border': 'sidebar-border',
  'sidebar-ring': 'sidebar-ring',
} as const;

/**
 * Border radius tokens
 */
export const borderRadius = {
  lg: 'radius-lg',
  md: 'radius-md',
  sm: 'radius-sm',
} as const;

/**
 * Get a CSS custom property for a theme color
 */
export function getThemeColor(color: keyof typeof themeColors): string {
  return `theme(colors.${color})`;
}

/**
 * Get a CSS custom property for border radius
 */
export function getBorderRadius(size: keyof typeof borderRadius): string {
  return `theme(borderRadius.${size})`;
}

/**
 * Utility for creating consistent theme-aware class names
 */
export function createThemeClass(baseClass: string, variant?: string): string {
  return variant ? `${baseClass}-${variant}` : baseClass;
}