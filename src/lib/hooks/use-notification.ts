import toast from 'react-hot-toast';

interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const useNotification = () => {
  const success = (message: string, options?: NotificationOptions) => {
    return toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  };

  const error = (message: string, options?: NotificationOptions) => {
    return toast.error(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  };

  const info = (message: string, options?: NotificationOptions) => {
    return toast(message, {
      icon: '💡',
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  };

  const loading = (message: string) => {
    return toast.loading(message);
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  };

  return {
    success,
    error,
    info,
    loading,
    dismiss,
    promise,
  };
};
