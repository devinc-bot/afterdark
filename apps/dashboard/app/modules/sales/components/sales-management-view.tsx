import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TICKET_TYPE, type TicketType } from '@repo/types'
import {
  Button,
  DateInput,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { PageLayout } from '~/modules/common/components/page-layout'
import { SalesRecords, type SalesRecordsPagination } from '~/modules/sales/components/sales-records'
import {
  useOwnerSales,
  useSalesFilterLocations,
  useSalesFilterEvents,
} from '~/modules/sales/queries/use-sales-queries'
import { dateInputToEndOfDay, dateInputToStartOfDay } from '~/modules/sales/utils/sales.formatter'

const SALES_PAGE_SIZE = 10
const FILTER_ALL = 'all' as const

export function SalesManagementView() {
  const { t } = useTranslation('sales')
  const [page, setPage] = useState(1)
  const [locationId, setLocationId] = useState<string>(FILTER_ALL)
  const [eventId, setEventId] = useState<string>(FILTER_ALL)
  const [ticketType, setTicketType] = useState<string>(FILTER_ALL)
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')

  const locationsQuery = useSalesFilterLocations()
  const eventsQuery = useSalesFilterEvents()

  const hasActiveFilters =
    locationId !== FILTER_ALL ||
    eventId !== FILTER_ALL ||
    ticketType !== FILTER_ALL ||
    fromInput !== '' ||
    toInput !== ''

  function resetFilters() {
    setLocationId(FILTER_ALL)
    setEventId(FILTER_ALL)
    setTicketType(FILTER_ALL)
    setFromInput('')
    setToInput('')
    setPage(1)
  }

  useEffect(() => {
    setPage(1)
  }, [locationId, eventId, ticketType, fromInput, toInput])

  const filteredEvents = useMemo(() => {
    const events = eventsQuery.data ?? []
    if (locationId === FILTER_ALL) return events
    return events.filter((event) => event.locationId === locationId)
  }, [eventsQuery.data, locationId])

  useEffect(() => {
    if (eventId === FILTER_ALL) return
    const stillVisible = filteredEvents.some((event) => event.documentId === eventId)
    if (!stillVisible) setEventId(FILTER_ALL)
  }, [filteredEvents, eventId])

  const { data, isError, isLoading, refetch } = useOwnerSales({
    page,
    limit: SALES_PAGE_SIZE,
    locationId: locationId === FILTER_ALL ? undefined : locationId,
    eventId: eventId === FILTER_ALL ? undefined : eventId,
    ticketType: ticketType === FILTER_ALL ? undefined : (ticketType as TicketType),
    from: dateInputToStartOfDay(fromInput),
    to: dateInputToEndOfDay(toInput),
  })

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages) setPage(data.totalPages)
  }, [data, page])

  const pagination: SalesRecordsPagination | undefined = data
    ? {
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
        onPageChange: setPage,
      }
    : undefined

  const filters = (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sales-filter-location">{t('filters.location')}</Label>
          <Select
            value={locationId}
            onValueChange={setLocationId}
            disabled={locationsQuery.isLoading}
          >
            <SelectTrigger id="sales-filter-location" className="w-full">
              <SelectValue
                placeholder={
                  locationsQuery.isLoading
                    ? t('filters.locationsLoading')
                    : t('filters.locationAll')
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>{t('filters.locationAll')}</SelectItem>
              {(locationsQuery.data ?? []).map((location) => (
                <SelectItem key={location.documentId} value={location.documentId}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sales-filter-event">{t('filters.event')}</Label>
          <Select value={eventId} onValueChange={setEventId} disabled={eventsQuery.isLoading}>
            <SelectTrigger id="sales-filter-event" className="w-full">
              <SelectValue
                placeholder={
                  eventsQuery.isLoading ? t('filters.eventsLoading') : t('filters.eventAll')
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>{t('filters.eventAll')}</SelectItem>
              {filteredEvents.map((event) => (
                <SelectItem key={event.documentId} value={event.documentId}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sales-filter-type">{t('filters.ticketType')}</Label>
          <Select value={ticketType} onValueChange={setTicketType}>
            <SelectTrigger id="sales-filter-type" className="w-full">
              <SelectValue placeholder={t('filters.ticketTypeAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>{t('filters.ticketTypeAll')}</SelectItem>
              <SelectItem value={TICKET_TYPE.GENERAL}>{t('filters.ticketTypeGeneral')}</SelectItem>
              <SelectItem value={TICKET_TYPE.VIP}>{t('filters.ticketTypeVip')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sales-filter-from">{t('filters.from')}</Label>
          <DateInput
            id="sales-filter-from"
            value={fromInput}
            onChange={(event) => setFromInput(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sales-filter-to">{t('filters.to')}</Label>
          <DateInput
            id="sales-filter-to"
            value={toInput}
            onChange={(event) => setToInput(event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          {t('filters.reset')}
        </Button>
      </div>
    </div>
  )

  return (
    <PageLayout title={t('page.title')} description={t('page.description')}>
      <SalesRecords
        sales={data?.data ?? []}
        pagination={pagination}
        filters={filters}
        isLoading={isLoading}
        isError={isError}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => void refetch()}
      />
    </PageLayout>
  )
}
