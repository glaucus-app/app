/**
 * Modal component for DI-Lab
 * With focus trap, ESC key close, and accessibility features (FR-030, FR-030a)
 */

"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./Button";

// ============================================================================
// Types
// ============================================================================

export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Footer content (actions) */
  footer?: ReactNode;
  /** Size of modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on ESC key */
  closeOnEsc?: boolean;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Additional className for modal content */
  className?: string;
  /** Element to return focus to on close */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[95vw] max-h-[95vh]",
};

const baseStyles = `
  bg-[var(--card)]
  rounded-lg
  shadow-[var(--shadow-xl)]
  w-full
  max-h-[90vh]
  overflow-hidden
  flex
  flex-col
  animate-in
  fade-in
  zoom-in-95
  duration-200
`;

// ============================================================================
// Component
// ============================================================================

/**
 * Modal component with focus management and accessibility
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Gem Details"
 * >
 *   <p>Content here</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = "",
  initialFocusRef,
}: ModalProps) {
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Store the trigger element when modal opens
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle ESC key
  const handleKeyDown = useCallback(
    (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEsc) {
        onClose();
      }
    },
    [closeOnEsc, onClose],
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && closeOnBackdrop) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose],
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Add event listeners
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Focus the modal or initial focus element
      const focusElement = initialFocusRef?.current || modalRef.current;
      focusElement?.focus();

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    } else {
      // Return focus to trigger element
      if (triggerElementRef.current && "focus" in triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen, handleKeyDown, initialFocusRef]);

  // Focus trap
  const handleModalKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [],
  );

  // Don't render if not open or not in browser
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className={`${baseStyles} ${sizeStyles[size]} ${className}`
          .replace(/\s+/g, " ")
          .trim()}
        tabIndex={-1}
        onKeyDown={handleModalKeyDown}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[var(--foreground)]"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto -mr-2"
              >
                <X size={20} />
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal
  return createPortal(content, document.body);
}

// ============================================================================
// Confirmation Modal Variant
// ============================================================================

export interface ConfirmModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Modal title */
  title: string;
  /** Message to display */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Use danger styling for confirm button */
  danger?: boolean;
  /** Loading state */
  loading?: boolean;
}

/**
 * Confirmation modal for destructive actions
 *
 * @example
 * ```tsx
 * <ConfirmModal
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Build"
 *   message="Are you sure you want to delete this build? This action cannot be undone."
 *   danger
 * />
 * ```
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-[var(--muted-foreground)]">{message}</p>
    </Modal>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default Modal;
