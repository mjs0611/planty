"use client";
import { useEffect, useRef } from "react";

/** Keep keyboard navigation inside a custom dialog and return to its trigger. */
export function useDialogFocus<T extends HTMLElement = HTMLDivElement>(open: boolean, onClose: () => void) {
  const dialogRef = useRef<T>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button, input, a[href], [tabindex="0"]',
    )).filter(control => !control.matches(':disabled') && control.tabIndex >= 0 && !control.closest('[hidden], [inert]'));
    (dialog.querySelector<HTMLElement>('[data-dialog-autofocus]') ?? focusable()[0] ?? dialog).focus();
    const onKey = (event: KeyboardEvent) => {
      const openDialogs = document.querySelectorAll('[aria-modal="true"]');
      if (openDialogs[openDialogs.length - 1] !== dialog) return;
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const controls = focusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (!dialog.contains(document.activeElement) || document.activeElement === dialog) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  return dialogRef;
}
