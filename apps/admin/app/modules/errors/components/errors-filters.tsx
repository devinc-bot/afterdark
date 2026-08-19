import { useTranslation } from 'react-i18next'
import {
  Button,
  DateInput,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'

export const FILTER_ALL = 'all' as const
export const STATUS_CODE_OPTIONS = [500, 502, 503, 504] as const

export type ErrorRecordsFilters = {
  statusCode: string
  path: string
  from: string
  to: string
}

export function ErrorsFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: ErrorRecordsFilters
  onChange: (filters: ErrorRecordsFilters) => void
  onReset: () => void
}) {
  const { t } = useTranslation('admin')

  const hasActiveFilters =
    filters.statusCode !== FILTER_ALL ||
    filters.path.trim() !== '' ||
    filters.from !== '' ||
    filters.to !== ''

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="errors-filter-status">{t('errors.filters.statusCode')}</Label>
          <Select
            value={filters.statusCode}
            onValueChange={(value) => onChange({ ...filters, statusCode: value })}
          >
            <SelectTrigger id="errors-filter-status" className="w-full">
              <SelectValue placeholder={t('errors.filters.statusCodeAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>{t('errors.filters.statusCodeAll')}</SelectItem>
              {STATUS_CODE_OPTIONS.map((code) => (
                <SelectItem key={code} value={String(code)}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="errors-filter-path">{t('errors.filters.path')}</Label>
          <Input
            id="errors-filter-path"
            value={filters.path}
            onChange={(event) => onChange({ ...filters, path: event.target.value })}
            placeholder={t('errors.filters.pathPlaceholder')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="errors-filter-from">{t('errors.filters.from')}</Label>
          <DateInput
            id="errors-filter-from"
            value={filters.from}
            onChange={(event) => onChange({ ...filters, from: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="errors-filter-to">{t('errors.filters.to')}</Label>
          <DateInput
            id="errors-filter-to"
            value={filters.to}
            onChange={(event) => onChange({ ...filters, to: event.target.value })}
          />
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
          {t('errors.filters.reset')}
        </Button>
      </div>
    </div>
  )
}
