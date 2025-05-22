// utils/toast.js
import { toast } from 'react-toastify';

export const showSuccessToast = (msg) => {
  toast.success(msg, {
    icon: '🎉',
  });
};


export const showErrorToast = (msg) => {
  toast.error(msg, {
    icon: '⚠️',
  });
};

