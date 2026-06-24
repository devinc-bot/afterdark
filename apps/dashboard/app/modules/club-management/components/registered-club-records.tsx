import { CLUB_STATUS, type ClubStatus } from '@afterdark/types'
import {
  Badge,
  Button,
  Card,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NotImage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@afterdark/ui'
import { EllipsisVertical, MapPin, Pencil, Trash2, Users } from 'lucide-react'

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

const clubActionIconClassName = '!size-[20px] shrink-0'
const clubActionItemClassName = 'gap-3 py-2.5 text-base'

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

function ClubIdentityCell({ club }: { club: RegisteredClub }) {
  return (
    <div className="flex items-center gap-3">
      {club.imageUrl ? (
        <img
          src={club.imageUrl}
          alt={club.name}
          width={80}
          height={80}
          className="size-9 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <NotImage
          size="sm"
          className="size-9 shrink-0 [&_svg]:size-4"
          label={`Sin imagen de ${club.name}`}
        />
      )}
      <p className="min-w-0 truncate font-medium text-ink">{club.name}</p>
    </div>
  )
}

function ClubAddressCell({ address }: { address: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm text-ink-muted">
      <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="truncate">{address}</span>
    </div>
  )
}

function ClubCapacityCell({ capacity }: { capacity?: string }) {
  if (!capacity) {
    return <span className="text-sm text-ink-muted">—</span>
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
      <Users aria-hidden="true" className="size-3.5 shrink-0" />
      {capacity}
    </span>
  )
}

function ClubTagsCell({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return <span className="text-sm text-ink-muted">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" size="sm">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

function ClubRecordActions({
  club,
  onEdit,
  onDelete,
}: {
  club: RegisteredClub
  onEdit?: (club: RegisteredClub) => void
  onDelete?: (club: RegisteredClub) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-ink-muted hover:text-ink"
          aria-label={`Acciones para ${club.name}`}
        >
          <EllipsisVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 p-1.5">
        <DropdownMenuItem className={clubActionItemClassName} onClick={() => onEdit?.(club)}>
          <Pencil aria-hidden="true" className={clubActionIconClassName} />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(clubActionItemClassName, 'text-error focus:text-error')}
          onClick={() => onDelete?.(club)}
        >
          <Trash2 aria-hidden="true" className={cn(clubActionIconClassName, 'text-error')} />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ClubRecordRow({
  club,
  onEdit,
  onDelete,
}: {
  club: RegisteredClub
  onEdit?: (club: RegisteredClub) => void
  onDelete?: (club: RegisteredClub) => void
}) {
  return (
    <TableRow className="border-0">
      <TableCell className="p-6">
        <ClubIdentityCell club={club} />
      </TableCell>
      <TableCell className="p-6">
        <ClubAddressCell address={club.address} />
      </TableCell>
      <TableCell className="p-6">
        <ClubCapacityCell capacity={club.capacity} />
      </TableCell>
      <TableCell className="p-6">
        <ClubTagsCell tags={club.tags} />
      </TableCell>
      <TableCell className="p-6">
        <ClubStatusBadge status={club.status} />
      </TableCell>
      <TableCell className="p-6 text-right">
        <ClubRecordActions club={club} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}

export function RegisteredClubRecords({
  clubs,
  onEdit,
  onDelete,
}: {
  clubs: RegisteredClub[]
  onEdit?: (club: RegisteredClub) => void
  onDelete?: (club: RegisteredClub) => void
}) {
  return (
    <Card variant="gradient">
      <Table variant="compact">
        <TableHeader>
          <TableRow>
            <TableHead className="p-6">Club</TableHead>
            <TableHead className="p-6">Dirección</TableHead>
            <TableHead className="p-6">Capacidad</TableHead>
            <TableHead className="p-6">Etiquetas</TableHead>
            <TableHead className="p-6">Estado</TableHead>
            <TableHead className="p-6 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clubs.map((club) => (
            <ClubRecordRow key={club.id} club={club} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
