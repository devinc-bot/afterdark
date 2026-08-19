import { useTranslation } from 'react-i18next'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { ADMIN_USER_ROLES } from '~/modules/users/constants/admin-user-roles'

export const FILTER_ALL = 'all' as const

export type AdminUsersFilters = {
  email: string
  role: string
}

export function UsersFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: AdminUsersFilters
  onChange: (filters: AdminUsersFilters) => void
  onReset: () => void
}) {
  const { t } = useTranslation('admin')

  const hasActiveFilters = filters.email.trim() !== '' || filters.role !== FILTER_ALL

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="flex flex-col gap-1.5 sm:col-span-1 lg:col-span-5">
          <Label htmlFor="users-filter-email">{t('users.filters.email')}</Label>
          <Input
            id="users-filter-email"
            className="w-full"
            value={filters.email}
            onChange={(event) => onChange({ ...filters, email: event.target.value })}
            placeholder={t('users.filters.emailPlaceholder')}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-1 lg:col-span-1">
          <Label htmlFor="users-filter-role">{t('users.filters.role')}</Label>
          <Select
            value={filters.role}
            onValueChange={(value) => onChange({ ...filters, role: value })}
          >
            <SelectTrigger id="users-filter-role" className="w-full">
              <SelectValue placeholder={t('users.filters.roleAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>{t('users.filters.roleAll')}</SelectItem>
              {ADMIN_USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {t(`users.roles.${role}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          {t('users.filters.reset')}
        </Button>
      </div>
    </div>
  )
}
