"use client";

import { useEffect, useRef } from "react";

interface ScreenReaderAnnouncerProps {
  /** Message for polite announcements (screen reader waits for pause) */
  politeMessage?: string;
  /** Message for assertive announcements (interrupts immediately) */
  assertiveMessage?: string;
}

/**
 * Component for screen reader announcements.
 * Uses aria-live regions for accessibility.
 * (FR-044a)
 */
export function ScreenReaderAnnouncer({
  politeMessage,
  assertiveMessage,
}: ScreenReaderAnnouncerProps) {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  // Update polite announcement
  useEffect(() => {
    if (politeMessage && politeRef.current) {
      // Clear then set to ensure re-announcement of same message
      politeRef.current.textContent = "";
      // Use setTimeout to ensure screen readers pick up the change
      const timeout = setTimeout(() => {
        if (politeRef.current) {
          politeRef.current.textContent = politeMessage;
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [politeMessage]);

  // Update assertive announcement
  useEffect(() => {
    if (assertiveMessage && assertiveRef.current) {
      // Clear then set to ensure re-announcement of same message
      assertiveRef.current.textContent = "";
      // Use setTimeout to ensure screen readers pick up the change
      const timeout = setTimeout(() => {
        if (assertiveRef.current) {
          assertiveRef.current.textContent = assertiveMessage;
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [assertiveMessage]);

  return (
    <>
      {/* Polite announcement region - waits for user pause */}
      <div
        ref={politeRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      />

      {/* Assertive announcement region - interrupts immediately */}
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      />
    </>
  );
}

/**
 * Hook for managing screen reader announcements.
 * Returns functions to announce messages politely or assertively.
 */
export function useScreenReader() {
  const politeRef = useRef<HTMLDivElement | null>(null);
  const assertiveRef = useRef<HTMLDivElement | null>(null);

  // Announce politely (waits for pause)
  const announcePolite = (message: string) => {
    if (politeRef.current) {
      politeRef.current.textContent = "";
      setTimeout(() => {
        if (politeRef.current) {
          politeRef.current.textContent = message;
        }
      }, 100);
    }
  };

  // Announce assertively (interrupts)
  const announceAssertive = (message: string) => {
    if (assertiveRef.current) {
      assertiveRef.current.textContent = "";
      setTimeout(() => {
        if (assertiveRef.current) {
          assertiveRef.current.textContent = message;
        }
      }, 100);
    }
  };

  return {
    announcePolite,
    announceAssertive,
    politeRef,
    assertiveRef,
  };
}
