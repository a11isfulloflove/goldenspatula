export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l8.5 3.2v6.1c0 5.3-3.6 9.1-8.5 10.7-4.9-1.6-8.5-5.4-8.5-10.7V5.2L12 2z" />
    </svg>
  )
}

export function CrossIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.4 2h5.2v7.4H22v5.2h-7.4V22H9.4v-7.4H2V9.4h7.4V2z" />
    </svg>
  )
}

export function SwordsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.5 19.5L20 4" />
      <path d="M19.5 19.5L4 4" />
      <path d="M4 16l4 4" />
      <path d="M16 20l4-4" />
    </svg>
  )
}
