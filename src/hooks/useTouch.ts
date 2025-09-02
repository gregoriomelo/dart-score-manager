/**
 * Touch interaction hooks for mobile gesture support
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

export interface TouchState {
  isTouching: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  deltaX: number;
  deltaY: number;
  distance: number;
}

export interface TouchOptions {
  threshold?: number;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  preventDefault?: boolean;
}

const DEFAULT_OPTIONS: TouchOptions = {
  threshold: 10,
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  preventDefault: true,
};

/**
 * Hook for detecting swipe gestures
 */
export function useSwipe(
  onSwipe?: (gesture: SwipeGesture) => void,
  options: TouchOptions = {}
) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  const [touchState, setTouchState] = useState<TouchState>({
    isTouching: false,
    startPoint: null,
    currentPoint: null,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
  });

  const startTime = useRef<number>(0);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (opts.preventDefault) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    startTime.current = point.timestamp;

    setTouchState({
      isTouching: true,
      startPoint: point,
      currentPoint: point,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
    });
  }, [opts.preventDefault]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchState.startPoint) return;

    const touch = event.touches[0];
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    const deltaX = currentPoint.x - touchState.startPoint.x;
    const deltaY = currentPoint.y - touchState.startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    setTouchState(prev => ({
      ...prev,
      currentPoint,
      deltaX,
      deltaY,
      distance,
    }));
  }, [touchState.startPoint]);

  const handleTouchEnd = useCallback(() => {
    if (!touchState.startPoint || !touchState.currentPoint) return;

    const endTime = Date.now();
    const duration = endTime - startTime.current;
    const { deltaX, deltaY, distance } = touchState;

    // Check if it's a valid swipe
    if (
      distance >= opts.minSwipeDistance! &&
      duration <= opts.maxSwipeTime! &&
      (Math.abs(deltaX) > opts.threshold! || Math.abs(deltaY) > opts.threshold!)
    ) {
      const velocity = distance / duration;
      let direction: SwipeGesture['direction'];

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gesture: SwipeGesture = {
        direction,
        distance,
        velocity,
        duration,
      };

      onSwipe?.(gesture);
    }

    setTouchState({
      isTouching: false,
      startPoint: null,
      currentPoint: null,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
    });
  }, [touchState, onSwipe, opts]);

  const bindTouchEvents = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !opts.preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !opts.preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !opts.preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, opts.preventDefault]);

  return {
    touchState,
    bindTouchEvents,
  };
}

/**
 * Hook for detecting tap gestures
 */
export function useTap(
  onTap?: (point: TouchPoint) => void,
  options: TouchOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [isTapping, setIsTapping] = useState(false);
  const startPoint = useRef<TouchPoint | null>(null);
  const startTime = useRef<number>(0);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (opts.preventDefault) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    startPoint.current = point;
    startTime.current = point.timestamp;
    setIsTapping(true);
  }, [opts.preventDefault]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!startPoint.current) return;

    const endTime = Date.now();
    const duration = endTime - startTime.current;
    const touch = event.changedTouches[0];
    const endPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: endTime,
    };

    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.current.x, 2) +
      Math.pow(endPoint.y - startPoint.current.y, 2)
    );

    // Check if it's a valid tap (short duration, small distance)
    if (duration < 300 && distance < opts.threshold!) {
      onTap?.(startPoint.current);
    }

    setIsTapping(false);
    startPoint.current = null;
  }, [onTap, opts.threshold]);

  const bindTapEvents = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !opts.preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !opts.preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd, opts.preventDefault]);

  return {
    isTapping,
    bindTapEvents,
  };
}

/**
 * Hook for detecting long press gestures
 */
export function useLongPress(
  onLongPress?: (point: TouchPoint) => void,
  options: TouchOptions & { duration?: number } = {}
) {
  const opts = { ...DEFAULT_OPTIONS, duration: 500, ...options };
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const startPoint = useRef<TouchPoint | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (opts.preventDefault) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    startPoint.current = point;

    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      onLongPress?.(point);
    }, opts.duration);
  }, [opts.preventDefault, opts.duration, onLongPress]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!startPoint.current) return;

    const touch = event.touches[0];
    const distance = Math.sqrt(
      Math.pow(touch.clientX - startPoint.current.x, 2) +
      Math.pow(touch.clientY - startPoint.current.y, 2)
    );

    // Cancel long press if moved too far
    if (distance > opts.threshold!) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      setIsLongPressing(false);
    }
  }, [opts.threshold]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
    startPoint.current = null;
  }, []);

  const bindLongPressEvents = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !opts.preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !opts.preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !opts.preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, opts.preventDefault]);

  return {
    isLongPressing,
    bindLongPressEvents,
  };
}

/**
 * Hook for detecting pinch gestures
 */
export function usePinch(
  onPinch?: (scale: number, center: { x: number; y: number }) => void,
  options: TouchOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [isPinching, setIsPinching] = useState(false);
  const initialDistance = useRef<number>(0);
  // initialScale used for pinch gesture calculations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const initialScale = useRef<number>(1);

  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touches: TouchList): { x: number; y: number } => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (opts.preventDefault) {
      event.preventDefault();
    }

    if (event.touches.length === 2) {
      initialDistance.current = getDistance(event.touches);
      setIsPinching(true);
    }
  }, [opts.preventDefault]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2 || !isPinching) return;

    const currentDistance = getDistance(event.touches);
    const scale = currentDistance / initialDistance.current;
    const center = getCenter(event.touches);

    onPinch?.(scale, center);
  }, [isPinching, onPinch]);

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false);
    initialDistance.current = 0;
  }, []);

  const bindPinchEvents = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !opts.preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !opts.preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !opts.preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, opts.preventDefault]);

  return {
    isPinching,
    bindPinchEvents,
  };
}

/**
 * Hook for detecting device capabilities
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isTouch: false,
    isMobile: false,
    hasHover: false,
    hasPointer: false,
  });

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities({
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        hasHover: window.matchMedia('(hover: hover)').matches,
        hasPointer: window.matchMedia('(pointer: fine)').matches,
      });
    };

    updateCapabilities();
    window.addEventListener('resize', updateCapabilities);
    window.addEventListener('orientationchange', updateCapabilities);

    return () => {
      window.removeEventListener('resize', updateCapabilities);
      window.removeEventListener('orientationchange', updateCapabilities);
    };
  }, []);

  return capabilities;
}
