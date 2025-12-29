import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  lockedUntil: number | null;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 15 * 60 * 1000, // 15 minutes lockout
};

export function useRateLimit(key: string, config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [isLocked, setIsLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(finalConfig.maxAttempts);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);

  const getStorageKey = () => `rate_limit_${key}`;

  const getState = useCallback((): RateLimitState => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parsing errors
    }
    return {
      attempts: 0,
      windowStart: Date.now(),
      lockedUntil: null,
    };
  }, [key]);

  const setState = useCallback((state: RateLimitState) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [key]);

  const checkRateLimit = useCallback((): { allowed: boolean; remainingAttempts: number; lockoutEndTime: number | null } => {
    const now = Date.now();
    let state = getState();

    // Check if currently locked out
    if (state.lockedUntil && now < state.lockedUntil) {
      const remaining = 0;
      setIsLocked(true);
      setRemainingAttempts(remaining);
      setLockoutEndTime(state.lockedUntil);
      return { allowed: false, remainingAttempts: remaining, lockoutEndTime: state.lockedUntil };
    }

    // Clear lockout if expired
    if (state.lockedUntil && now >= state.lockedUntil) {
      state = {
        attempts: 0,
        windowStart: now,
        lockedUntil: null,
      };
      setState(state);
    }

    // Reset window if expired
    if (now - state.windowStart > finalConfig.windowMs) {
      state = {
        attempts: 0,
        windowStart: now,
        lockedUntil: null,
      };
      setState(state);
    }

    const remaining = finalConfig.maxAttempts - state.attempts;
    setIsLocked(false);
    setRemainingAttempts(remaining);
    setLockoutEndTime(null);

    return { allowed: remaining > 0, remainingAttempts: remaining, lockoutEndTime: null };
  }, [getState, setState, finalConfig]);

  const recordAttempt = useCallback((success: boolean = false): { allowed: boolean; remainingAttempts: number; lockoutEndTime: number | null } => {
    const now = Date.now();
    let state = getState();

    // If successful, reset the counter
    if (success) {
      state = {
        attempts: 0,
        windowStart: now,
        lockedUntil: null,
      };
      setState(state);
      setIsLocked(false);
      setRemainingAttempts(finalConfig.maxAttempts);
      setLockoutEndTime(null);
      return { allowed: true, remainingAttempts: finalConfig.maxAttempts, lockoutEndTime: null };
    }

    // Reset window if expired
    if (now - state.windowStart > finalConfig.windowMs) {
      state = {
        attempts: 0,
        windowStart: now,
        lockedUntil: null,
      };
    }

    // Increment attempts
    state.attempts += 1;

    // Check if should be locked out
    if (state.attempts >= finalConfig.maxAttempts) {
      state.lockedUntil = now + finalConfig.lockoutMs;
      setState(state);
      setIsLocked(true);
      setRemainingAttempts(0);
      setLockoutEndTime(state.lockedUntil);
      return { allowed: false, remainingAttempts: 0, lockoutEndTime: state.lockedUntil };
    }

    setState(state);
    const remaining = finalConfig.maxAttempts - state.attempts;
    setRemainingAttempts(remaining);
    return { allowed: true, remainingAttempts: remaining, lockoutEndTime: null };
  }, [getState, setState, finalConfig]);

  const reset = useCallback(() => {
    localStorage.removeItem(getStorageKey());
    setIsLocked(false);
    setRemainingAttempts(finalConfig.maxAttempts);
    setLockoutEndTime(null);
  }, [key, finalConfig]);

  const getRemainingLockoutTime = useCallback((): number => {
    const state = getState();
    if (state.lockedUntil) {
      const remaining = state.lockedUntil - Date.now();
      return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    }
    return 0;
  }, [getState]);

  return {
    isLocked,
    remainingAttempts,
    lockoutEndTime,
    checkRateLimit,
    recordAttempt,
    reset,
    getRemainingLockoutTime,
  };
}
