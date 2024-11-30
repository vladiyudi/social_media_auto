'use client';

import React from 'react';
import { Toast, ToastTitle, ToastDescription } from './toast';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant} onClose={() => dismiss(id)}>
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
        </Toast>
      ))}
    </>
  );
}
