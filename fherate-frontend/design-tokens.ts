// Calculate deterministic seed for unique design system
const projectName = "FHERate";
const network = "sepolia";
const yearMonth = "202510";
const contractName = "FHERatingContract.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;

// Simple hash function for deterministic seed generation
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Generate seed hash
const seedHash = simpleHash(seedString) + simpleHash(seedString.split('').reverse().join(''));
const seedNum = parseInt(seedHash.substring(0, 8), 16);

// Deterministic selections based on seed
const designSystemIndex = seedNum % 5; // 0-4
const colorSchemeIndex = seedNum % 8; // 0-7
const typographyIndex = (seedNum >> 8) % 3; // 0-2
const layoutIndex = (seedNum >> 16) % 5; // 0-4
const borderRadiusIndex = (seedNum >> 24) % 3; // 0-2
const shadowIndex = (seedNum >> 28) % 3; // 0-2
const transitionIndex = (seedNum >> 30) % 3; // 0-2

// Design system options
const designSystems = ['Material', 'Fluent', 'Neumorphism', 'Glassmorphism', 'Minimal'];
const selectedDesignSystem = designSystems[designSystemIndex];

// Color schemes (8 groups)
const colorSchemes = [
  { name: 'A', primary: '#4F46E5', secondary: '#9333EA', accent: '#EC4899', theme: 'Creative' },
  { name: 'B', primary: '#3B82F6', secondary: '#06B6D4', accent: '#14B8A6', theme: 'Professional' },
  { name: 'C', primary: '#10B981', secondary: '#84CC16', accent: '#EAB308', theme: 'Healthy' },
  { name: 'D', primary: '#F97316', secondary: '#F59E0B', accent: '#EF4444', theme: 'Energetic' },
  { name: 'E', primary: '#A855F7', secondary: '#7C3AED', accent: '#6366F1', theme: 'Luxury' },
  { name: 'F', primary: '#14B8A6', secondary: '#10B981', accent: '#06B6D4', theme: 'Fresh' },
  { name: 'G', primary: '#EF4444', secondary: '#EC4899', accent: '#F97316', theme: 'Passionate' },
  { name: 'H', primary: '#06B6D4', secondary: '#3B82F6', accent: '#0EA5E9', theme: 'Calm' },
];
const selectedColorScheme = colorSchemes[colorSchemeIndex];

// Typography systems
const typographySystems = [
  { name: 'Serif', fonts: ['Georgia', 'Playfair Display', 'serif'], scale: 1.2 },
  { name: 'Sans-Serif', fonts: ['Inter', 'system-ui', 'sans-serif'], scale: 1.25 },
  { name: 'Monospace', fonts: ['JetBrains Mono', 'Fira Code', 'monospace'], scale: 1.15 },
];
const selectedTypography = typographySystems[typographyIndex];

// Layout modes
const layoutModes = ['sidebar', 'masonry', 'tabs', 'grid', 'wizard'];
const selectedLayout = layoutModes[layoutIndex];

// Border radius options
const borderRadiusOptions = [
  { name: 'Small', sm: '2px', md: '4px', lg: '8px', xl: '12px' },
  { name: 'Medium', sm: '4px', md: '8px', lg: '12px', xl: '16px' },
  { name: 'Large', sm: '6px', md: '12px', lg: '16px', xl: '24px' },
];
const selectedBorderRadius = borderRadiusOptions[borderRadiusIndex];

// Shadow options
const shadowOptions = [
  { name: 'Subtle', sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.15)', xl: '0 20px 25px rgba(0,0,0,0.2)' },
  { name: 'Moderate', sm: '0 2px 4px rgba(0,0,0,0.1)', md: '0 8px 12px rgba(0,0,0,0.15)', lg: '0 16px 24px rgba(0,0,0,0.2)', xl: '0 24px 32px rgba(0,0,0,0.25)' },
  { name: 'Strong', sm: '0 4px 6px rgba(0,0,0,0.15)', md: '0 12px 18px rgba(0,0,0,0.2)', lg: '0 20px 30px rgba(0,0,0,0.25)', xl: '0 32px 48px rgba(0,0,0,0.3)' },
];
const selectedShadows = shadowOptions[shadowIndex];

