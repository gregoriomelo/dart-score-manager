/**
 * Responsive breakpoint system for mobile-first design
 */

export const breakpoints = {
  // Mobile first approach
  xs: '320px',    // Extra small devices (phones)
  sm: '576px',    // Small devices (large phones)
  md: '768px',    // Medium devices (tablets)
  lg: '992px',    // Large devices (desktops)
  xl: '1200px',   // Extra large devices (large desktops)
  xxl: '1400px',  // Extra extra large devices
} as const;

export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  xxl: `@media (min-width: ${breakpoints.xxl})`,
} as const;

export const maxMediaQueries = {
  xs: `@media (max-width: ${breakpoints.xs})`,
  sm: `@media (max-width: ${breakpoints.sm})`,
  md: `@media (max-width: ${breakpoints.md})`,
  lg: `@media (max-width: ${breakpoints.lg})`,
  xl: `@media (max-width: ${breakpoints.xl})`,
  xxl: `@media (max-width: ${breakpoints.xxl})`,
} as const;

export const deviceTypes = {
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
  touch: '@media (hover: none) and (pointer: coarse)',
  mouse: '@media (hover: hover) and (pointer: fine)',
} as const;

export const orientation = {
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
} as const;

export const reducedMotion = {
  reduce: '@media (prefers-reduced-motion: reduce)',
  noPreference: '@media (prefers-reduced-motion: no-preference)',
} as const;

export const colorScheme = {
  light: '@media (prefers-color-scheme: light)',
  dark: '@media (prefers-color-scheme: dark)',
} as const;

/**
 * CSS custom properties for responsive design
 */
export const responsiveCSSVars = {
  '--container-padding': '1rem',
  '--container-padding-sm': '1.5rem',
  '--container-padding-md': '2rem',
  '--container-padding-lg': '3rem',
  '--container-max-width': '100%',
  '--container-max-width-sm': '540px',
  '--container-max-width-md': '720px',
  '--container-max-width-lg': '960px',
  '--container-max-width-xl': '1140px',
  '--grid-gap': '1rem',
  '--grid-gap-sm': '1.5rem',
  '--grid-gap-md': '2rem',
  '--grid-gap-lg': '3rem',
  '--border-radius': '0.25rem',
  '--border-radius-sm': '0.125rem',
  '--border-radius-md': '0.375rem',
  '--border-radius-lg': '0.5rem',
  '--border-radius-xl': '0.75rem',
  '--font-size-xs': '0.75rem',
  '--font-size-sm': '0.875rem',
  '--font-size-base': '1rem',
  '--font-size-lg': '1.125rem',
  '--font-size-xl': '1.25rem',
  '--font-size-2xl': '1.5rem',
  '--font-size-3xl': '1.875rem',
  '--font-size-4xl': '2.25rem',
  '--spacing-xs': '0.25rem',
  '--spacing-sm': '0.5rem',
  '--spacing-md': '1rem',
  '--spacing-lg': '1.5rem',
  '--spacing-xl': '2rem',
  '--spacing-2xl': '3rem',
  '--spacing-3xl': '4rem',
} as const;

/**
 * Get responsive CSS variables as a string
 */
export function getResponsiveCSSVars(): string {
  return Object.entries(responsiveCSSVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ');
}

/**
 * Responsive utility classes
 */
export const responsiveUtils = {
  // Container utilities
  container: `
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--container-padding);
    padding-right: var(--container-padding);
    max-width: var(--container-max-width);
  `,
  
  // Grid utilities
  grid: `
    display: grid;
    gap: var(--grid-gap);
  `,
  
  // Flex utilities
  flex: `
    display: flex;
  `,
  
  flexColumn: `
    display: flex;
    flex-direction: column;
  `,
  
  flexCenter: `
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  
  // Spacing utilities
  p: (size: keyof typeof responsiveCSSVars) => `
    padding: var(--${size});
  `,
  
  px: (size: keyof typeof responsiveCSSVars) => `
    padding-left: var(--${size});
    padding-right: var(--${size});
  `,
  
  py: (size: keyof typeof responsiveCSSVars) => `
    padding-top: var(--${size});
    padding-bottom: var(--${size});
  `,
  
  m: (size: keyof typeof responsiveCSSVars) => `
    margin: var(--${size});
  `,
  
  mx: (size: keyof typeof responsiveCSSVars) => `
    margin-left: var(--${size});
    margin-right: var(--${size});
  `,
  
  my: (size: keyof typeof responsiveCSSVars) => `
    margin-top: var(--${size});
    margin-bottom: var(--${size});
  `,
  
  // Text utilities
  textCenter: `
    text-align: center;
  `,
  
  textLeft: `
    text-align: left;
  `,
  
  textRight: `
    text-align: right;
  `,
  
  // Display utilities
  hidden: `
    display: none;
  `,
  
  block: `
    display: block;
  `,
  
  inline: `
    display: inline;
  `,
  
  inlineBlock: `
    display: inline-block;
  `,
} as const;
