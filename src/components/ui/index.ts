/**
 * UI Components Index
 * Re-exports all UI components for convenient imports
 */

// Button - shadcn/ui pattern with cva
export { Button, buttonVariants, type ButtonProps } from "./Button";

// Card - shadcn/ui pattern
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardBody,
} from "./Card";

// Dialog - Radix UI with shadcn/ui styling (replaces Modal)
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./Dialog";

// Input - shadcn/ui pattern with enhanced features
export {
  Input,
  NumberInput,
  type InputProps,
  type NumberInputProps,
} from "./Input";

// Select - Native + Radix UI with shadcn/ui styling
export {
  Select,
  createNumberOptions,
  QUALITY_OPTIONS,
  RANK_OPTIONS,
  STAR_RATING_OPTIONS,
  type SelectProps,
  type SelectOption,
} from "./Select";

// Modal - backward compatibility wrapper
export {
  Modal,
  ConfirmModal,
  type ModalProps,
  type ConfirmModalProps,
} from "./Modal";

// Skeleton
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonGemCard,
  SkeletonRecommendation,
  SkeletonGrid,
  type SkeletonProps,
} from "./Skeleton";

// Toast
export {
  ToastProvider,
  useToast,
  useToastActions,
  type Toast,
  type ToastType,
} from "./Toast";

// Screen Reader
export {
  ScreenReaderAnnouncer,
  useScreenReader,
} from "./ScreenReaderAnnouncer";

// Tooltip - Custom tooltip with backward compatibility
export {
  default as Tooltip,
  GemSummaryTooltip,
  type TooltipProps,
  type GemSummaryTooltipProps,
} from "./Tooltip";
