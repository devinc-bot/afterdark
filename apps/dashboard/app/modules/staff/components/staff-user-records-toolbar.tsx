import { Button, Input, Label } from '@afterdark/ui'
import { Search, X } from 'lucide-react'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'

const STAFF_USER_RECORDS_SEARCH_ID = 'staff-user-records-search'

type StaffUserRecordsToolbarProps = {
  searchQuery: string
  hasActiveSearch: boolean
  onSearchQueryChange: (value: string) => void
  onClearSearch: () => void
}

export function StaffUserRecordsToolbar({
  searchQuery,
  hasActiveSearch,
  onSearchQueryChange,
  onClearSearch,
}: StaffUserRecordsToolbarProps) {
  return (
    <div className="py-4">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor={STAFF_USER_RECORDS_SEARCH_ID} className="sr-only">
            {STAFF_COPY.table.search.label}
          </Label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-7 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id={STAFF_USER_RECORDS_SEARCH_ID}
            type="search"
            value={searchQuery}
            placeholder={STAFF_COPY.table.search.placeholder}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="pl-9"
            autoComplete="off"
          />
        </div>
        {hasActiveSearch ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-ink-muted hover:text-ink"
            onClick={onClearSearch}
          >
            <X aria-hidden="true" className="size-4" />
            {STAFF_COPY.table.search.clear}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
