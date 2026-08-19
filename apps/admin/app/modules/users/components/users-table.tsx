import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'
import type { AdminUserListItemResponse, AdminUserTogglableStatus } from '@repo/types'
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

export type AdminUsersPagination = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

const USER_COLUMN_KEYS = ['email', 'name', 'role', 'createdAt'] as const

const SKELETON_ROW_KEYS = ['a', 'b', 'c', 'd', 'e'] as const

function UsersTableHead() {
  const { t } = useTranslation('admin')

  return (
    <TableHeader>
      <TableRow>
        {USER_COLUMN_KEYS.map((columnKey) => (
          <TableHead key={columnKey} className="p-6">
            {t(`users.table.${columnKey}`)}
          </TableHead>
        ))}
        <TableHead className="p-6 text-right">{t('users.table.actions')}</TableHead>
      </TableRow>
    </TableHeader>
  )
}

function UsersTableSkeleton() {
  const { t } = useTranslation('admin')

  return (
    <Card variant="gradient" aria-busy="true">
      <span className="sr-only">{t('users.table.loading')}</span>
      <Table variant="compact" className="min-w-200">
        <UsersTableHead />
        <TableBody>
          {SKELETON_ROW_KEYS.map((rowKey) => (
            <TableRow key={rowKey} className="border-0">
              <TableCell className="p-6">
                <Skeleton className="h-4 w-56 max-w-full" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-36 max-w-full" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="p-6">
                <Skeleton className="h-4 w-28" />
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

function UsersStateMessage({
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

function UsersPaginationBar({
  pagination,
  previousLabel,
  nextLabel,
  ariaLabel,
}: {
  pagination: AdminUsersPagination
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

function UserRow({
  user,
  pending,
  onStatusChange,
}: {
  user: AdminUserListItemResponse
  pending: boolean
  onStatusChange: (documentId: string, status: AdminUserTogglableStatus) => void
}) {
  const { t } = useTranslation('admin')

  const fullName =
    user.name || user.lastName ? `${user.name ?? ''} ${user.lastName ?? ''}`.trim() : null

  return (
    <TableRow className="border-0">
      <TableCell className="p-6">
        <span className="block max-w-64 truncate font-mono text-xs text-ink">{user.email}</span>
      </TableCell>
      <TableCell className="p-6 text-ink">{fullName ?? t('users.table.noName')}</TableCell>
      <TableCell className="p-6">
        <Badge variant="secondary">{t(`users.roles.${user.role}`)}</Badge>
      </TableCell>
      <TableCell className="p-6 text-ink">
        {formatDate(new Date(user.createdAt), {
          options: { dateStyle: 'short', timeStyle: 'short' },
        })}
      </TableCell>
      <TableCell className="p-6 text-right">
        {user.status === null ? (
          <span className="text-sm text-ink-muted">—</span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                aria-label={t('users.actions.menu')}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={user.status === 'active'}
                onSelect={() => onStatusChange(user.documentId, 'active')}
              >
                {t('users.actions.activate')}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.status === 'inactive'}
                onSelect={() => onStatusChange(user.documentId, 'inactive')}
              >
                {t('users.actions.deactivate')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  )
}

export function UsersTable({
  users,
  pagination,
  isLoading = false,
  isError = false,
  hasActiveFilters = false,
  pendingDocumentId,
  onRetry,
  onStatusChange,
}: {
  users: AdminUserListItemResponse[]
  pagination?: AdminUsersPagination
  isLoading?: boolean
  isError?: boolean
  hasActiveFilters?: boolean
  pendingDocumentId?: string
  onRetry?: () => void
  onStatusChange: (documentId: string, status: AdminUserTogglableStatus) => void
}) {
  const { t } = useTranslation('admin')

  function renderBody() {
    if (isLoading) {
      return <UsersTableSkeleton />
    }

    if (isError) {
      return (
        <UsersStateMessage
          title={t('users.list.errorTitle')}
          description={t('users.list.error')}
          action={
            onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {t('users.list.retry')}
              </Button>
            ) : undefined
          }
        />
      )
    }

    if (users.length === 0) {
      return (
        <UsersStateMessage
          title={hasActiveFilters ? t('users.table.emptyFiltered') : t('users.table.empty')}
          description={
            hasActiveFilters
              ? t('users.table.emptyFilteredDescription')
              : t('users.table.emptyDescription')
          }
        />
      )
    }

    return (
      <Card variant="gradient">
        <Table variant="compact" className="min-w-200">
          <UsersTableHead />
          <TableBody>
            {users.map((user) => (
              <UserRow
                key={user.documentId}
                user={user}
                pending={user.documentId === pendingDocumentId}
                onStatusChange={onStatusChange}
              />
            ))}
          </TableBody>
        </Table>
        {pagination ? (
          <UsersPaginationBar
            pagination={pagination}
            previousLabel={t('users.pagination.previous')}
            nextLabel={t('users.pagination.next')}
            ariaLabel={t('users.pagination.label')}
          />
        ) : null}
      </Card>
    )
  }

  return <div className="flex flex-col gap-4">{renderBody()}</div>
}
