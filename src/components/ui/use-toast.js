'use client';

import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setToasts((prevToasts) => [
      ...prevToasts,
      {
        id,
        title,
        description,
        variant,
      },
    ]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);

    return id;
  }, []);

  const dismiss = useCallback((toastId) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId));
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}
