import { useState } from 'react'
import type { CreateClubInput } from '@afterdark/validators'
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@afterdark/ui'
import { Plus } from 'lucide-react'
import {
  CLUB_FORM_MODE,
  ClubDialogForm,
  type ClubFormMode,
} from '~/modules/club-management/components/dialog-form'
import { ClubRemoveDialog } from '~/modules/club-management/components/dialog-remove'
import {
  CLUB_DISPLAY_STATUS,
  RegisteredClubCard,
  type RegisteredClub,
} from '~/modules/club-management/components/registered-club-card'

const REGISTERED_CLUBS_MOCK: RegisteredClub[] = [
  {
    id: '1',
    name: 'CYBER TOKYO',
    address: 'Shinjuku District, JP',
    tags: ['VIP', 'ELECTRO'],
    status: CLUB_DISPLAY_STATUS.LIVE,
    capacity: '800',
    city: 'Shinjuku',
    state: 'Tokyo',
    street_number: '12',
    description: 'Ambiente cyberpunk con pista principal y zona VIP elevada.',
    imageUrl:
      'https://img.magnific.com/foto-gratis/amigos-tintinean-vasos-bebida-bar-moderno_1150-18971.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    id: '2',
    name: 'VELVET UNDERGROUND',
    address: 'Madrid Central, ES',
    tags: ['PRIVATE', 'JAZZ'],
    status: CLUB_DISPLAY_STATUS.INACTIVE,
    capacity: '350',
    city: 'Madrid',
    state: 'Madrid',
    street_number: '45',
    description: 'Club íntimo con jazz en vivo y acceso restringido.',
    imageUrl:
      'https://images.unsplash.com/photo-1556035511-3168381ea4d4?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bmlnaHQlMjBjbHVifGVufDB8fDB8fHww',
  },
  {
    id: '3',
    name: 'PRISM ROOFTOP',
    address: 'Berlin North, DE',
    tags: ['OPEN BAR', 'TECHNO'],
    status: CLUB_DISPLAY_STATUS.LIVE,
    capacity: '500',
    city: 'Berlin',
    state: 'Berlin',
    street_number: '8',
    description: 'Rooftop al aire libre con vista panorámica y techno hasta el amanecer.',
  },
]

function clubToFormValues(club: RegisteredClub): CreateClubInput {
  return {
    name: club.name,
    address: club.address,
    capacity: club.capacity ?? '',
    description: club.description ?? '',
    state: club.state ?? '',
    street_number: club.street_number ?? '',
    city: club.city ?? '',
  }
}

export function RegisteredClubs({ clubs = REGISTERED_CLUBS_MOCK }: { clubs?: RegisteredClub[] }) {
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

  const handleSubmit = async (_values: CreateClubInput) => {
    setDialogOpen(false)
  }

  const handleRemoveConfirm = async (_club: RegisteredClub) => {
    setRemoveDialogOpen(false)
    setClubToRemove(null)
  }

  return (
    <TooltipProvider>
      <section
        aria-labelledby="registered-clubs-heading"
        className="rounded-xl border border-hairline bg-surface-container-low"
      >
        <header className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="registered-clubs-heading"
            className="font-heading text-lg font-bold text-ink sm:text-xl"
          >
            Clubes Registrados
          </h2>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Agregar club"
                  onClick={openCreateDialog}
                >
                  <Plus aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agregar club</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <ul className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-5">
          {clubs.map((club) => (
            <RegisteredClubCard
              key={club.id}
              club={club}
              onEdit={openEditDialog}
              onDelete={openRemoveDialog}
            />
          ))}
        </ul>
      </section>

      <ClubDialogForm
        formKey={editingClub?.id ?? CLUB_FORM_MODE.CREATE}
        mode={formMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={editingClub ? clubToFormValues(editingClub) : undefined}
        onSubmit={handleSubmit}
      />

      <ClubRemoveDialog
        club={clubToRemove}
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
        onConfirm={handleRemoveConfirm}
      />
    </TooltipProvider>
  )
}
