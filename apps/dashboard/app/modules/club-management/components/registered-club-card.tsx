import { CLUB_STATUS, type ClubStatus } from '@afterdark/types'
import {
  Badge,
  Button,
  Card,
  cn,
  NotImage,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@afterdark/ui'
import { MapPin, Pencil, Trash2, Users } from 'lucide-react'

export type RegisteredClub = {
  id: string
  name: string
  address: string
  tags: string[]
  status: ClubStatus
  imageUrl?: string
  capacity?: string
  description?: string
  state?: string
  street_number?: string
  city?: string
}

function ClubStatusBadge({ status }: { status: ClubStatus }) {
  const statusBadgeClassName = 'px-2.5 py-1'

  if (status === CLUB_STATUS.ACTIVE) {
    return (
      <Badge
        variant="outline"
        size="sm"
        className={cn(statusBadgeClassName, 'gap-2 w-fit')}
        icon={<span className="size-1.5 rounded-full bg-green-400" aria-hidden="true" />}
      >
        Activo
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn(
        statusBadgeClassName,
        'gap-2 [--gradient-border-fill:color-mix(in_oklab,var(--color-error-container)_30%,transparent)] text-error w-fit'
      )}
      icon={<span className="size-1.5 rounded-full bg-error" aria-hidden="true" />}
    >
      Inactivo
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
    <Card as="li" variant="gradient" className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <h3 className="min-w-0 truncate font-heading text-sm font-bold uppercase tracking-wide text-ink sm:text-base">
                {club.name}
              </h3>
              <ClubStatusBadge status={club.status} />
            </div>

            <p className="flex items-center gap-1.5 text-sm text-ink-muted">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{club.address}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {club.capacity ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <Users aria-hidden="true" className="size-3.5 shrink-0" />
                  Capacidad {club.capacity}
                </span>
              ) : null}
              {club.tags.map((tag) => (
                <Badge key={tag} variant="outline" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1 border-t border-hairline pt-3 sm:flex-col sm:border-t-0 sm:pt-0">
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
      </div>
    </Card>
  )
}
