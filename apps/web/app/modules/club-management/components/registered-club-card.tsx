import { Badge, Button, cn, NotImage, Tooltip, TooltipContent, TooltipTrigger } from '@afterdark/ui'
import { MapPin, Pencil, Trash2 } from 'lucide-react'

export const CLUB_DISPLAY_STATUS = {
  LIVE: 'live',
  INACTIVE: 'inactive',
} as const

export type ClubDisplayStatus = (typeof CLUB_DISPLAY_STATUS)[keyof typeof CLUB_DISPLAY_STATUS]

export type RegisteredClub = {
  id: string
  name: string
  address: string
  tags: string[]
  status: ClubDisplayStatus
  imageUrl?: string
  capacity?: string
  description?: string
  state?: string
  street_number?: string
  city?: string
}

function ClubStatusBadge({ status }: { status: ClubDisplayStatus }) {
  const statusBadgeClassName = 'px-2.5 py-1'

  if (status === CLUB_DISPLAY_STATUS.LIVE) {
    return (
      <Badge
        variant="outline"
        size="sm"
        className={cn(statusBadgeClassName, 'gap-2')}
        icon={<span className="size-1.5 rounded-full bg-green-400" aria-hidden="true" />}
      >
        Live now
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn(statusBadgeClassName, 'gap-2 border-error/50 bg-error-container/30 text-error')}
      icon={<span className="size-1.5 rounded-full bg-error" aria-hidden="true" />}
    >
      Inactive
    </Badge>
  )
}

export function RegisteredClubCard({
  club,
  onEdit,
  onDelete,
}: {
  club: RegisteredClub
  onEdit?: (club: RegisteredClub) => void
  onDelete?: (club: RegisteredClub) => void
}) {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-hairline bg-surface-card p-3 sm:p-4">
      {club.imageUrl ? (
        <img
          src={club.imageUrl}
          alt={club.name}
          width={80}
          height={80}
          className="size-16 shrink-0 rounded-lg object-cover sm:size-20"
        />
      ) : (
        <NotImage
          size="sm"
          className="sm:size-20 sm:[&_svg]:size-8"
          label={`Sin imagen de ${club.name}`}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate font-heading text-sm font-bold uppercase tracking-wide text-ink sm:text-base">
            {club.name}
          </h3>
          <ClubStatusBadge status={club.status} />
        </div>

        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{club.address}</span>
        </p>

        <div className="flex flex-wrap gap-1.5">
          {club.tags.map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-ink-muted hover:text-ink"
              aria-label={`Editar ${club.name}`}
              onClick={() => onEdit?.(club)}
            >
              <Pencil aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar club</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-ink-muted hover:text-error"
              aria-label={`Eliminar ${club.name}`}
              onClick={() => onDelete?.(club)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Eliminar club</TooltipContent>
        </Tooltip>
      </div>
    </li>
  )
}
