// Stub use-toast hook for demo
export function useToast() {
  const noop = (..._args: unknown[]) => {};
  return {
    toast: noop,
    showToast: noop,
  };
}
