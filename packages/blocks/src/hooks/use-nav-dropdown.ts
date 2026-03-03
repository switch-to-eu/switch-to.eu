"use client";

import { useRef, useState, useEffect, useCallback } from "react";

function getHeaderPosition() {
  const header = document.querySelector("header");
  const container = header?.querySelector(".container");
  if (!header || !container) return null;
  const headerRect = header.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    top: headerRect.bottom,
    containerLeft: containerRect.left,
    containerWidth: containerRect.width,
  };
}

export type HeaderPosition = NonNullable<ReturnType<typeof getHeaderPosition>>;

export function useNavDropdown() {
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [headerPos, setHeaderPos] = useState<HeaderPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const open = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHeaderPos(getHeaderPosition());
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => setHeaderPos(getHeaderPosition());
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  return {
    isOpen,
    headerPos,
    mounted,
    open,
    close,
    toggle,
    scheduleClose,
    cancelClose,
  };
}
