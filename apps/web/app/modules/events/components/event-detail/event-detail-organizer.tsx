import { useTranslation } from 'react-i18next'
import type { PublicEventOrganizer } from '@repo/types'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui'
import { getUserInitials } from '~/modules/common/utils/user-initials.utils'

type EventDetailOrganizerProps = {
  organizer: PublicEventOrganizer
}

export function EventDetailOrganizer({ organizer }: EventDetailOrganizerProps) {
  const { t } = useTranslation('events')
  const initials = getUserInitials(organizer.firstName, organizer.lastName)

  return (
    <RouterLink
      to="/organizations/$slug"
      params={{ slug: organizer.slug }}
      className="mt-2.5 flex w-fit items-center gap-2.5 rounded-app-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={t('discover.detail.organizedByAriaLabel')}
    >
      <Avatar className="size-14 shrink-0">
        {organizer.avatar ? <AvatarImage src={organizer.avatar} alt="" /> : null}
        <AvatarFallback className="bg-surface-container text-xs font-medium text-on-surface">
          {initials}
        </AvatarFallback>
      </Avatar>
      <p className="min-w-0 font-label text-sm text-pretty text-on-surface-variant mb-4">
        {t('discover.detail.organizedBy', { name: organizer.name })}
      </p>
    </RouterLink>
  )
}
import { Link as RouterLink } from '@tanstack/react-router'
