/**
 * Multi-tab conflict detection using BroadcastChannel API
 * Implements edge case handling for concurrent edits across browser tabs
 *
 * @module hooks/useMultiTabSync
 */

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Message types for cross-tab communication
 */
type TabMessageType =
  | "SESSION_UPDATE"
  | "SESSION_SAVE"
  | "SESSION_ROLLBACK"
  | "TAB_OPENED"
  | "TAB_CLOSED";

/**
 * Message structure for BroadcastChannel communication
 */
interface TabMessage<T> {
  /** Message type */
  type: TabMessageType;
  /** Tab ID that sent the message */
  tabId: string;
  /** Timestamp of the message */
  timestamp: number;
  /** Payload data */
  payload?: T;
}

/**
 * Conflict notification for UI display
 */
export interface TabConflictNotification {
  /** Unique ID for this notification */
  id: string;
  /** Human-readable message */
  message: string;
  /** Timestamp when the conflict was detected */
  timestamp: number;
  /** Whether the notification is paused (user is hovering) */
  isPaused: boolean;
}

/**
 * Options for multi-tab sync
 */
interface MultiTabSyncOptions<T> {
  /** Channel name for BroadcastChannel */
  channelName?: string;
  /** Current tab ID */
  tabId?: string;
  /** Callback when another tab updates state */
  onRemoteUpdate?: (state: T, sourceTabId: string) => void;
  /** Callback when a conflict is detected */
  onConflict?: (notification: TabConflictNotification) => void;
  /** Auto-dismiss timeout in milliseconds (default: 5000) */
  autoDismissMs?: number;
}

/**
 * Return type for useMultiTabSync hook
 */
interface MultiTabSyncReturn<T> {
  /** Broadcast local state change to other tabs */
  broadcastUpdate: (state: T) => void;
  /** Broadcast a save event */
  broadcastSave: (state: T) => void;
  /** Broadcast a rollback event */
  broadcastRollback: (previousState: T) => void;
  /** Current conflict notification (if any) */
  conflictNotification: TabConflictNotification | null;
  /** Dismiss the current notification */
  dismissNotification: () => void;
  /** Pause auto-dismiss (e.g., on hover) */
  pauseNotification: () => void;
  /** Resume auto-dismiss */
  resumeNotification: () => void;
  /** Whether this tab is the primary tab (first opened) */
  isPrimaryTab: boolean;
}

/**
 * Generate a unique tab ID
 */
function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if BroadcastChannel API is available
 */
function isBroadcastChannelAvailable(): boolean {
  return typeof BroadcastChannel !== "undefined";
}

/**
 * Hook for detecting and handling multi-tab conflicts
 *
 * Usage:
 * ```tsx
 * const {
 *   broadcastUpdate,
 *   conflictNotification,
 *   dismissNotification,
 *   pauseNotification,
 *   resumeNotification,
 * } = useMultiTabSync({
 *   onRemoteUpdate: (state) => {
 *     // Handle remote update
 *   },
 * });
 *
 * // Broadcast local changes
 * broadcastUpdate(newState);
 * ```
 */
