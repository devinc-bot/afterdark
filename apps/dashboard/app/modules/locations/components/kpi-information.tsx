import { KpiInformation as KpiCard } from '@afterdark/ui'
import { Banknote, CalendarCheck, CircleAlert, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function KpiInformation() {
  const { t } = useTranslation('locations')

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label={t('kpi.ariaLabel')}
    >
      <KpiCard
        variant="primary"
        label={t('kpi.totalLocations')}
        value="24"
        subtext={
          <>
            <TrendingUp aria-hidden="true" />
            {t('kpi.totalLocationsTrend')}
          </>
        }
      />

      <KpiCard
        label={t('kpi.activeTickets')}
        value="1.842"
        subtext={
          <>
            <CalendarCheck aria-hidden="true" className="text-primary" />
            <span className="text-primary">{t('kpi.activeTicketsSubtext')}</span>
          </>
        }
      />

      <KpiCard
        label={t('kpi.revenue24h')}
        value="€12,5k"
        subtext={
          <>
            <Banknote aria-hidden="true" className="text-on-primary-container" />
            <span className="text-on-primary-container">{t('kpi.revenue24hSubtext')}</span>
          </>
        }
      />

      <KpiCard
        label={t('kpi.pendingVerifications')}
        value="02"
        subtext={
          <>
            <CircleAlert aria-hidden="true" className="text-error" />
            <span className="text-error">{t('kpi.pendingVerificationsSubtext')}</span>
          </>
        }
      />
    </div>
  )
}
