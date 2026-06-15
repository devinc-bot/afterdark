import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@afterdark/ui'
import { Plus } from 'lucide-react'
import {
  CLUB_DISPLAY_STATUS,
  RegisteredClubCard,
  type RegisteredClub,
} from '~/modules/club-management/components/registered-club-card'

const REGISTERED_CLUBS_MOCK: RegisteredClub[] = [
  {
    id: '1',
    name: 'CYBER TOKYO',
    location: 'Shinjuku District, JP',
    tags: ['VIP', 'ELECTRO'],
    status: CLUB_DISPLAY_STATUS.LIVE,
    imageUrl:
      'https://img.magnific.com/foto-gratis/amigos-tintinean-vasos-bebida-bar-moderno_1150-18971.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    id: '2',
    name: 'VELVET UNDERGROUND',
    location: 'Madrid Central, ES',
    tags: ['PRIVATE', 'JAZZ'],
    status: CLUB_DISPLAY_STATUS.INACTIVE,
    imageUrl:
      'https://images.unsplash.com/photo-1556035511-3168381ea4d4?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bmlnaHQlMjBjbHVifGVufDB8fDB8fHww',
  },
  {
    id: '3',
    name: 'PRISM ROOFTOP',
    location: 'Berlin North, DE',
    tags: ['OPEN BAR', 'TECHNO'],
    status: CLUB_DISPLAY_STATUS.LIVE,
  },
]

export function RegisteredClubs({ clubs = REGISTERED_CLUBS_MOCK }: { clubs?: RegisteredClub[] }) {
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
            <RegisteredClubCard key={club.id} club={club} />
          ))}
        </ul>
      </section>
    </TooltipProvider>
  )
}
