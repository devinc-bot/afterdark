import type { LocationImageResponse } from '@afterdark/types'
import {
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

export type RegisteredLocation = {
  id: string
  name: string
  address: string
  images: LocationImageResponse[]
  imageUrl?: string
  capacity?: string
  description?: string
  state?: string
  street_number?: string
  city?: string
  latitude?: number | null
  longitude?: number | null
}

const locationActionIconClassName = '!size-[20px] shrink-0'
const locationActionItemClassName = 'gap-3 py-2.5 text-base'

function LocationIdentityCell({ location }: { location: RegisteredLocation }) {
  return (
    <div className="flex items-center gap-3">
      {location.imageUrl ? (
        <img
          src={location.imageUrl}
          alt={location.name}
          width={80}
          height={80}
          className="size-9 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <NotImage
          size="sm"
          className="size-9 shrink-0 [&_svg]:size-4"
          label={`Sin imagen de ${location.name}`}
        />
      )}
      <p className="min-w-0 truncate font-medium text-ink">{location.name}</p>
    </div>
  )
}

function LocationAddressCell({ address }: { address: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm text-ink-muted">
      <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="truncate">{address}</span>
    </div>
  )
}

function LocationCapacityCell({ capacity }: { capacity?: string }) {
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

function LocationRecordActions({
  location,
  onEdit,
  onDelete,
}: {
  location: RegisteredLocation
  onEdit?: (location: RegisteredLocation) => void
  onDelete?: (location: RegisteredLocation) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-ink-muted hover:text-ink"
          aria-label={`Acciones para ${location.name}`}
        >
          <EllipsisVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 p-1.5">
        <DropdownMenuItem
          className={locationActionItemClassName}
          onClick={() => onEdit?.(location)}
        >
          <Pencil aria-hidden="true" className={locationActionIconClassName} />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(locationActionItemClassName, 'text-error focus:text-error')}
          onClick={() => onDelete?.(location)}
        >
          <Trash2 aria-hidden="true" className={cn(locationActionIconClassName, 'text-error')} />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LocationRecordRow({
  location,
  onEdit,
  onDelete,
}: {
  location: RegisteredLocation
  onEdit?: (location: RegisteredLocation) => void
  onDelete?: (location: RegisteredLocation) => void
}) {
  return (
    <TableRow className="border-0">
      <TableCell className="p-6">
        <LocationIdentityCell location={location} />
      </TableCell>
      <TableCell className="p-6">
        <LocationAddressCell address={location.address} />
      </TableCell>
      <TableCell className="p-6">
        <LocationCapacityCell capacity={location.capacity} />
      </TableCell>
      <TableCell className="p-6 text-right">
        <LocationRecordActions location={location} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}

export function RegisteredLocationRecords({
  locations,
  onEdit,
  onDelete,
}: {
  locations: RegisteredLocation[]
  onEdit?: (location: RegisteredLocation) => void
  onDelete?: (location: RegisteredLocation) => void
}) {
  return (
    <Card variant="gradient">
      <Table variant="compact">
        <TableHeader>
          <TableRow>
            <TableHead className="p-6">Ubicación</TableHead>
            <TableHead className="p-6">Dirección</TableHead>
            <TableHead className="p-6">Capacidad</TableHead>
            <TableHead className="p-6 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <LocationRecordRow
              key={location.id}
              location={location}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
