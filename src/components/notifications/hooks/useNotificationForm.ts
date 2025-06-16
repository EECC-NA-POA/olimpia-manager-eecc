
import { useState } from 'react';

export const useNotificationForm = () => {
  const [mensagem, setMensagem] = useState('');

  const resetForm = () => {
    setMensagem('');
  };

  return {
    mensagem,
    setMensagem,
    resetForm
  };
};