// Transition durations
const transitionOptions = [100, 200, 300];
const selectedTransition = transitionOptions[transitionIndex];

// Export design tokens
export const designTokens = {
  meta: {
    seed: seedHash,
    seedString,
    designSystem: selectedDesignSystem,
    colorScheme: selectedColorScheme.name,
    colorTheme: selectedColorScheme.theme,
    typography: selectedTypography.name,
    layout: selectedLayout,
  },
  
  colors: {
    light: {
      // Primary colors
      primary: selectedColorScheme.primary,
      primaryHover: adjustBrightness(selectedColorScheme.primary, -10),
      primaryLight: adjustBrightness(selectedColorScheme.primary, 40),
      
      // Secondary colors
      secondary: selectedColorScheme.secondary,
      secondaryHover: adjustBrightness(selectedColorScheme.secondary, -10),
      secondaryLight: adjustBrightness(selectedColorScheme.secondary, 40),
      
      // Accent colors
      accent: selectedColorScheme.accent,
      accentHover: adjustBrightness(selectedColorScheme.accent, -10),
      accentLight: adjustBrightness(selectedColorScheme.accent, 40),
      
      // Neutral colors
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceHover: '#F1F5F9',
      border: '#E2E8F0',
      
      // Text colors
      text: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      
      // Semantic colors
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      
      // Glassmorphism specific
      glass: 'rgba(255, 255, 255, 0.7)',
      glassHover: 'rgba(255, 255, 255, 0.85)',
      glassBorder: 'rgba(255, 255, 255, 0.18)',
    },
    dark: {
      // Primary colors
      primary: adjustBrightness(selectedColorScheme.primary, 20),
      primaryHover: adjustBrightness(selectedColorScheme.primary, 30),
      primaryLight: adjustBrightness(selectedColorScheme.primary, -20),
      
      // Secondary colors
      secondary: adjustBrightness(selectedColorScheme.secondary, 20),
      secondaryHover: adjustBrightness(selectedColorScheme.secondary, 30),
      secondaryLight: adjustBrightness(selectedColorScheme.secondary, -20),
      
      // Accent colors
      accent: adjustBrightness(selectedColorScheme.accent, 20),
      accentHover: adjustBrightness(selectedColorScheme.accent, 30),
      accentLight: adjustBrightness(selectedColorScheme.accent, -20),
      
      // Neutral colors
      background: '#0F172A',
      surface: '#1E293B',
      surfaceHover: '#334155',
      border: '#334155',
      
      // Text colors
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      
      // Semantic colors
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      
      // Glassmorphism specific
      glass: 'rgba(15, 23, 42, 0.7)',
      glassHover: 'rgba(15, 23, 42, 0.85)',
      glassBorder: 'rgba(148, 163, 184, 0.18)',
    },
  },
  
  typography: {
    fontFamily: {
      primary: selectedTypography.fonts,
      mono: ['JetBrains Mono', 'monospace'],
    },
    scale: selectedTypography.scale,
    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: `${1 * selectedTypography.scale}rem`,        // 1.2-1.25rem
      '2xl': `${1.25 * selectedTypography.scale}rem`,  // 1.5-1.56rem
      '3xl': `${1.563 * selectedTypography.scale}rem`, // 1.88-1.95rem
      '4xl': `${1.953 * selectedTypography.scale}rem`, // 2.34-2.44rem
      '5xl': `${2.441 * selectedTypography.scale}rem`, // 2.93-3.05rem
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  
  spacing: {
    unit: 8, // Base spacing unit: 8px
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  borderRadius: selectedBorderRadius,
  
  shadows: selectedShadows,
  
  transitions: {
    duration: selectedTransition,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fast: `${selectedTransition / 2}ms`,
    normal: `${selectedTransition}ms`,
    slow: `${selectedTransition * 1.5}ms`,
  },
  
  layout: {
    mode: selectedLayout,
    maxWidth: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    breakpoints: {
      mobile: '0px',
      tablet: '768px',
      desktop: '1024px',
    },
  },
  
  density: {
    compact: {
      padding: {
        sm: '4px 8px',
        md: '8px 16px',
        lg: '12px 24px',
      },
      gap: '8px',
      fontSize: '0.875rem',
    },
    comfortable: {
      padding: {
        sm: '8px 16px',
        md: '16px 24px',
        lg: '20px 32px',
      },
      gap: '16px',
      fontSize: '1rem',
    },
  },
  
  glassmorphism: {
    blur: 'blur(16px)',
    backdropFilter: 'backdrop-filter: blur(16px) saturate(180%)',
    borderRadius: selectedBorderRadius.lg,
    border: '1px solid rgba(255, 255, 255, 0.18)',
  },
  
  accessibility: {
    focusRing: {
      width: '2px',
      offset: '2px',
      color: selectedColorScheme.primary,
    },
    contrastRatio: {
      aa: 4.5,
      aaa: 7,
    },
  },
};

// Utility function to adjust brightness
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  ).toString(16).slice(1).toUpperCase();
}

