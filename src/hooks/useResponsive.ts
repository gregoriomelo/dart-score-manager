/**
 * Responsive design hook for managing breakpoints and responsive behavior
 */

import { useState, useEffect, useCallback } from 'react';

export interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

export interface ResponsiveState {
  currentBreakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait';
}

export const breakpoints: Breakpoint[] = [
  { name: 'xs', minWidth: 0, maxWidth: 575 },
  { name: 'sm', minWidth: 576, maxWidth: 767 },
  { name: 'md', minWidth: 768, maxWidth: 991 },
  { name: 'lg', minWidth: 992, maxWidth: 1199 },
  { name: 'xl', minWidth: 1200, maxWidth: 1399 },
  { name: 'xxl', minWidth: 1400 },
];

/**
 * Hook for responsive design state management
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    currentBreakpoint: 'xs',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isLandscape: false,
    isPortrait: true,
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
  });

  const updateResponsiveState = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width > height ? 'landscape' : 'portrait';

    // Find current breakpoint
    const currentBreakpoint = breakpoints.find(
      bp => width >= bp.minWidth && (!bp.maxWidth || width <= bp.maxWidth)
    )?.name || 'xs';

    // Determine device type
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 992;
    const isDesktop = width >= 992;

    setState({
      currentBreakpoint,
      isMobile,
      isTablet,
      isDesktop,
      isLandscape: orientation === 'landscape',
      isPortrait: orientation === 'portrait',
      width,
      height,
      orientation,
    });
  }, []);

  useEffect(() => {
    updateResponsiveState();

    const handleResize = () => {
      updateResponsiveState();
    };

    const handleOrientationChange = () => {
      // Delay to ensure orientation change is complete
      setTimeout(updateResponsiveState, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateResponsiveState]);

  return state;
}

/**
 * Hook for checking if current breakpoint matches
 */
export function useBreakpoint(breakpointName: string): boolean {
  const { currentBreakpoint } = useResponsive();
  return currentBreakpoint === breakpointName;
}

/**
 * Hook for checking if current breakpoint is at least the specified size
 */
export function useBreakpointAtLeast(breakpointName: string): boolean {
  const { currentBreakpoint } = useResponsive();
  const currentIndex = breakpoints.findIndex(bp => bp.name === currentBreakpoint);
  const targetIndex = breakpoints.findIndex(bp => bp.name === breakpointName);
  return currentIndex >= targetIndex;
}

/**
 * Hook for checking if current breakpoint is at most the specified size
 */
export function useBreakpointAtMost(breakpointName: string): boolean {
  const { currentBreakpoint } = useResponsive();
  const currentIndex = breakpoints.findIndex(bp => bp.name === currentBreakpoint);
  const targetIndex = breakpoints.findIndex(bp => bp.name === breakpointName);
  return currentIndex <= targetIndex;
}

/**
 * Hook for responsive values based on breakpoints
 */
export function useResponsiveValue<T>(
  values: Partial<Record<string, T>>,
  defaultValue: T
): T {
  const { currentBreakpoint } = useResponsive();
  return values[currentBreakpoint] || defaultValue;
}

/**
 * Hook for responsive styles
 */
export function useResponsiveStyles(
  styles: Partial<Record<string, React.CSSProperties>>
): React.CSSProperties {
  const { currentBreakpoint } = useResponsive();
  return styles[currentBreakpoint] || {};
}

/**
 * Hook for responsive class names
 */
export function useResponsiveClasses(
  classes: Partial<Record<string, string>>
): string {
  const { currentBreakpoint } = useResponsive();
  return classes[currentBreakpoint] || '';
}

/**
 * Hook for responsive visibility
 */
export function useResponsiveVisibility(
  visibility: Partial<Record<string, boolean>>,
  defaultValue: boolean = true
): boolean {
  const { currentBreakpoint } = useResponsive();
  return visibility[currentBreakpoint] ?? defaultValue;
}

/**
 * Hook for responsive layout
 */
export function useResponsiveLayout() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return {
    isMobile,
    isTablet,
    isDesktop,
    layout: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    columns: isMobile ? 1 : isTablet ? 2 : 3,
    spacing: isMobile ? 'sm' : isTablet ? 'md' : 'lg',
  };
}

/**
 * Hook for responsive navigation
 */
export function useResponsiveNavigation() {
  const { isMobile } = useResponsive();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return {
    isMobile,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    showHamburger: isMobile,
  };
}

/**
 * Hook for responsive touch targets
 */
export function useResponsiveTouchTargets() {
  const { isMobile, isTablet } = useResponsive();

  return {
    buttonHeight: isMobile ? 48 : isTablet ? 44 : 40,
    buttonMinWidth: isMobile ? 48 : isTablet ? 44 : 40,
    inputHeight: isMobile ? 48 : isTablet ? 44 : 40,
    touchSpacing: isMobile ? 16 : isTablet ? 12 : 8,
  };
}

/**
 * Hook for responsive typography
 */
export function useResponsiveTypography() {
  const { isMobile, isTablet } = useResponsive();

  return {
    h1: isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl',
    h2: isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl',
    h3: isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl',
    body: isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-lg',
    small: isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-base',
  };
}

/**
 * Hook for responsive spacing
 */
export function useResponsiveSpacing() {
  const { isMobile, isTablet } = useResponsive();

  return {
    xs: isMobile ? 4 : isTablet ? 6 : 8,
    sm: isMobile ? 8 : isTablet ? 12 : 16,
    md: isMobile ? 16 : isTablet ? 20 : 24,
    lg: isMobile ? 24 : isTablet ? 32 : 40,
    xl: isMobile ? 32 : isTablet ? 40 : 48,
  };
}

/**
 * Hook for responsive grid
 */
export function useResponsiveGrid() {
  const { isMobile, isTablet } = useResponsive();

  return {
    columns: isMobile ? 1 : isTablet ? 2 : 3,
    gap: isMobile ? 16 : isTablet ? 20 : 24,
    padding: isMobile ? 16 : isTablet ? 24 : 32,
  };
}

/**
 * Hook for responsive animations
 */
export function useResponsiveAnimations() {
  const { isMobile } = useResponsive();

  return {
    duration: isMobile ? 200 : 300,
    easing: isMobile ? 'ease-out' : 'ease-in-out',
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

/**
 * Hook for responsive performance
 */
export function useResponsivePerformance() {
  const { isMobile } = useResponsive();

  return {
    enableAnimations: !isMobile,
    enableParallax: !isMobile,
    enableHoverEffects: !isMobile,
    enableComplexLayouts: !isMobile,
  };
}
