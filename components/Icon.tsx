const PATHS: Record<string, string> = {
  layers: 'M12 3 3 8l9 5 9-5-9-5ZM3 12.5l9 5 9-5M3 16.5l9 5 9-5',
  store: 'M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3ZM8.5 12l2.5 2.5 4.5-5',
  key: 'M14 10a4 4 0 1 0-3.9 4H12l1 2h2l1 2h3v-3l-5.2-5.2A4 4 0 0 0 14 10Z',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  check: 'M4 12.5l5 5L20 6.5',
  phone:
    'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  chevron: 'M6 9l6 6 6-6',
  alert:
    'M12 8v5M12 16.5v.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name] ?? PATHS.check} />
    </svg>
  );
}
