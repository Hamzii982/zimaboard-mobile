type NotifyFn = (message: string) => void;

let successFn: NotifyFn;
let errorFn: NotifyFn;
let onLoading: NotifyFn;

export const notificationBus = {
  success: (msg: string) => successFn?.(msg),
  error: (msg: string) => errorFn?.(msg),
  loading: (msg: string) => onLoading?.(msg),
  clear() { onLoading?.(""); },
  register: (success: NotifyFn, error: NotifyFn, loading: NotifyFn) => {
    successFn = success;
    errorFn = error;
    onLoading = loading ?? null;  
  },
};
