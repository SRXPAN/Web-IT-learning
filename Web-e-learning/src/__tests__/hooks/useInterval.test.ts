// src/__tests__/hooks/useInterval.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInterval } from '../../utils/useInterval';

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call callback at specified interval', () => {
    const callback = vi.fn();
    
    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);
    
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should not call callback when delay is null', () => {
    const callback = vi.fn();
    
    renderHook(() => useInterval(callback, null));

    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should clear interval on unmount', () => {
    const callback = vi.fn();
    
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    vi.advanceTimersByTime(2500);
    expect(callback).toHaveBeenCalledTimes(2);
    
    unmount();
    
    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(2); // Still 2, no more calls
  });

  it('should update callback without resetting interval', () => {
    let counter = 0;
    const callback1 = vi.fn(() => { counter += 1; });
    const callback2 = vi.fn(() => { counter += 10; });
    
    const { rerender } = renderHook(
      ({ cb }) => useInterval(cb, 1000),
      { initialProps: { cb: callback1 } }
    );

    vi.advanceTimersByTime(1000);
    expect(counter).toBe(1);
    
    // Update callback
    rerender({ cb: callback2 });
    
    vi.advanceTimersByTime(1000);
    expect(counter).toBe(11); // 1 + 10
  });

  it('should restart interval when delay changes', () => {
    const callback = vi.fn();
    
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 as number | null } }
    );

    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
    
    // Change delay to 200ms
    rerender({ delay: 200 });
    
    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);
    
    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should stop interval when delay changes to null', () => {
    const callback = vi.fn();
    
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 as number | null } }
    );

    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(2);
    
    // Disable interval
    rerender({ delay: null });
    
    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(2); // No more calls
  });

  it('should work with very short intervals', () => {
    const callback = vi.fn();
    
    renderHook(() => useInterval(callback, 10));

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(10);
  });

  it('should handle delay of 0', () => {
    const callback = vi.fn();
    
    renderHook(() => useInterval(callback, 0));

    // setInterval with 0 delay still calls after a minimal timeout
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalled();
  });
});
