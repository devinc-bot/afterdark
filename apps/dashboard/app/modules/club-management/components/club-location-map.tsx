import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { Map, MapControls, MapMarker, MarkerContent, useMap } from '@afterdark/ui'
import {
  CLUB_MAP_SELECTED_ZOOM,
  DEFAULT_CLUB_MAP_CENTER,
  DEFAULT_CLUB_MAP_ZOOM,
} from '~/modules/club-management/constants/club-map'

type Coordinates = {
  latitude: number
  longitude: number
}

type ClubLocationMapProps = {
  latitude: number | null
  longitude: number | null
  viewToken: number
  onCoordinatesChange: (coords: Coordinates) => void
  className?: string
}

function MapClickToPlace({
  enabled,
  onPlace,
}: {
  enabled: boolean
  onPlace: (coords: Coordinates) => void
}) {
  const { map } = useMap()
  const onPlaceRef = useRef(onPlace)
  onPlaceRef.current = onPlace

  useEffect(() => {
    if (!map || !enabled) {
      return
    }

    const handleClick = (event: { lngLat: { lng: number; lat: number } }) => {
      onPlaceRef.current({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [enabled, map])

  return null
}

function MapRecenter({
  latitude,
  longitude,
  viewToken,
}: {
  latitude: number
  longitude: number
  viewToken: number
}) {
  const { map, isLoaded } = useMap()
  const lastTokenRef = useRef<number | null>(null)

  useEffect(() => {
    if (!map || !isLoaded) {
      return
    }

    if (lastTokenRef.current === viewToken) {
      return
    }

    lastTokenRef.current = viewToken
    map.flyTo({
      center: [longitude, latitude],
      zoom: CLUB_MAP_SELECTED_ZOOM,
      essential: true,
    })
  }, [isLoaded, latitude, longitude, map, viewToken])

  return null
}

export function ClubLocationMap({
  latitude,
  longitude,
  viewToken,
  onCoordinatesChange,
  className,
}: ClubLocationMapProps) {
  const { t } = useTranslation('clubs')
  const [mounted, setMounted] = useState(false)
  const didRequestGeo = useRef(false)
  const onCoordinatesChangeRef = useRef(onCoordinatesChange)
  onCoordinatesChangeRef.current = onCoordinatesChange

  const hasPin = latitude !== null && longitude !== null
  const initialCenter: [number, number] = hasPin
    ? [longitude, latitude]
    : [DEFAULT_CLUB_MAP_CENTER.longitude, DEFAULT_CLUB_MAP_CENTER.latitude]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || hasPin || didRequestGeo.current) {
      return
    }

    didRequestGeo.current = true

    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCoordinatesChangeRef.current({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 60_000 }
    )
  }, [hasPin, mounted])

  if (!mounted) {
    return (
      <div
        className={`bg-muted/40 flex h-[280px] items-center justify-center overflow-hidden rounded-control ${className ?? ''}`}
      >
        <p className="text-sm text-ink-muted">{t('location.mapLoading')}</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`}>
      <div className="relative h-[280px] overflow-hidden rounded-control border border-hairline">
        <Map
          center={initialCenter}
          zoom={hasPin ? CLUB_MAP_SELECTED_ZOOM : DEFAULT_CLUB_MAP_ZOOM}
          className="h-full w-full"
        >
          <MapControls showZoom showLocate={false} />
          <MapClickToPlace
            enabled
            onPlace={(coords) => {
              onCoordinatesChange(coords)
            }}
          />
          {hasPin ? (
            <>
              <MapRecenter latitude={latitude} longitude={longitude} viewToken={viewToken} />
              <MapMarker
                draggable
                longitude={longitude}
                latitude={latitude}
                onDragEnd={(lngLat) => {
                  onCoordinatesChange({
                    latitude: lngLat.lat,
                    longitude: lngLat.lng,
                  })
                }}
              >
                <MarkerContent>
                  <div className="cursor-grab active:cursor-grabbing">
                    <MapPin className="fill-primary stroke-white drop-shadow" size={32} />
                  </div>
                </MarkerContent>
              </MapMarker>
            </>
          ) : null}
        </Map>
      </div>
      <p className="text-xs text-ink-muted">{t('location.mapHint')}</p>
    </div>
  )
}
