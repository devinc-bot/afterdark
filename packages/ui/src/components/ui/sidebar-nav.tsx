import * as React from 'react'
import { Menu, X } from 'lucide-react'
import { getSidebarNavItemStateClassName } from '../../lib/sidebar-nav.ts'
import { cn } from '../../lib/utils'
import { Button } from './button'

export type SidebarNavLogo =
  | string
  | {
      src: string
      alt: string
    }

export type SidebarNavItem = {
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  isActive?: boolean
  disabled?: boolean
  title?: string
}

export type SidebarNavLinkRenderProps = {
  item: SidebarNavItem
  isActive: boolean
  className: string
  children: React.ReactNode
  onNavigate?: () => void
}

export type SidebarNavProps = {
  logo: SidebarNavLogo
  title?: string
  primary: SidebarNavItem[]
  secondary?: SidebarNavItem[]
  footer?: React.ReactNode
  activeHref?: string
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  renderLink?: (props: SidebarNavLinkRenderProps) => React.ReactNode
}

const navItemClassName =
  'group flex h-full min-h-11 flex-1 items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 motion-reduce:transition-none'

export function matchesSidebarNavHref(itemHref: string, activeHref: string): boolean {
  if (itemHref === activeHref) return true
  return activeHref.startsWith(`${itemHref}/`)
}

function isSidebarNavItemActive(item: SidebarNavItem, activeHref: string | undefined): boolean {
  if (item.isActive !== undefined) return item.isActive
  if (!activeHref || !item.href) return false
  return matchesSidebarNavHref(item.href, activeHref)
}

function SidebarNavBrand({ logo }: { logo: SidebarNavLogo }) {
  if (typeof logo === 'string') {
    return (
      <span className="font-heading text-base font-semibold tracking-[0.04em] text-ink">
        {logo}
      </span>
    )
  }

  return (
    <img
      src={logo.src}
      alt={logo.alt}
      className="h-8 w-auto max-w-full object-contain object-left"
    />
  )
}

function SidebarNavItemLink({
  item,
  isActive,
  renderLink,
  onNavigate,
}: {
  item: SidebarNavItem
  isActive: boolean
  renderLink?: SidebarNavProps['renderLink']
  onNavigate?: () => void
}) {
  const className = cn(
    navItemClassName,
    getSidebarNavItemStateClassName({ disabled: item.disabled, isActive })
  )

  const content = (
    <>
      <span className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-5">
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
    </>
  )

  if (item.disabled) {
    return (
      <span className={className} aria-disabled="true" title={item.title ?? item.label}>
        {content}
      </span>
    )
  }

  if (renderLink && item.href) {
    return (
      <>
        {renderLink({
          item,
          isActive,
          className,
          children: content,
          onNavigate,
        })}
      </>
    )
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={() => {
          onNavigate?.()
          item.onClick?.()
        }}
        className={className}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </button>
    )
  }

  return (
    <a
      href={item.href ?? '#'}
      className={className}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
    >
      {content}
    </a>
  )
}

function SidebarNavList({
  items,
  activeHref,
  ariaLabel,
  renderLink,
  onNavigate,
}: {
  items: SidebarNavItem[]
  activeHref?: string
  ariaLabel: string
  renderLink?: SidebarNavProps['renderLink']
  onNavigate?: () => void
}) {
  if (items.length === 0) return null

  return (
    <ul className="flex flex-col" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = isSidebarNavItemActive(item, activeHref)

        return (
          <li key={`${item.label}-${item.href ?? 'action'}`} className="flex">
            <SidebarNavItemLink
              item={item}
              isActive={isActive}
              renderLink={renderLink}
              onNavigate={onNavigate}
            />
          </li>
        )
      })}
    </ul>
  )
}

function SidebarNavPanel({
  logo,
  title,
  primary,
  secondary,
  footer,
  activeHref,
  renderLink,
  onNavigate,
  onClose,
  showCloseButton,
}: {
  logo: SidebarNavLogo
  title?: string
  primary: SidebarNavItem[]
  secondary: SidebarNavItem[]
  footer?: React.ReactNode
  activeHref?: string
  renderLink?: SidebarNavProps['renderLink']
  onNavigate?: () => void
  onClose?: () => void
  showCloseButton?: boolean
}) {
  return (
    <>
      <div className="relative px-5 pt-5 pb-4">
        {showCloseButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-4 right-3 text-ink-muted hover:text-ink lg:hidden"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
        <SidebarNavBrand logo={logo} />
        {title ? <p className="mt-1.5 text-sm text-ink-muted">{title}</p> : null}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col">
        <SidebarNavList
          items={primary}
          activeHref={activeHref}
          ariaLabel="Navegación principal"
          renderLink={renderLink}
          onNavigate={onNavigate}
        />

        {footer || secondary.length > 0 ? (
          <div className="mt-auto space-y-4 px-3 pt-6 pb-5">
            {footer}
            {secondary.length > 0 ? (
              <SidebarNavList
                items={secondary}
                activeHref={activeHref}
                ariaLabel="Navegación secundaria"
                renderLink={renderLink}
                onNavigate={onNavigate}
              />
            ) : null}
          </div>
        ) : null}
      </nav>
    </>
  )
}

function SidebarNav({
  logo,
  title,
  primary,
  secondary = [],
  footer,
  activeHref,
  className,
  open: openProp,
  onOpenChange,
  renderLink,
}: SidebarNavProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const closeMobile = React.useCallback(() => {
    setOpen(false)
  }, [setOpen])

  React.useEffect(() => {
    if (!open || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }

    if (!mediaQuery.matches) {
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      mediaQuery.addEventListener('change', handleViewportChange)

      return () => {
        document.body.style.overflow = previousOverflow
        mediaQuery.removeEventListener('change', handleViewportChange)
      }
    }

    mediaQuery.addEventListener('change', handleViewportChange)
    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [open, setOpen])

  React.useEffect(() => {
    if (!open || typeof window === 'undefined') return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, setOpen])

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          className="fixed inset-0 z-40 bg-surface-strong/70 lg:hidden motion-reduce:transition-none"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        id="sidebar-navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-hairline bg-surface-container-lowest transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:duration-0',
          'lg:static lg:z-auto lg:max-w-none lg:min-h-screen lg:shrink-0 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <SidebarNavPanel
          logo={logo}
          title={title}
          primary={primary}
          secondary={secondary}
          footer={footer}
          activeHref={activeHref}
          renderLink={renderLink}
          onNavigate={closeMobile}
          onClose={closeMobile}
          showCloseButton
        />
      </aside>
    </>
  )
}

type SidebarNavMenuButtonProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

function SidebarNavMenuButton({ open, onOpenChange, className }: SidebarNavMenuButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('shrink-0 lg:hidden', className)}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={open}
      aria-controls="sidebar-navigation"
      onClick={() => onOpenChange(!open)}
    >
      <Menu aria-hidden="true" />
    </Button>
  )
}

export { SidebarNav, SidebarNavMenuButton }
