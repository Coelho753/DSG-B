export function useToast() {
  return {
    success: (msg) => window.alert(msg),
    error: (msg) => window.alert(msg),
  };
}
