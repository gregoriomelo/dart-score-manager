import React, { useEffect, useRef } from 'react';
import './Modal.css';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** The title of the modal */
  title?: string;
  /** The content of the modal */
  children: React.ReactNode;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Whether to show a close button */
  showCloseButton?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether clicking outside should close the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape should close the modal */
  closeOnEscape?: boolean;
  /** The size of the modal */
  size?: 'small' | 'medium' | 'large' | 'full';
}

/**
 * A reusable modal component with consistent styling and behavior
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  showCloseButton = true,
  className = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  size = 'medium',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnOverlayClick &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape, closeOnOverlayClick]);

  if (!isOpen) return null;

  const modalClasses = [
    'shared-modal',
    `shared-modal--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="shared-modal-overlay" role="dialog" aria-modal="true">
      <div ref={modalRef} className={modalClasses}>
        {(title || showCloseButton) && (
          <div className="shared-modal-header">
            {title && (
              <h2 className="shared-modal-title">{title}</h2>
            )}
            {showCloseButton && (
              <button
                className="shared-modal-close"
                onClick={onClose}
                aria-label="Close modal"
                title="Close"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="shared-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

