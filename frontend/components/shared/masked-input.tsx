'use client';

import * as React from 'react';
import { cn, maskCPF, maskCNPJ, maskPhone, maskCEP } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: 'cpf' | 'cnpj' | 'phone' | 'cep';
}

const MaskedInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, mask, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        const value = e.target.value;
        let maskedValue = value;

        if (mask === 'cpf') maskedValue = maskCPF(value);
        else if (mask === 'cnpj') maskedValue = maskCNPJ(value);
        else if (mask === 'phone') maskedValue = maskPhone(value);
        else if (mask === 'cep') maskedValue = maskCEP(value);

        e.target.value = maskedValue;
      }
      onChange?.(e);
    };

    return (
      <input
        type={props.type || 'text'}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
MaskedInput.displayName = 'MaskedInput';

export { MaskedInput };
