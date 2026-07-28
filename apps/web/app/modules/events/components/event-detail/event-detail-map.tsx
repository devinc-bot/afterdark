import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { Map, MapControls, MapMarker, MarkerContent, useTheme } from '@repo/ui'
import { EVENTS_DISCOVER_MAP_SINGLE_ZOOM } from '../../constants/events-discover-map'

type EventDetailMapProps = {
  latitude: number
  longitude: number
  eventName: string
}

export function EventDetailMap({ latitude, longitude, eventName }: EventDetailMapProps) {
  const { t } = useTranslation('events')
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className="flex h-56 items-center justify-center overflow-hidden rounded-app-lg border border-hairline/50 bg-muted/40 sm:h-64"
        aria-label={t('discover.detail.mapAriaLabel')}
      >
        <p className="font-label text-sm text-on-surface-variant">
          {t('discover.detail.mapLoading')}
        </p>
      </div>
    )
  }

  return (
    <div
      className="relative h-56 overflow-hidden rounded-app-lg border border-hairline/50 sm:h-64"
      aria-label={t('discover.detail.mapAriaLabel')}
    >
      <Map
        theme={theme}
        center={[longitude, latitude]}
        zoom={EVENTS_DISCOVER_MAP_SINGLE_ZOOM}
        className="h-full w-full"
      >
        <MapControls showZoom showLocate={false} />
        <MapMarker longitude={longitude} latitude={latitude}>
          <MarkerContent>
            <span title={eventName} aria-label={eventName}>
              <MapPin className="size-7 fill-primary stroke-background drop-shadow" aria-hidden />
            </span>
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  )
}
