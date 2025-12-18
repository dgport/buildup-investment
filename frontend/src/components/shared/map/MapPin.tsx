import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { MapPin, Layers, X, Check } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken =
  'pk.eyJ1IjoibGFkbzAwMSIsImEiOiJjbWdqZHlueWMwZm96MnNzaG0yeXhwamJ4In0.sOu9ZtnorGqdZGqKitmSYg'

const DEFAULT_CENTER: [number, number] = [41.6168, 41.6401]
const DEFAULT_ZOOM = 16

interface ProjectLocationMapPickerProps {
  onLocationSelect: (location: {
    coordinates: [number, number]
    address: string
  }) => void
  onClose: () => void
  initialLocation?: { lng: number; lat: number } | null
}

export function ProjectLocationMapPicker({
  onLocationSelect,
  onClose,
  initialLocation,
}: ProjectLocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(
    initialLocation ?? null
  )
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [is3D, setIs3D] = useState(false)
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation
        ? [initialLocation.lng, initialLocation.lat]
        : DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      const labelLayerId = map
        .getStyle()
        .layers?.find(l => l.type === 'symbol' && l.layout?.['text-field'])?.id

      if (!map.getLayer('3d-buildings')) {
        map.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                '#22c55e',
                ['boolean', ['feature-state', 'hover'], false],
                '#60a5fa',
                '#c9daf8',
              ],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.8,
            },
          },
          labelLayerId
        )
      }

      map.on('mousemove', '3d-buildings', e => {
        if (e.features && e.features.length > 0) {
          const buildingId = e.features[0].id as string
          if (hoveredBuilding !== null && hoveredBuilding !== buildingId) {
            map.setFeatureState(
              {
                source: 'composite',
                sourceLayer: 'building',
                id: hoveredBuilding,
              },
              { hover: false }
            )
          }
          setHoveredBuilding(buildingId)
          map.setFeatureState(
            { source: 'composite', sourceLayer: 'building', id: buildingId },
            { hover: true }
          )
          map.getCanvas().style.cursor = 'pointer'
        }
      })

      map.on('mouseleave', '3d-buildings', () => {
        if (hoveredBuilding !== null) {
          map.setFeatureState(
            {
              source: 'composite',
              sourceLayer: 'building',
              id: hoveredBuilding,
            },
            { hover: false }
          )
        }
        setHoveredBuilding(null)
        map.getCanvas().style.cursor = ''
      })

      map.on('click', '3d-buildings', e => {
        if (e.features && e.features.length > 0) {
          const buildingId = e.features[0].id as string

          if (selectedBuilding !== null) {
            map.setFeatureState(
              {
                source: 'composite',
                sourceLayer: 'building',
                id: selectedBuilding,
              },
              { selected: false }
            )
          }

          if (selectedBuilding === buildingId) {
            setSelectedBuilding(null)
          } else {
            setSelectedBuilding(buildingId)
            map.setFeatureState(
              { source: 'composite', sourceLayer: 'building', id: buildingId },
              { selected: true }
            )
          }
        }
      })
    })

    map.on('click', handleMapClick)

    if (initialLocation) {
      addMarker(initialLocation.lng, initialLocation.lat)
      reverseGeocode(initialLocation.lng, initialLocation.lat)
    }

    return () => {
      markerRef.current?.remove()
      map.remove()
    }
  }, [])

  const addMarker = (lng: number, lat: number) => {
    markerRef.current?.remove()
    markerRef.current = new mapboxgl.Marker({ color: '#ff6b35' })
      .setLngLat([lng, lat])
      .addTo(mapRef.current!)
  }

  const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat

    setCoords({ lng, lat })
    addMarker(lng, lat)
    await reverseGeocode(lng, lat)
  }

  const toggle3D = () => {
    if (!mapRef.current) return

    setIs3D(prev => !prev)

    mapRef.current.easeTo({
      pitch: is3D ? 0 : 60,
      bearing: is3D ? 0 : -20,
      duration: 800,
    })
  }

  const reverseGeocode = async (lng: number, lat: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      )
      const data = await res.json()

      setAddress(
        data.features?.[0]?.place_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      )
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } finally {
      setLoading(false)
    }
  }

  const confirmLocation = () => {
    if (!coords || !address) return

    onLocationSelect({
      coordinates: [coords.lng, coords.lat],
      address,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden border border-slate-700 flex flex-col">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <MapPin className="text-cyan-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                Select Project Location
              </h2>
              <p className="text-sm text-slate-400">
                Click on the map to choose a location
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded">
            <X className="text-slate-300" />
          </button>
        </header>

        <div className="relative flex-1">
          <div ref={mapContainerRef} className="w-full h-full" />

          <button
            onClick={toggle3D}
            className="absolute top-4 right-4 bg-white px-4 py-2 rounded shadow flex items-center gap-2"
          >
            <Layers size={16} />
            {is3D ? '2D View' : '3D View'}
          </button>
        </div>

        <footer className="px-8 py-4 border-t border-slate-700 bg-slate-800">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              {loading ? (
                <p className="text-slate-400">Loading address…</p>
              ) : (
                <p className="text-white">
                  {address || 'No location selected'}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmLocation}
                disabled={!coords || !address}
                className="px-4 py-2 bg-orange-500 rounded flex items-center gap-2 disabled:opacity-50 text-white"
              >
                <Check size={16} />
                Confirm
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
