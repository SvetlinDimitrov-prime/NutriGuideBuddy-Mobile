import Toast, { ToastShowParams } from 'react-native-toast-message';

const DEFAULT_VISIBILITY_TIME = 3000;

function internalShow(type: 'success' | 'error' | 'info', message: string, title: string) {
  Toast.hide();

  setTimeout(() => {
    const params: ToastShowParams = {
      type,
      text1: title,
      text2: message,
      autoHide: true,
      visibilityTime: DEFAULT_VISIBILITY_TIME,
      topOffset: 40,
    };

    Toast.show(params);
  }, 50);
}

export function showSuccess(message: string, title = 'Success') {
  internalShow('success', message, title);
}

export function showError(message: string, title = 'Error') {
  internalShow('error', message, title);
}

export function showInfo(message: string, title = 'Info') {
  internalShow('info', message, title);
}
