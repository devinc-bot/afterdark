import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'
import type { ApiErrorRecordResponse } from '@repo/types'
import { formatDate } from '@repo/common'
import {
  Badge,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  getPaginationItems,
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'

export type ErrorRecordsPagination = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

const ERROR_COLUMN_KEYS = [
  'occurredAt',
  'method',
  'path',
  'statusCode',
  'errorName',
  'message',
] as const

function ErrorsTableHead() {
  const { t } = useTranslation('admin')

  return (
    <TableHeader>
      <TableRow>
        {ERROR_COLUMN_KEYS.map((columnKey) => (
          <TableHead key={columnKey} className="p-6">
            {t(`errors.table.${columnKey}`)}
          </TableHead>
        ))}
        <TableHead className="p-6 text-right">{t('errors.table.actions')}</TableHead>
      </TableRow>
    </TableHeader>
  )
}

const SKELETON_ROW_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

function ErrorsTableSkeleton() {
  const { t } = useTranslation('admin')

  return (
    <Card variant="gradient" aria-busy="true">
      <span className="sr-only">{t('errors.table.loading')}</span>
      <Table variant="compact" className="min-w-200">
        <ErrorsTableHead />
        <TableBody>
          {SKELETON_ROW_KEYS.map((rowKey) => (
            <TableRow key={rowKey} className="border-0">
              <TableCell className="p-6">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-40 max-w-full" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-10" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-48 max-w-full" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="ml-auto h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function ErrorsStateMessage({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-hairline bg-surface-container-low px-6 py-12 text-center">
      <div className="flex flex-col gap-2">
        <p className="font-heading text-base font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

function ErrorsPaginationBar({
  pagination,
  previousLabel,
  nextLabel,
  ariaLabel,
}: {
  pagination: ErrorRecordsPagination
  previousLabel: string
  nextLabel: string
  ariaLabel: string
}) {
  const { page, totalPages, onPageChange } = pagination

  if (totalPages < 1) return null

  const items = getPaginationItems(page, Math.max(totalPages, 1))

  return (
    <div className="border-t border-hairline px-4 py-4 sm:px-6">
      <Pagination aria-label={ariaLabel}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text={previousLabel}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            />
          </PaginationItem>

          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationButton isActive={item === page} onClick={() => onPageChange(item)}>
                  {item}
                </PaginationButton>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              text={nextLabel}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

function ErrorRecordRow({
  record,
  pending,
  onSelect,
  onDelete,
}: {
  record: ApiErrorRecordResponse
  pending: boolean
  onSelect: (record: ApiErrorRecordResponse) => void
  onDelete: (record: ApiErrorRecordResponse) => void
}) {
  const { t } = useTranslation('admin')

  return (
    <TableRow
      className="cursor-pointer border-0 transition-colors hover:bg-surface-container-low focus-within:bg-surface-container-low"
      onClick={() => onSelect(record)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(record)
        }
      }}
      tabIndex={0}
      role="button"
    >
      <TableCell className="p-6 text-ink">
        {formatDate(record.createdAt, { options: { dateStyle: 'short', timeStyle: 'short' } })}
      </TableCell>
      <TableCell className="p-6 text-ink">{record.method}</TableCell>
      <TableCell className="p-6">
        <span className="block max-w-64 truncate font-mono text-xs text-ink">{record.path}</span>
      </TableCell>
      <TableCell className="p-6">
        <Badge variant="destructive">{record.statusCode}</Badge>
      </TableCell>
      <TableCell className="p-6 text-ink">{record.errorName}</TableCell>
      <TableCell className="p-6">
        <span className="block max-w-64 truncate text-sm text-ink-muted">{record.message}</span>
      </TableCell>
      <TableCell className="p-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={pending}
              aria-label={t('errors.actions.menu')}
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem className="text-error" onSelect={() => onDelete(record)}>
              {t('errors.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function ErrorsTable({
  records,
  pagination,
  isLoading = false,
  isError = false,
  hasActiveFilters = false,
  pendingDocumentId,
  onRetry,
  onSelect,
  onDelete,
}: {
  records: ApiErrorRecordResponse[]
  pagination?: ErrorRecordsPagination
  isLoading?: boolean
  isError?: boolean
  hasActiveFilters?: boolean
  pendingDocumentId?: string
  onRetry?: () => void
  onSelect?: (record: ApiErrorRecordResponse) => void
  onDelete: (record: ApiErrorRecordResponse) => void
}) {
  const { t } = useTranslation('admin')

  function renderBody() {
    if (isLoading) {
      return <ErrorsTableSkeleton />
    }

    if (isError) {
      return (
        <ErrorsStateMessage
          title={t('errors.list.errorTitle')}
          description={t('errors.list.error')}
          action={
            onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {t('errors.list.retry')}
              </Button>
            ) : undefined
          }
        />
      )
    }

    if (records.length === 0) {
      return (
        <ErrorsStateMessage
          title={hasActiveFilters ? t('errors.table.emptyFiltered') : t('errors.table.empty')}
          description={
            hasActiveFilters
              ? t('errors.table.emptyFilteredDescription')
              : t('errors.table.emptyDescription')
          }
        />
      )
    }

    return (
      <Card variant="gradient">
        <Table variant="compact" className="min-w-200">
          <ErrorsTableHead />
          <TableBody>
            {records.map((record) => (
              <ErrorRecordRow
                key={record.documentId}
                record={record}
                pending={record.documentId === pendingDocumentId}
                onSelect={onSelect ?? (() => {})}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
        {pagination ? (
          <ErrorsPaginationBar
            pagination={pagination}
            previousLabel={t('errors.pagination.previous')}
            nextLabel={t('errors.pagination.next')}
            ariaLabel={t('errors.pagination.label')}
          />
        ) : null}
      </Card>
    )
  }

  return <div className="flex flex-col gap-4">{renderBody()}</div>
}
