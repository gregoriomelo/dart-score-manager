import React from 'react';
import './Button.css';

export interface ButtonProps {
  /** The content to display inside the button */
  children: React.ReactNode;
  /** The type of button */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** The size of the button */
  size?: 'small' | 'medium' | 'large';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** The type of the button element */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessibility label */
  'aria-label'?: string;
  /** Title for tooltip */
  title?: string;
}

/**
 * A reusable button component with consistent styling and behavior
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  'aria-label': ariaLabel,
  title,
}) => {
  const baseClass = 'shared-button';
  const variantClass = `shared-button--${variant}`;
  const sizeClass = `shared-button--${size}`;
  const stateClass = disabled ? 'shared-button--disabled' : '';
  const loadingClass = loading ? 'shared-button--loading' : '';

  const buttonClasses = [
    baseClass,
    variantClass,
    sizeClass,
    stateClass,
    loadingClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {loading && <span className="shared-button__loader" />}
      <span className="shared-button__content">{children}</span>
    </button>
  );
};

export default Button;

