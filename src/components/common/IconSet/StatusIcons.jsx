const stroke = 'currentColor'

export function CartIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20.5 8H6"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.6" fill={stroke} />
      <circle cx="17" cy="20" r="1.6" fill={stroke} />
    </svg>
  )
}

export function EmptyBoxIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M3 8.5V17l9 4.5 9-4.5V8.5" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 13v8.5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function HalfBoxIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M3 8.5V17l9 4.5 9-4.5V8.5" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 13v8.5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.3 9.2 12 13l8.7-3.8V17L12 20.8V13" fill={stroke} opacity="0.35" stroke="none" />
    </svg>
  )
}

export function HouseHeartIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 11.5 12 4l8 7.5"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19.2s-3.2-1.9-3.2-4.1a1.9 1.9 0 0 1 3.2-1.4 1.9 1.9 0 0 1 3.2 1.4c0 2.2-3.2 4.1-3.2 4.1Z"
        fill={stroke}
      />
    </svg>
  )
}
