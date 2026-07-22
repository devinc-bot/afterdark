import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import type { LocationResponse } from '@afterdark/types'
import { Button, toast } from '@afterdark/ui'
import { MapPinPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LocationRemoveDialog } from '~/modules/locations/components/dialog-remove'
import {
  RegisteredLocationRecords,
  RegisteredLocationRecordsSkeleton,
  type RegisteredLocation,
} from '~/modules/locations/components/registered-location-records'
import { useLocations } from '~/modules/locations/queries/use-locations-queries'
import { useDeleteLocation } from '~/modules/locations/mutation/use-locations-mutations'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

function locationResponseToRegisteredLocation(location: LocationResponse): RegisteredLocation {
  return {
    id: location.documentId,
    name: location.name,
    address: location.address,
    images: location.images,
    imageUrl: location.images[0]?.url,
    capacity: location.capacity,
    description: location.description ?? undefined,
    state: location.state,
    street_number: location.streetNumber,
    city: location.city,
    latitude: location.latitude,
    longitude: location.longitude,
  }
}

export function RegisteredLocations() {
  const { t } = useTranslation('locations')
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useLocations()
  const deleteLocationMutation = useDeleteLocation()
  const locations = data?.map(locationResponseToRegisteredLocation) ?? []

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [locationToRemove, setLocationToRemove] = useState<RegisteredLocation | null>(null)

  const openRemoveDialog = (location: RegisteredLocation) => {
    setLocationToRemove(location)
    setRemoveDialogOpen(true)
  }

  const handleRemoveDialogOpenChange = (open: boolean) => {
    setRemoveDialogOpen(open)
    if (!open) {
      setLocationToRemove(null)
    }
  }

  const handleRemoveConfirm = async (location: RegisteredLocation) => {
    try {
      await deleteLocationMutation.mutateAsync(location.id)
      toast.success(t('registry.deleteSuccess'))
      setRemoveDialogOpen(false)
      setLocationToRemove(null)
    } catch (removeError) {
      toast.error(removeError instanceof Error ? removeError.message : t('registry.deleteError'))
    }
  }

  const handleEdit = (location: RegisteredLocation) => {
    navigate({
      to: '/locations/$documentId/edit',
      params: { documentId: location.id },
    })
  }

  return (
    <>
      <section aria-labelledby="registered-locations-heading" className="flex flex-col gap-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2
              id="registered-locations-heading"
              className="font-heading text-lg font-semibold text-ink sm:text-xl"
            >
              {t('registry.title')}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {isLoading
                ? t('registry.loading')
                : t('registry.registryCount', { count: locations.length })}
            </p>
          </div>

          <Button asChild type="button" className="w-full shrink-0 sm:w-auto">
            <Link to={DASHBOARD_ROUTES.locationsNew()}>
              <MapPinPlus aria-hidden="true" />
              {t('registry.addLocation')}
            </Link>
          </Button>
        </header>

        {isLoading ? (
          <RegisteredLocationRecordsSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-error/40 bg-error-container/20 px-6 py-12 text-center">
            <div className="flex flex-col gap-2">
              <p className="font-heading text-base font-semibold text-ink">
                {t('registry.loadErrorTitle')}
              </p>
              <p className="mx-auto max-w-sm text-sm text-ink-muted">
                {error instanceof Error ? error.message : t('registry.loadErrorFallback')}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              {t('registry.retry')}
            </Button>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-hairline bg-surface-container-low px-6 py-12 text-center">
            <div className="flex flex-col gap-2">
              <p className="font-heading text-base font-semibold text-ink">
                {t('registry.emptyTitle')}
              </p>
              <p className="mx-auto max-w-sm text-sm text-ink-muted">
                {t('registry.emptyDescription')}
              </p>
            </div>
            <Button asChild type="button">
              <Link to={DASHBOARD_ROUTES.locationsNew()}>
                <MapPinPlus aria-hidden="true" />
                {t('registry.addLocation')}
              </Link>
            </Button>
          </div>
        ) : (
          <RegisteredLocationRecords
            locations={locations}
            onEdit={handleEdit}
            onDelete={openRemoveDialog}
          />
        )}
      </section>

      <LocationRemoveDialog
        location={locationToRemove}
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
        onConfirm={handleRemoveConfirm}
        isRemoving={deleteLocationMutation.isPending}
      />
    </>
  )
}
