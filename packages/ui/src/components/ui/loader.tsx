import type { CSSProperties } from 'react'

export type LoaderProps = {
  size?: number
  label?: string
}

export function Loader({ size = 16, label = 'Cargando' }: LoaderProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      style={
        {
          '--on': 'var(--color-primary)',
          '--off': '#404040',
          '--dur': '1.200s',
        } as CSSProperties
      }
    >
      <title>{label}</title>
      <style>{`
        circle { fill: var(--off); }
        circle.on { fill: var(--on); }
        @media (prefers-reduced-motion: reduce) { circle { animation: none !important; } }
        @keyframes fs11100001 { 0% { opacity: 1; } 37.49% { opacity: 1; } 37.50% { opacity: 0; } 87.49% { opacity: 0; } 87.50% { opacity: 1; } 100% { opacity: 1; } }
        @keyframes fs11110000 { 0% { opacity: 1; } 49.99% { opacity: 1; } 50.00% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes fs01111000 { 0% { opacity: 0; } 12.49% { opacity: 0; } 12.50% { opacity: 1; } 62.49% { opacity: 1; } 62.50% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes fs11000011 { 0% { opacity: 1; } 24.99% { opacity: 1; } 25.00% { opacity: 0; } 74.99% { opacity: 0; } 75.00% { opacity: 1; } 100% { opacity: 1; } }
        @keyframes fs00111100 { 0% { opacity: 0; } 24.99% { opacity: 0; } 25.00% { opacity: 1; } 74.99% { opacity: 1; } 75.00% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes fs10000111 { 0% { opacity: 1; } 12.49% { opacity: 1; } 12.50% { opacity: 0; } 62.49% { opacity: 0; } 62.50% { opacity: 1; } 100% { opacity: 1; } }
        @keyframes fs00001111 { 0% { opacity: 0; } 49.99% { opacity: 0; } 50.00% { opacity: 1; } 100% { opacity: 1; } }
        @keyframes fs00011110 { 0% { opacity: 0; } 37.49% { opacity: 0; } 37.50% { opacity: 1; } 87.49% { opacity: 1; } 87.50% { opacity: 0; } 100% { opacity: 0; } }
      `}</style>
      <circle cx="3" cy="3" r="2" />
      <circle cx="9" cy="3" r="2" />
      <circle cx="15" cy="3" r="2" />
      <circle cx="21" cy="3" r="2" />
      <circle cx="27" cy="3" r="2" />
      <circle cx="3" cy="9" r="2" />
      <circle cx="9" cy="9" r="2" />
      <circle
        className="on"
        cx="9"
        cy="9"
        r="2"
        opacity={1}
        style={{ animation: 'fs11100001 var(--dur) linear infinite' }}
      />
      <circle cx="15" cy="9" r="2" />
      <circle
        className="on"
        cx="15"
        cy="9"
        r="2"
        opacity={1}
        style={{ animation: 'fs11110000 var(--dur) linear infinite' }}
      />
      <circle cx="21" cy="9" r="2" />
      <circle
        className="on"
        cx="21"
        cy="9"
        r="2"
        opacity={0}
        style={{ animation: 'fs01111000 var(--dur) linear infinite' }}
      />
      <circle cx="27" cy="9" r="2" />
      <circle cx="3" cy="15" r="2" />
      <circle cx="9" cy="15" r="2" />
      <circle
        className="on"
        cx="9"
        cy="15"
        r="2"
        opacity={1}
        style={{ animation: 'fs11000011 var(--dur) linear infinite' }}
      />
      <circle cx="15" cy="15" r="2" />
      <circle cx="21" cy="15" r="2" />
      <circle
        className="on"
        cx="21"
        cy="15"
        r="2"
        opacity={0}
        style={{ animation: 'fs00111100 var(--dur) linear infinite' }}
      />
      <circle cx="27" cy="15" r="2" />
      <circle cx="3" cy="21" r="2" />
      <circle cx="9" cy="21" r="2" />
      <circle
        className="on"
        cx="9"
        cy="21"
        r="2"
        opacity={1}
        style={{ animation: 'fs10000111 var(--dur) linear infinite' }}
      />
      <circle cx="15" cy="21" r="2" />
      <circle
        className="on"
        cx="15"
        cy="21"
        r="2"
        opacity={0}
        style={{ animation: 'fs00001111 var(--dur) linear infinite' }}
      />
      <circle cx="21" cy="21" r="2" />
      <circle
        className="on"
        cx="21"
        cy="21"
        r="2"
        opacity={0}
        style={{ animation: 'fs00011110 var(--dur) linear infinite' }}
      />
      <circle cx="27" cy="21" r="2" />
      <circle cx="3" cy="27" r="2" />
      <circle cx="9" cy="27" r="2" />
      <circle cx="15" cy="27" r="2" />
      <circle cx="21" cy="27" r="2" />
      <circle cx="27" cy="27" r="2" />
    </svg>
  )
}
