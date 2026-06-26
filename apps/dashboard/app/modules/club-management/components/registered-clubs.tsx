import { useState } from 'react'
import { type ClubResponse } from '@afterdark/types'
import { Button, toast } from '@afterdark/ui'
import { Plus } from 'lucide-react'
import {
  CLUB_FORM_MODE,
  ClubDialogForm,
  type ClubDialogFormValues,
  type ClubFormMode,
} from '~/modules/club-management/components/dialog-form'
import { ClubRemoveDialog } from '~/modules/club-management/components/dialog-remove'
import {
  RegisteredClubRecords,
  type RegisteredClub,
} from '~/modules/club-management/components/registered-club-records'
import { useClubs } from '~/modules/club-management/queries/use-club-management-queries'
import { useDeleteClub } from '~/modules/club-management/mutation/use-club-management-mutations'

function clubResponseToRegisteredClub(club: ClubResponse): RegisteredClub {
  return {
    id: club.documentId,
    name: club.name,
    address: club.address,
    tags: [],
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

function clubToFormValues(club: RegisteredClub): Partial<ClubDialogFormValues> {
  return {
    name: club.name,
    address: club.address,
    capacity: club.capacity ?? '',
    description: club.description ?? '',
    status: club.status,
    state: club.state ?? '',
    street_number: club.street_number ?? '',
    city: club.city ?? '',
    existingImages: club.images,
    clubImg: [],
  }
}

function formatClubCount(count: number): string {
  if (count === 1) return '1 club registrado'
  return `${count} clubes registrados`
}

export function RegisteredClubs() {
  const { data, isLoading, isError, error } = useClubs()
  const deleteClubMutation = useDeleteClub()
  const clubs = data?.map(clubResponseToRegisteredClub) ?? []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<ClubFormMode>(CLUB_FORM_MODE.CREATE)
  const [editingClub, setEditingClub] = useState<RegisteredClub | null>(null)
  const [clubToRemove, setClubToRemove] = useState<RegisteredClub | null>(null)

  const openCreateDialog = () => {
    setEditingClub(null)
    setFormMode(CLUB_FORM_MODE.CREATE)
    setDialogOpen(true)
  }

  const openEditDialog = (club: RegisteredClub) => {
    setEditingClub(club)
    setFormMode(CLUB_FORM_MODE.EDIT)
    setDialogOpen(true)
  }

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
            type="button"
            className="w-full shrink-0 sm:w-auto"
            iconLeft={<Plus aria-hidden="true" />}
            onClick={openCreateDialog}
          >
            Agregar club
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
          <RegisteredClubRecords
            clubs={clubs}
            onEdit={openEditDialog}
            onDelete={openRemoveDialog}
          />
        )}
      </section>

      <ClubDialogForm
        formKey={editingClub?.id ?? CLUB_FORM_MODE.CREATE}
        mode={formMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clubDocumentId={editingClub?.id}
        defaultValues={editingClub ? clubToFormValues(editingClub) : undefined}
      />

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
