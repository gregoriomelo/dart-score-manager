import React, { forwardRef } from 'react';
import './Input.css';

export interface InputProps {
  /** The type of input */
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';
  /** The value of the input */
  value?: string | number;
  /** The placeholder text */
  placeholder?: string;
  /** The label for the input */
  label?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is in an error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** The name attribute */
  name?: string;
  /** The id attribute */
  id?: string;
  /** Minimum value for number inputs */
  min?: number;
  /** Maximum value for number inputs */
  max?: number;
  /** Step value for number inputs */
  step?: number;
  /** Input mode for mobile keyboards */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  /** Pattern for input validation */
  pattern?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Key down handler */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * A reusable input component with consistent styling and behavior
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  value,
  placeholder,
  label,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  className = '',
  name,
  id,
  min,
  max,
  step,
  inputMode,
  pattern,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
}, ref) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = label ? `${inputId}-label` : undefined;

  const inputClasses = [
    'shared-input',
    error ? 'shared-input--error' : '',
    disabled ? 'shared-input--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="shared-input-container">
      {label && (
        <label
          htmlFor={inputId}
          id={labelId}
          className="shared-input-label"
        >
          {label}
          {required && <span className="shared-input-required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        inputMode={inputMode}
        pattern={pattern}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className={inputClasses}
        aria-labelledby={labelId}
        aria-invalid={error}
        aria-describedby={errorMessage ? `${inputId}-error` : undefined}
      />
      {errorMessage && (
        <div
          id={`${inputId}-error`}
          className="shared-input-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

