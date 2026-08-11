export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#121820" />
      <path
        d="M6 22 C10 22, 12 10, 16 10 C20 10, 22 22, 26 22"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="6" cy="22" r="2.5" fill="#38bdf8" />
      <circle cx="16" cy="10" r="2.5" fill="#a78bfa" />
      <circle cx="26" cy="22" r="2.5" fill="#38bdf8" />
    </svg>
  );
}
