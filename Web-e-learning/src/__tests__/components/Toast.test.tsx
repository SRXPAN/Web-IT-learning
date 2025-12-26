// src/__tests__/components/Toast.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toasts, { useToast } from '../../components/Toast';

describe('useToast store', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      const state = useToast.getState();
      state.toasts.forEach(t => state.remove(t.id));
    });
  });

  it('should start with empty toasts', () => {
    const { toasts } = useToast.getState();
    expect(toasts).toEqual([]);
  });

  it('should add toast with push', () => {
    act(() => {
      useToast.getState().push({ type: 'success', msg: 'Test message' });
    });
    
    const { toasts } = useToast.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].msg).toBe('Test message');
    expect(toasts[0].id).toBeDefined();
  });

  it('should add multiple toasts', () => {
    act(() => {
      useToast.getState().push({ type: 'success', msg: 'Message 1' });
      useToast.getState().push({ type: 'error', msg: 'Message 2' });
      useToast.getState().push({ type: 'info', msg: 'Message 3' });
    });
    
    const { toasts } = useToast.getState();
    expect(toasts).toHaveLength(3);
  });

  it('should remove toast by id', () => {
    act(() => {
      useToast.getState().push({ type: 'success', msg: 'Will be removed' });
    });
    
    const toastId = useToast.getState().toasts[0].id;
    
    act(() => {
      useToast.getState().remove(toastId);
    });
    
    const { toasts } = useToast.getState();
    expect(toasts).toHaveLength(0);
  });

  it('should generate unique ids for toasts', () => {
    act(() => {
      useToast.getState().push({ type: 'success', msg: 'Message 1' });
      useToast.getState().push({ type: 'success', msg: 'Message 2' });
    });
    
    const { toasts } = useToast.getState();
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });
});

describe('Toasts component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset store state
    act(() => {
      const state = useToast.getState();
      state.toasts.forEach(t => state.remove(t.id));
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render empty when no toasts', () => {
    const { container } = render(<Toasts />);
    expect(container.querySelector('.space-y-2')).toBeInTheDocument();
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('should render success toast', () => {
    act(() => {
      useToast.getState().push({ type: 'success', msg: 'Success message' });
    });
    
    render(<Toasts />);
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should render error toast', () => {
    act(() => {
      useToast.getState().push({ type: 'error', msg: 'Error message' });
    });
    
    render(<Toasts />);
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('should render info toast', () => {
    act(() => {
      useToast.getState().push({ type: 'info', msg: 'Info message' });
    });
    
    render(<Toasts />);
    
    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('should remove toast on click', () => {
    act(() => {
      useToast.getState().push({ type: 'success', msg: 'Click to remove' });
    });
    
    render(<Toasts />);
    
    const toast = screen.getByText('Click to remove');
    fireEvent.click(toast.closest('div.cursor-pointer')!);
    
    expect(screen.queryByText('Click to remove')).not.toBeInTheDocument();
  });

  it('should auto-remove toast after 5 seconds', () => {
    act(() => {
      useToast.getState().push({ type: 'success', msg: 'Auto remove' });
    });
    
    render(<Toasts />);
    
    expect(screen.getByText('Auto remove')).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(screen.queryByText('Auto remove')).not.toBeInTheDocument();
  });

  it('should render multiple toasts', () => {
    act(() => {
      useToast.getState().push({ type: 'success', msg: 'First' });
      useToast.getState().push({ type: 'error', msg: 'Second' });
      useToast.getState().push({ type: 'info', msg: 'Third' });
    });
    
    render(<Toasts />);
    
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});
