import type { LocationImageResponse } from '@repo/types'
import {
  Button,
  Card,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NotImage,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { EllipsisVertical, MapPin, Pencil, Trash2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('locations')

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
          label={t('registry.row.noImageAlt', { name: location.name })}
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
  const { t } = useTranslation('locations')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-ink-muted hover:text-ink"
          aria-label={t('registry.row.menuLabel', { name: location.name })}
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
          {t('registry.row.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(locationActionItemClassName, 'text-error focus:text-error')}
          onClick={() => onDelete?.(location)}
        >
          <Trash2 aria-hidden="true" className={cn(locationActionIconClassName, 'text-error')} />
          {t('registry.row.delete')}
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
  const { t } = useTranslation('locations')

  return (
    <Card variant="gradient">
      <Table variant="compact">
        <TableHeader>
          <TableRow>
            <TableHead className="p-6">{t('registry.columns.location')}</TableHead>
            <TableHead className="p-6">{t('registry.columns.address')}</TableHead>
            <TableHead className="p-6">{t('registry.columns.capacity')}</TableHead>
            <TableHead className="p-6 text-right">{t('registry.columns.actions')}</TableHead>
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

const SKELETON_ROW_KEYS = ['a', 'b', 'c', 'd', 'e'] as const

export function RegisteredLocationRecordsSkeleton() {
  const { t } = useTranslation('locations')

  return (
    <Card variant="gradient" aria-busy="true">
      <span className="sr-only">{t('registry.loading')}</span>
      <Table variant="compact">
        <TableHeader>
          <TableRow>
            <TableHead className="p-6">{t('registry.columns.location')}</TableHead>
            <TableHead className="p-6">{t('registry.columns.address')}</TableHead>
            <TableHead className="p-6">{t('registry.columns.capacity')}</TableHead>
            <TableHead className="p-6 text-right">{t('registry.columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SKELETON_ROW_KEYS.map((rowKey) => (
            <TableRow key={rowKey} className="border-0">
              <TableCell className="p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-lg" />
                  <Skeleton className="h-4 w-32 max-w-full" />
                </div>
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-40 max-w-full" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="p-6">
                <div className="flex justify-end">
                  <Skeleton className="size-9 rounded-lg" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