export function useMultiTabSync<T>(
  options: MultiTabSyncOptions<T> = {},
): MultiTabSyncReturn<T> {
  const {
    channelName = "di-lab-session-sync",
    tabId = generateTabId(),
    onRemoteUpdate,
    onConflict,
    autoDismissMs = 5000,
  } = options;

  const [conflictNotification, setConflictNotification] =
    useState<TabConflictNotification | null>(null);
  const [isPrimaryTab, setIsPrimaryTab] = useState(false);

  // Refs for cleanup and timeout management
  const channelRef = useRef<BroadcastChannel | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const registeredTabsRef = useRef<Set<string>>(new Set());

  /**
   * Clear any pending dismiss timeout
   */
  const clearDismissTimeout = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
  }, []);

  /**
   * Schedule auto-dismiss
   */
  const scheduleDismiss = useCallback(() => {
    if (isPausedRef.current) return;

    clearDismissTimeout();
    dismissTimeoutRef.current = setTimeout(() => {
      setConflictNotification(null);
    }, autoDismissMs);
  }, [autoDismissMs, clearDismissTimeout]);

  /**
   * Handle incoming messages from other tabs
   */
  const handleMessage = useCallback(
    (event: MessageEvent<TabMessage<T>>) => {
      const message = event.data;

      // Ignore messages from self
      if (message.tabId === tabId) return;

      switch (message.type) {
        case "SESSION_UPDATE":
        case "SESSION_SAVE":
          // Another tab updated state
          if (message.payload && onRemoteUpdate) {
            onRemoteUpdate(message.payload, message.tabId);
          }

          // Show conflict notification
          const notification: TabConflictNotification = {
            id: `conflict-${Date.now()}`,
            message: `Changes detected from another tab. Your session has been updated.`,
            timestamp: Date.now(),
            isPaused: false,
          };
          setConflictNotification(notification);

          if (onConflict) {
            onConflict(notification);
          }

          scheduleDismiss();
          break;

        case "TAB_OPENED":
          // Another tab was opened
          if (message.tabId) {
            registeredTabsRef.current.add(message.tabId);
          }
          break;

        case "TAB_CLOSED":
          // Another tab was closed
          if (message.tabId) {
            registeredTabsRef.current.delete(message.tabId);
          }
          break;

        case "SESSION_ROLLBACK":
          // Another tab rolled back - also notify
          const rollbackNotification: TabConflictNotification = {
            id: `rollback-${Date.now()}`,
            message: `Another tab reverted changes. Your session may be out of sync.`,
            timestamp: Date.now(),
            isPaused: false,
          };
          setConflictNotification(rollbackNotification);

          if (onConflict) {
            onConflict(rollbackNotification);
          }

          scheduleDismiss();
          break;
      }
    },
    [tabId, onRemoteUpdate, onConflict, scheduleDismiss],
  );

  /**
   * Initialize BroadcastChannel
   */
  useEffect(() => {
    if (!isBroadcastChannelAvailable()) {
      // BroadcastChannel not available (older browsers)
      console.warn(
        "BroadcastChannel API not available. Multi-tab sync disabled.",
      );
      return;
    }

    // Create channel
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    // Set up message handler
    channel.addEventListener("message", handleMessage);

    // Broadcast that this tab is open
    const openMessage: TabMessage<never> = {
      type: "TAB_OPENED",
      tabId,
      timestamp: Date.now(),
    };
    channel.postMessage(openMessage);

    // Check if this is the first tab (primary)
    // If no other tabs respond within 100ms, consider this the primary tab
    const primaryCheckTimeout = setTimeout(() => {
      setIsPrimaryTab(registeredTabsRef.current.size === 0);
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(primaryCheckTimeout);
      clearDismissTimeout();

      // Broadcast tab closed
      const closeMessage: TabMessage<never> = {
        type: "TAB_CLOSED",
        tabId,
        timestamp: Date.now(),
      };
      channel.postMessage(closeMessage);

      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [channelName, tabId, handleMessage, clearDismissTimeout]);

  /**
   * Broadcast a state update to other tabs
   */
  const broadcastUpdate = useCallback(
    (state: T) => {
      if (!channelRef.current) return;

      const message: TabMessage<T> = {
        type: "SESSION_UPDATE",
        tabId,
        timestamp: Date.now(),
        payload: state,
      };
      channelRef.current.postMessage(message);
    },
    [tabId],
  );

  /**
   * Broadcast a save event to other tabs
   */
  const broadcastSave = useCallback(
    (state: T) => {
      if (!channelRef.current) return;

      const message: TabMessage<T> = {
        type: "SESSION_SAVE",
        tabId,
        timestamp: Date.now(),
        payload: state,
      };
      channelRef.current.postMessage(message);
    },
    [tabId],
  );

  /**
   * Broadcast a rollback event to other tabs
   */
  const broadcastRollback = useCallback(
    (previousState: T) => {
      if (!channelRef.current) return;

      const message: TabMessage<T> = {
        type: "SESSION_ROLLBACK",
        tabId,
        timestamp: Date.now(),
        payload: previousState,
      };
      channelRef.current.postMessage(message);
    },
    [tabId],
  );

  /**
   * Dismiss the current notification
   */
  const dismissNotification = useCallback(() => {
    clearDismissTimeout();
    setConflictNotification(null);
  }, [clearDismissTimeout]);

  /**
   * Pause auto-dismiss (e.g., on hover)
   */
  const pauseNotification = useCallback(() => {
    isPausedRef.current = true;
    clearDismissTimeout();

    setConflictNotification((prev) =>
      prev ? { ...prev, isPaused: true } : null,
    );
  }, [clearDismissTimeout]);

  /**
   * Resume auto-dismiss
   */
  const resumeNotification = useCallback(() => {
    isPausedRef.current = false;
    scheduleDismiss();

    setConflictNotification((prev) =>
      prev ? { ...prev, isPaused: false } : null,
    );
  }, [scheduleDismiss]);

  return {
    broadcastUpdate,
    broadcastSave,
    broadcastRollback,
    conflictNotification,
    dismissNotification,
    pauseNotification,
    resumeNotification,
    isPrimaryTab,
  };
}

export default useMultiTabSync;
