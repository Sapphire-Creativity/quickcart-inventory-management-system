"use client";

import { useState, useCallback } from "react";

interface UseSidebarReturn {
  collapsed: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

export function useSidebar(defaultCollapsed = false): UseSidebarReturn {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggle   = useCallback(() => setCollapsed((c) => !c), []);
  const expand   = useCallback(() => setCollapsed(false), []);
  const collapse = useCallback(() => setCollapsed(true), []);

  return { collapsed, toggle, expand, collapse };
}