// Export CSS variables for easy integration
export function generateCSSVariables(mode: 'light' | 'dark' = 'light'): string {
  const colors = designTokens.colors[mode];
  const { typography, spacing, borderRadius, shadows, transitions } = designTokens;
  
  return `
    /* Colors */
    --color-primary: ${colors.primary};
    --color-primary-hover: ${colors.primaryHover};
    --color-primary-light: ${colors.primaryLight};
    --color-secondary: ${colors.secondary};
    --color-secondary-hover: ${colors.secondaryHover};
    --color-secondary-light: ${colors.secondaryLight};
    --color-accent: ${colors.accent};
    --color-accent-hover: ${colors.accentHover};
    --color-accent-light: ${colors.accentLight};
    --color-background: ${colors.background};
    --color-surface: ${colors.surface};
    --color-surface-hover: ${colors.surfaceHover};
    --color-border: ${colors.border};
    --color-text: ${colors.text};
    --color-text-secondary: ${colors.textSecondary};
    --color-text-muted: ${colors.textMuted};
    --color-success: ${colors.success};
    --color-warning: ${colors.warning};
    --color-error: ${colors.error};
    --color-info: ${colors.info};
    --color-glass: ${colors.glass};
    --color-glass-hover: ${colors.glassHover};
    --color-glass-border: ${colors.glassBorder};
    
    /* Typography */
    --font-family-primary: ${typography.fontFamily.primary.join(', ')};
    --font-family-mono: ${typography.fontFamily.mono.join(', ')};
    --font-size-xs: ${typography.sizes.xs};
    --font-size-sm: ${typography.sizes.sm};
    --font-size-base: ${typography.sizes.base};
    --font-size-lg: ${typography.sizes.lg};
    --font-size-xl: ${typography.sizes.xl};
    --font-size-2xl: ${typography.sizes['2xl']};
    --font-size-3xl: ${typography.sizes['3xl']};
    --font-size-4xl: ${typography.sizes['4xl']};
    --font-size-5xl: ${typography.sizes['5xl']};
    
    /* Spacing */
    --spacing-xs: ${spacing.xs};
    --spacing-sm: ${spacing.sm};
    --spacing-md: ${spacing.md};
    --spacing-lg: ${spacing.lg};
    --spacing-xl: ${spacing.xl};
    --spacing-2xl: ${spacing['2xl']};
    --spacing-3xl: ${spacing['3xl']};
    --spacing-4xl: ${spacing['4xl']};
    
    /* Border Radius */
    --radius-sm: ${borderRadius.sm};
    --radius-md: ${borderRadius.md};
    --radius-lg: ${borderRadius.lg};
    --radius-xl: ${borderRadius.xl};
    
    /* Shadows */
    --shadow-sm: ${shadows.sm};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};
    --shadow-xl: ${shadows.xl};
    
    /* Transitions */
    --transition-fast: ${transitions.fast};
    --transition-normal: ${transitions.normal};
    --transition-slow: ${transitions.slow};
    --transition-easing: ${transitions.easing};
  `.trim();
}

