
import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const getPasswordStrength = (password: string): { strength: number; message: string } => {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  const criteria = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough];
  const strength = criteria.filter(Boolean).length;

  let message = '';
  switch (strength) {
    case 0:
    case 1:
      message = 'Muito fraca';
      break;
    case 2:
      message = 'Fraca';
      break;
    case 3:
      message = 'Média';
      break;
    case 4:
      message = 'Forte';
      break;
    case 5:
      message = 'Muito forte';
      break;
    default:
      message = 'Muito fraca';
  }

  return { strength, message };
};

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { strength, message } = getPasswordStrength(password);
  const strengthPercentage = (strength / 5) * 100;

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      case 5:
        return 'bg-green-600';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-300 rounded-full">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">
        Força da senha: <span className="font-medium">{message}</span>
      </p>
    </div>
  );
};
