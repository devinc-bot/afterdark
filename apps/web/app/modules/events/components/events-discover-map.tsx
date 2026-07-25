import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { cn, Map, MapControls, MapMarker, MarkerContent, MarkerPopup, useMap } from '@repo/ui'
import type { PublicEventResponse } from '@repo/types'
import {
  DEFAULT_EVENTS_DISCOVER_MAP_CENTER,
  DEFAULT_EVENTS_DISCOVER_MAP_ZOOM,
  EVENTS_DISCOVER_MAP_MAX_FIT_ZOOM,
  EVENTS_DISCOVER_MAP_FOCUS_ZOOM,
  EVENTS_DISCOVER_MAP_SINGLE_ZOOM,
} from '../constants/events-discover-map'
import { formatEventPlace, formatEventWhen } from '../utils/events-discover-format'

export type EventsDiscoverMapFocus = {
  eventId: string
  latitude: number
  longitude: number
  /** Bumps on each list click so the same event can re-trigger flyTo. */
  token: number
}

type MarkerPoint = {
  documentId: string
  name: string
  startsAt: Date | string
  locationName: string
  city: string | null
  state: string | null
  latitude: number
  longitude: number
}

function toMarkerPoints(events: PublicEventResponse[]): MarkerPoint[] {
  const points: MarkerPoint[] = []

  for (const event of events) {
    if (event.latitude === null || event.longitude === null) {
      continue
    }
    points.push({
      documentId: event.documentId,
      name: event.name,
      startsAt: event.startsAt,
      locationName: event.locationName,
      city: event.city,
      state: event.state,
      latitude: event.latitude,
      longitude: event.longitude,
    })
  }

  return points
}

/** Fit camera once when the first batch of markers appears (filter load). Later pages only add pins. */
function MapFitInitialMarkers({ markers }: { markers: MarkerPoint[] }) {
  const { map, isLoaded } = useMap()
  const didFitRef = useRef(false)
  const signature = markers.map((m) => m.documentId).join('|')

  useEffect(() => {
    if (!map || !isLoaded || markers.length === 0 || didFitRef.current) {
      return
    }

    didFitRef.current = true

    if (markers.length === 1) {
      const only = markers[0]
      map.flyTo({
        center: [only.longitude, only.latitude],
        zoom: EVENTS_DISCOVER_MAP_SINGLE_ZOOM,
        essential: true,
      })
      return
    }

    let minLng = markers[0].longitude
    let maxLng = markers[0].longitude
    let minLat = markers[0].latitude
    let maxLat = markers[0].latitude

    for (let i = 1; i < markers.length; i++) {
      const point = markers[i]
      if (point.longitude < minLng) minLng = point.longitude
      if (point.longitude > maxLng) maxLng = point.longitude
      if (point.latitude < minLat) minLat = point.latitude
      if (point.latitude > maxLat) maxLat = point.latitude
    }

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 56,
        maxZoom: EVENTS_DISCOVER_MAP_MAX_FIT_ZOOM,
        duration: 600,
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit once on first non-empty markers
  }, [isLoaded, map, signature])

  return null
}

function MapFocusEvent({ focus }: { focus: EventsDiscoverMapFocus | null }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || !focus) {
      return
    }

    map.flyTo({
      center: [focus.longitude, focus.latitude],
      zoom: EVENTS_DISCOVER_MAP_FOCUS_ZOOM,
      essential: true,
    })
  }, [focus, isLoaded, map])

  return null
}

type EventsDiscoverMapProps = {
  events: PublicEventResponse[]
  focus: EventsDiscoverMapFocus | null
  selectedEventId: string | null
  onSelectEventId: (documentId: string) => void
}

export function EventsDiscoverMap({
  events,
  focus,
  selectedEventId,
  onSelectEventId,
}: EventsDiscoverMapProps) {
  const { t } = useTranslation('events')
  const [mounted, setMounted] = useState(false)
  const markers = toMarkerPoints(events)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        id="events-discover-map"
        className="flex h-52 items-center justify-center overflow-hidden bg-muted/40 sm:h-72 lg:h-80"
      >
        <p className="font-label text-sm text-on-surface-variant">{t('discover.map.loading')}</p>
      </div>
    )
  }

  return (
    <div id="events-discover-map" className="relative h-72 overflow-hidden sm:h-72 lg:h-80">
      <Map
        center={[
          DEFAULT_EVENTS_DISCOVER_MAP_CENTER.longitude,
          DEFAULT_EVENTS_DISCOVER_MAP_CENTER.latitude,
        ]}
        zoom={DEFAULT_EVENTS_DISCOVER_MAP_ZOOM}
        className="h-full w-full"
      >
        <MapControls showZoom showLocate={false} />
        <MapFitInitialMarkers markers={markers} />
        <MapFocusEvent focus={focus} />
        {markers.map((marker) => {
          const selected = marker.documentId === selectedEventId
          const when = formatEventWhen(marker.startsAt)
          const place = formatEventPlace(marker)
          return (
            <MapMarker
              key={marker.documentId}
              longitude={marker.longitude}
              latitude={marker.latitude}
            >
              <MarkerContent>
                <button
                  type="button"
                  title={marker.name}
                  aria-label={marker.name}
                  aria-current={selected || undefined}
                  aria-pressed={selected}
                  onClick={() => onSelectEventId(marker.documentId)}
                  className={cn(
                    'rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                    'motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out',
                    selected
                      ? 'scale-125 ring-2 ring-on-surface ring-offset-2 ring-offset-background'
                      : 'scale-100'
                  )}
                >
                  <MapPin className="size-7 fill-primary stroke-white drop-shadow" aria-hidden />
                </button>
              </MarkerContent>
              <MarkerPopup closeButton offset={28} className="min-w-44 border-hairline/50 p-3">
                <p className="pr-5 font-display text-sm font-semibold tracking-tight text-on-surface">
                  {marker.name}
                </p>
                {when ? (
                  <p className="mt-1 font-label text-xs text-on-surface-variant">{when}</p>
                ) : null}
                {place ? (
                  <p className="mt-0.5 font-label text-xs text-on-surface-variant">{place}</p>
                ) : null}
                <p className="mt-2 font-label text-xs text-primary">
                  {t('discover.selection.ticketsSoon')}
                </p>
              </MarkerPopup>
            </MapMarker>
          )
        })}
      </Map>
    </div>
  )
}
