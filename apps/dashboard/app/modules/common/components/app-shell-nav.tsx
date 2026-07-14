import { cn } from '@afterdark/ui'
import type { ReactNode } from 'react'

/** Nav affordance: color + icon feedback; active rail via transform (not border-left). */
export const navMenuButtonClassName = cn(
  'relative gap-3 rounded-none',
  'transition-colors duration-(--duration-fast) ease-(--ease-emphasized)',
  'before:pointer-events-none before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-center before:scale-y-0 before:rounded-full before:bg-primary before:content-[""]',
  'before:transition-transform before:duration-(--duration-fast) before:ease-[cubic-bezier(0.22,1,0.36,1)]',
  'data-[active=true]:before:scale-y-100',
  'motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:data-[active=true]:before:scale-y-100'
)

export function AppShellNavIcon({ icon }: { icon: ReactNode }) {
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center [&_svg]:size-7',
        '[&_svg]:transition-transform [&_svg]:duration-(--duration-instant) [&_svg]:ease-emphasized',
        'group-hover/menu-item:[&_svg]:scale-105 group-active/menu-item:[&_svg]:scale-95',
        'motion-reduce:[&_svg]:transition-none motion-reduce:group-hover/menu-item:[&_svg]:scale-100 motion-reduce:group-active/menu-item:[&_svg]:scale-100'
      )}
    >
      {icon}
    </span>
  )
}
