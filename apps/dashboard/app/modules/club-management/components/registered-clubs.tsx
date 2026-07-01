import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { type ClubResponse } from '@afterdark/types'
import { Button, toast } from '@afterdark/ui'
import { Plus } from 'lucide-react'
import { ClubRemoveDialog } from '~/modules/club-management/components/dialog-remove'
import {
  RegisteredClubRecords,
  type RegisteredClub,
} from '~/modules/club-management/components/registered-club-records'
import { useClubs } from '~/modules/club-management/queries/use-club-management-queries'
import { useDeleteClub } from '~/modules/club-management/mutation/use-club-management-mutations'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

function clubResponseToRegisteredClub(club: ClubResponse): RegisteredClub {
  return {
    id: club.documentId,
    name: club.name,
    address: club.address,
    status: club.status,
    images: club.images,
    imageUrl: club.images[0]?.url,
    capacity: club.capacity,
    description: club.description ?? undefined,
    state: club.state,
    street_number: club.streetNumber,
    city: club.city,
  }
}

function formatClubCount(count: number): string {
  if (count === 1) return '1 club registrado'
  return `${count} clubes registrados`
}

export function RegisteredClubs() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useClubs()
  const deleteClubMutation = useDeleteClub()
  const clubs = data?.map(clubResponseToRegisteredClub) ?? []

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [clubToRemove, setClubToRemove] = useState<RegisteredClub | null>(null)

  const openRemoveDialog = (club: RegisteredClub) => {
    setClubToRemove(club)
    setRemoveDialogOpen(true)
  }

  const handleRemoveDialogOpenChange = (open: boolean) => {
    setRemoveDialogOpen(open)
    if (!open) {
      setClubToRemove(null)
    }
  }

  const handleRemoveConfirm = async (club: RegisteredClub) => {
    try {
      await deleteClubMutation.mutateAsync(club.id)
      toast.success('Club eliminado correctamente')
      setRemoveDialogOpen(false)
      setClubToRemove(null)
    } catch (removeError) {
      toast.error(
        removeError instanceof Error
          ? removeError.message
          : 'No pudimos eliminar el club. Intentá de nuevo.'
      )
    }
  }

  const handleEdit = (club: RegisteredClub) => {
    navigate({
      to: '/club-management/$documentId/edit',
      params: { documentId: club.id },
    })
  }

  return (
    <>
      <section aria-labelledby="registered-clubs-heading" className="flex flex-col gap-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2
              id="registered-clubs-heading"
              className="font-heading text-lg font-semibold text-ink sm:text-xl"
            >
              Clubes registrados
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {isLoading ? 'Cargando clubes…' : formatClubCount(clubs.length)}
            </p>
          </div>

          <Button
            asChild
            type="button"
            className="w-full shrink-0 sm:w-auto"
            iconLeft={<Plus aria-hidden="true" />}
          >
            <Link to={DASHBOARD_ROUTES.clubManagementNew()}>Agregar club</Link>
          </Button>
        </header>

        {isLoading ? (
          <div className="rounded-xl border border-hairline bg-surface-container-low px-6 py-12 text-center">
            <p className="text-sm text-ink-muted">Cargando clubes…</p>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-dashed border-error/40 bg-error-container/20 px-6 py-12 text-center">
            <p className="font-heading text-base font-semibold text-ink">
              No pudimos cargar los clubes
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
              {error instanceof Error ? error.message : 'Intentá de nuevo en unos minutos.'}
            </p>
          </div>
        ) : clubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-hairline bg-surface-container-low px-6 py-12 text-center">
            <p className="font-heading text-base font-semibold text-ink">Todavía no hay clubes</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
              Registrá el primer club para empezar a gestionar su información y disponibilidad.
            </p>
          </div>
        ) : (
          <RegisteredClubRecords clubs={clubs} onEdit={handleEdit} onDelete={openRemoveDialog} />
        )}
      </section>

      <ClubRemoveDialog
        club={clubToRemove}
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
        onConfirm={handleRemoveConfirm}
        isRemoving={deleteClubMutation.isPending}
      />
    </>
  )
}
