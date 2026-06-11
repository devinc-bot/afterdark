import { useEffect, useRef, type ReactNode } from 'react'

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  const nebulaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const nebula = nebulaRef.current
    if (!nebula) return

    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth
      const y = event.clientY / window.innerHeight
      nebula.style.transform = `translate(${x * 20}px, ${y * 20}px) scale(1.05)`
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden bg-background text-on-surface">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div ref={nebulaRef} className="nebula-bg absolute inset-0 motion-reduce:animate-none" />
      </div>

      <main className="relative z-10 w-full max-w-[480px] px-6">
        <div className="mb-10 flex flex-col items-center">
          <div
            aria-hidden
            className="mb-4 flex size-24 items-center justify-center rounded-full border border-primary/30 bg-surface-container shadow-primary-glow md:size-32"
          >
            <span className="font-display text-3xl font-bold text-primary md:text-4xl">AD</span>
          </div>
          <h1 className="neon-glow-text font-display text-4xl font-extrabold tracking-tighter text-primary">
            AFTERDARK
          </h1>
          <p className="mt-2 font-label text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            Accedé al ecosistema nocturno
          </p>
        </div>

        {children}

        <p className="mt-10 text-center font-sans text-sm text-on-surface-variant opacity-50">
          Professional Management Suite v2.4.0
          <br />
          Protegido por AFTERDARK Secure Perimeter
        </p>
      </main>
    </div>
  )
}
