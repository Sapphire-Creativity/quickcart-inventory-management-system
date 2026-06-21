
export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/** Factory: create a named icon component from one or more SVG path strings */
function createIcon(paths: string[], displayName: string) {
  const Icon = ({ size = 16, className = "", strokeWidth = 2 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

// ── Layout / Navigation ────────────────────────────────────────────────────────
export const LayoutDashboard = createIcon(
  ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  "LayoutDashboard"
);

export const ChevronLeft  = createIcon(["M15 18l-6-6 6-6"], "ChevronLeft");
export const ChevronRight = createIcon(["M9 18l6-6-6-6"], "ChevronRight");
export const ChevronDown  = createIcon(["M6 9l6 6 6-6"], "ChevronDown");

// ── E-Commerce ─────────────────────────────────────────────────────────────────
export const ShoppingCart = createIcon(
  ["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  "ShoppingCart"
);

export const Tag = createIcon(
  ["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z", "M7 7h.01"],
  "Tag"
);

export const CreditCard = createIcon(
  ["M1 4h22v16H1z", "M1 10h22"],
  "CreditCard"
);

export const Bookmark = createIcon(
  ["M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"],
  "Bookmark"
);

// ── Users ──────────────────────────────────────────────────────────────────────
export const Users = createIcon(
  [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  "Users"
);

// ── Grid / Layout ──────────────────────────────────────────────────────────────
export const Grid3X3 = createIcon(
  ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"],
  "Grid3X3"
);

// ── Media / Product ────────────────────────────────────────────────────────────
export const PlusCircle = createIcon(
  [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 8v8",
    "M8 12h8",
  ],
  "PlusCircle"
);

export const ImageIcon = createIcon(
  [
    "M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z",
    "M8.56 14.44a4 4 0 1 0 6.88 0",
  ],
  "ImageIcon"
);

export const List = createIcon(
  ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
  "List"
);

export const Star = createIcon(
  ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  "Star"
);

// ── Admin ──────────────────────────────────────────────────────────────────────
export const ShieldCheck = createIcon(
  ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-4"],
  "ShieldCheck"
);

export const Settings2 = createIcon(
  [
    "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
    "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  ],
  "Settings2"
);

// ── UI Controls ───────────────────────────────────────────────────────────────
export const Search = createIcon(
  ["M21 21l-4.35-4.35", "M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"],
  "Search"
);

export const Bell = createIcon(
  [
    "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
    "M13.73 21a2 2 0 0 1-3.46 0",
  ],
  "Bell"
);

export const Sun = createIcon(
  [
    "M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10z",
    "M12 1v2", "M12 21v2",
    "M4.22 4.22l1.42 1.42", "M18.36 18.36l1.42 1.42",
    "M1 12h2",  "M21 12h2",
    "M4.22 19.78l1.42-1.42", "M18.36 5.64l1.42-1.42",
  ],
  "Sun"
);

export const Moon = createIcon(
  ["M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"],
  "Moon"
);

export const MoreVertical = createIcon(
  [
    "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    "M12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    "M12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  ],
  "MoreVertical"
);

export const Filter = createIcon(
  ["M22 3H2l8 9.46V19l4 2v-8.54L22 3z"],
  "Filter"
);

export const ExternalLink = createIcon(
  [
    "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
    "M15 3h6v6",
    "M10 14 21 3",
  ],
  "ExternalLink"
);

export const LogOut = createIcon(
  [
    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
    "M16 17l5-5-5-5",
    "M21 12H9",
  ],
  "LogOut"
);

// ── Trend Indicators ───────────────────────────────────────────────────────────
export const TrendingUp = createIcon(
  ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  "TrendingUp"
);

export const TrendingDown = createIcon(
  ["M23 18l-9.5-9.5-5 5L1 6", "M17 18h6v-6"],
  "TrendingDown"
);

export const ArrowUpRight = createIcon(
  ["M7 17L17 7", "M7 7h10v10"],
  "ArrowUpRight"
);

export const ArrowDownRight = createIcon(
  ["M7 7l10 10", "M17 7v10H7"],
  "ArrowDownRight"
);

// ── Misc ───────────────────────────────────────────────────────────────────────
export const Package = createIcon(
  [
    "M16.5 9.4l-9-5.19",
    "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
    "M3.27 6.96 12 12.01l8.73-5.05",
    "M12 22.08V12",
  ],
  "Package"
);

export const X = createIcon(["M18 6L6 18", "M6 6l12 12"], "X");

export const Check = createIcon(["M20 6L9 17l-5-5"], "Check");
