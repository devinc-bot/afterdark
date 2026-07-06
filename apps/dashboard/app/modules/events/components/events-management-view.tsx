import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EventResponse } from '@afterdark/types'
import { toast } from '@afterdark/ui'
import { EventCreateDialog } from '~/modules/events/components/dialog-create-event'
import { EventEditDialog } from '~/modules/events/components/dialog-edit-event'
import { EventRemoveDialog } from '~/modules/events/components/dialog-remove-event'
import {
  type EventRecordItem,
  type EventRecordsPagination,
  EventRecords,
} from '~/modules/events/components/event-record'
import { useDeleteEvent } from '~/modules/events/mutation/use-event-mutations'
import { useEvents } from '~/modules/events/queries/use-event-queries'
import { eventResponseToRecordItem } from '~/modules/events/utils/event-form.mapper'
import { PageLayout } from '~/modules/common/components/page-layout'

const EVENTS_PAGE_SIZE = 10

export function EventsManagementView() {
  const { t } = useTranslation('events')
  const [page, setPage] = useState(1)
  const [editEvent, setEditEvent] = useState<EventResponse | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [recordToRemove, setRecordToRemove] = useState<EventRecordItem | null>(null)
  const deleteEventMutation = useDeleteEvent()

  const { data, isError } = useEvents({ page, limit: EVENTS_PAGE_SIZE })

  const records = useMemo(
    () => (data?.data ?? []).map((event) => eventResponseToRecordItem(event)),
    [data]
  )

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages) {
      setPage(data.totalPages)
    }
  }, [data, page])

  const pagination: EventRecordsPagination | undefined = data
    ? {
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
        onPageChange: setPage,
      }
    : undefined

  const handleEditRecord = (record: EventRecordItem) => {
    const event = data?.data.find((item) => item.documentId === record.id)
    if (!event) return
    setEditEvent(event)
    setEditDialogOpen(true)
  }

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open)
    if (!open) {
      setEditEvent(null)
    }
  }

  const openRemoveDialog = (record: EventRecordItem) => {
    setRecordToRemove(record)
    setRemoveDialogOpen(true)
  }

  const handleRemoveDialogOpenChange = (open: boolean) => {
    setRemoveDialogOpen(open)
    if (!open) {
      setRecordToRemove(null)
    }
  }

  const handleRemoveConfirm = async (record: EventRecordItem) => {
    try {
      await deleteEventMutation.mutateAsync(record.id)
      toast.success(t('delete.success'))
      setRemoveDialogOpen(false)
      setRecordToRemove(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('delete.error'))
    }
  }

  return (
    <PageLayout title={t('page.title')} description={t('page.description')}>
      {isError ? (
        <p className="text-sm text-error" role="alert">
          {t('list.error')}
        </p>
      ) : (
        <EventRecords
          records={records}
          pagination={pagination}
          onEdit={handleEditRecord}
          onDelete={openRemoveDialog}
          headerAction={<EventCreateDialog />}
        />
      )}

      <EventEditDialog
        event={editEvent}
        open={editDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
      />

      <EventRemoveDialog
        record={recordToRemove}
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
        onConfirm={handleRemoveConfirm}
        isRemoving={deleteEventMutation.isPending}
      />
    </PageLayout>
  )
}
