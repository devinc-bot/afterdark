type SidebarNavItemStateClassNameInput = {
  disabled?: boolean
  isActive: boolean
}

export function getSidebarNavItemStateClassName({
  disabled,
  isActive,
}: SidebarNavItemStateClassNameInput): string {
  if (disabled) {
    return 'cursor-not-allowed text-ink-muted opacity-50'
  }

  if (isActive) {
    return 'bg-surface-container text-ink'
  }

  return 'text-ink-muted hover:bg-surface-container/70 hover:text-ink'
}
