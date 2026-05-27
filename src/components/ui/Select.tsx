/**
 * Select component for DI-Lab
 * Native dropdown for mobile compatibility with Radix UI enhancement
 */

"use client";

import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
  useState,
} from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  /** Label text */
  label?: string;
  /** Helper text shown below select */
  helperText?: string;
  /** Error message (shows error state) */
  error?: string;
  /** Options array */
  options: SelectOption[];
  /** Placeholder text (shown as disabled first option) */
  placeholder?: string;
  /** Change handler */
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => void;
  /** Full width select */
  fullWidth?: boolean;
  /** Start icon/adornment */
  startIcon?: ReactNode;
  /** Use Radix UI Select (better UX, less mobile friendly) */
  useRadix?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create options array from a range of numbers
 * Useful for rank (1-10) or quality (1-5) selects
 */
export function createNumberOptions(
  start: number,
  end: number,
  labelFn?: (n: number) => string,
): SelectOption[] {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const value = start + i;
    return {
      value,
      label: labelFn ? labelFn(value) : String(value),
    };
  });
}

/**
 * Pre-defined quality options (1-5 stars)
 */
export const QUALITY_OPTIONS: SelectOption[] = createNumberOptions(
  1,
  5,
  (n) => `Quality ${n}`,
);

/**
 * Pre-defined rank options (1-10)
 */
export const RANK_OPTIONS: SelectOption[] = createNumberOptions(
  1,
  10,
  (n) => `Rank ${n}`,
);

/**
 * Pre-defined star rating options
 */
export const STAR_RATING_OPTIONS: SelectOption[] = [
  { value: 1, label: "1-Star" },
  { value: 2, label: "2-Star" },
  { value: 5, label: "5-Star" },
];

// ============================================================================
// Native Select Component
// ============================================================================

const NativeSelect = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      onChange,
      fullWidth = false,
      startIcon,
      className,
      id,
      disabled,
      value,
      ...props
    },
    ref,
  ) => {
    // Generate unique ID if not provided
    const generatedId = useId();
    const selectId = id || generatedId;

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event.target.value, event);
    };

    const hasError = Boolean(error);

    return (
      <div className={cn(fullWidth ? "w-full" : "")}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
              {startIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            className={cn(
              "flex h-10 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-[var(--shadow-sm)] transition-colors appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50",
              hasError
                ? "border-[var(--destructive)] focus-visible:ring-[var(--destructive)]"
                : "border-[var(--input)]",
              startIcon ? "pl-10" : "",
              fullWidth ? "w-full" : "",
              "pr-10",
              disabled ? "opacity-50" : "",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow icon */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {hasError && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-sm text-[var(--destructive)]"
            role="alert"
          >
            {error}
          </p>
        )}

        {!hasError && helperText && (
          <p
            id={`${selectId}-helper`}
            className="mt-1 text-sm text-[var(--muted-foreground)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

NativeSelect.displayName = "NativeSelect";

// ============================================================================
// Radix Select Component
// ============================================================================

const RadixSelectComponent = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      onChange,
      fullWidth = false,
      startIcon,
      className,
      id,
      disabled,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const [isOpen, setIsOpen] = useState(false);
    const hasError = Boolean(error);

    const selectedOption = options.find(
      (opt) => String(opt.value) === String(value),
    );

    return (
      <div className={cn(fullWidth ? "w-full" : "")}>
        {label && (
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            {label}
          </label>
        )}

        <RadixSelect.Root
          value={value !== undefined ? String(value) : ""}
          onValueChange={(val) => {
            if (onChange) {
              const fakeEvent = {
                target: { value: val },
              } as React.ChangeEvent<HTMLSelectElement>;
              onChange(val, fakeEvent);
            }
          }}
          open={isOpen}
          onOpenChange={setIsOpen}
          disabled={disabled}
        >
          <RadixSelect.Trigger
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-1 text-sm shadow-[var(--shadow-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50",
              hasError
                ? "border-[var(--destructive)] focus-visible:ring-[var(--destructive)]"
                : "border-[var(--input)]",
              startIcon ? "pl-10" : "",
              fullWidth ? "w-full" : "",
              disabled ? "opacity-50" : "",
              className,
            )}
          >
            <div className="flex items-center gap-2">
              {startIcon && (
                <span className="text-[var(--muted-foreground)]">
                  {startIcon}
                </span>
              )}
              <RadixSelect.Value placeholder={placeholder}>
                {selectedOption?.label || placeholder}
              </RadixSelect.Value>
            </div>
            <RadixSelect.Icon>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>

          <RadixSelect.Portal>
            <RadixSelect.Content className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-[var(--popover)] text-[var(--popover-foreground)] shadow-[var(--shadow-md)]">
              <RadixSelect.Viewport className="p-1">
                {options.map((option) => (
                  <RadixSelect.Item
                    key={option.value}
                    value={String(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    )}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <RadixSelect.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </RadixSelect.ItemIndicator>
                    </span>
                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  </RadixSelect.Item>
                ))}
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>

        {hasError && (
          <p className="mt-1 text-sm text-[var(--destructive)]" role="alert">
            {error}
          </p>
        )}

        {!hasError && helperText && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

RadixSelectComponent.displayName = "RadixSelect";

// ============================================================================
// Main Select Component (chooses between native and Radix)
// ============================================================================

/**
 * Select component with native dropdown for mobile compatibility
 * Optionally uses Radix UI for enhanced UX
 *
 * @example
 * ```tsx
 * <Select
 *   label="Quality"
 *   value={quality}
 *   onChange={(val) => setQuality(Number(val))}
 *   options={[
 *     { value: 1, label: '1★' },
 *     { value: 2, label: '2★' },
 *   ]}
 * />
 * ```
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const { useRadix = false, ...rest } = props;

  if (useRadix) {
    return <RadixSelectComponent ref={ref} {...rest} />;
  }

  return <NativeSelect ref={ref} {...rest} />;
});

Select.displayName = "Select";

// ============================================================================
// Exports
// ============================================================================

export { Select, NativeSelect, RadixSelectComponent };
export default Select;
