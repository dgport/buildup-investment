'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken =
  'pk.eyJ1IjoibGFkbzAwMSIsImEiOiJjbWdqZHlueWMwZm96MnNzaG0yeXhwamJ4In0.sOu9ZtnorGqdZGqKitmSYg'

const CITY_GEO_IDS: Record<string, number> = {
  batumi: 2,
  tbilisi: 1,
  kutaisi: 3,
  rustavi: 4,
  gori: 5,
  zugdidi: 6,
  poti: 7,
  khashuri: 8,
  samtredia: 9,
  senaki: 10,
}

export default function InventoryMap() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState(null)
  const [coordsType, setCoordsType] = useState(null)
  const [is3D, setIs3D] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('electronics')
  const [apartmentNumber, setApartmentNumber] = useState('')
  const [items, setItems] = useState([])
  const [highlightedBuilding, setHighlightedBuilding] = useState(null)
  const [hoveredBuilding, setHoveredBuilding] = useState(null)
  const debounceTimer = useRef(null)
  const currentMarker = useRef(null)

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [44.793, 41.7151],
      zoom: 13,
      pitch: 0,
      bearing: 0,
      projection: 'globe',
    })

    map.current.addControl(new mapboxgl.NavigationControl())

    map.current.on('click', async e => {
      setSelectedCoords([e.lngLat.lng, e.lngLat.lat])

      await reverseGeocode([e.lngLat.lng, e.lngLat.lat])

      highlightBuildingAtLocation([e.lngLat.lng, e.lngLat.lat])

      if (currentMarker.current) {
        currentMarker.current.remove()
      }

      currentMarker.current = new mapboxgl.Marker({ color: '#00ff88' })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(map.current)
    })

    map.current.on('load', () => {
      map.current.on('mousemove', e => {
        if (!map.current.getLayer('3d-buildings')) return

        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['3d-buildings'],
        })

        if (features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer'

          if (hoveredBuilding !== features[0].id) {
            setHoveredBuilding(features[0].id)

            if (map.current.getLayer('hovered-building')) {
              map.current.removeLayer('hovered-building')
              map.current.removeSource('hovered-building')
            }

            map.current.addLayer({
              id: 'hovered-building',
              type: 'fill-extrusion',
              source: {
                type: 'geojson',
                data: features[0].toJSON(),
              },
              paint: {
                'fill-extrusion-color': '#4dabf7',
                'fill-extrusion-height': features[0].properties.height || 20,
                'fill-extrusion-base': features[0].properties.min_height || 0,
                'fill-extrusion-opacity': 0.7,
              },
            })
          }
        } else {
          map.current.getCanvas().style.cursor = ''
          if (map.current.getLayer('hovered-building')) {
            map.current.removeLayer('hovered-building')
            map.current.removeSource('hovered-building')
          }
          setHoveredBuilding(null)
        }
      })
    })

    return () => map.current.remove()
  }, [])

  const reverseGeocode = async coords => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}&types=address`

    try {
      const res = await fetch(url)
      const data = await res.json()

      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const address = feature.address || ''
        const streetName = feature.text || ''

        const cityContext = feature.context?.find(c => c.id.includes('place'))
        const cityName = cityContext?.text || 'Tbilisi'

        setCity(cityName)
        setStreet(streetName)
        setNumber(address)
        setCoordsType(address ? 'exact' : 'street')

        return { city: cityName, street: streetName, number: address }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
    return null
  }

  const getMatchingExistingLocations = (
    searchCity,
    searchStreet,
    searchNumber
  ) => {
    if (!searchCity && !searchStreet && !searchNumber) return []

    return items.filter(item => {
      const cityMatch =
        !searchCity ||
        item.city?.toLowerCase().includes(searchCity.toLowerCase())
      const streetMatch =
        !searchStreet ||
        item.street?.toLowerCase().includes(searchStreet.toLowerCase())
      const numberMatch = !searchNumber || item.number?.includes(searchNumber)

      return cityMatch && streetMatch && numberMatch
    })
  }

  const handleAddressFieldChange = async (field, value) => {
    if (field === 'city') {
      setCity(value)

      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (field === 'street') {
      setStreet(value)

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      if (!city || value.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      debounceTimer.current = setTimeout(async () => {
        await fetchStreetSuggestions(value)
      }, 300)
      return
    }

    if (field === 'number') {
      setNumber(value)
      return
    }
  }

  const fetchStreetSuggestions = async (streetQuery: string) => {
    const cityLower = city.toLowerCase()
    const geoObjectId = CITY_GEO_IDS[cityLower]

    if (!geoObjectId) {
      console.warn(`City "${city}" not found in geo_object_id mapping`)
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const url = `https://korter.ge/pyapi/map/karton/street-autocomplete?query=${encodeURIComponent(
        streetQuery
      )}&geo_object_id=${geoObjectId}&locale=en-US`

      const res = await fetch(url)
      const data = await res.json()

      if (data.status === 'OK' && data.data && data.data.length > 0) {
        const streetSuggestions = data.data.map((item: any) => ({
          type: 'korter',
          text: item.address,
          place_name: item.fullAddress,
          center: [item.lng, item.lat],
          placeId: item.placeId,
        }))

        setSuggestions(streetSuggestions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Korter.ge API error:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = feature => {
    if (feature.type === 'existing') {
      setCity(feature.item.city)
      setStreet(feature.item.street)
      setNumber(feature.item.number)
      setSelectedCoords(feature.center)
      setCoordsType('exact')
    } else if (feature.type === 'korter') {
      setStreet(feature.text)
      setSelectedCoords(feature.center)
      setCoordsType('street')
    } else {
      const placeName = feature.place_name
      const hasNumber = feature.address || /^\d+/.test(feature.text)

      setCity(city || 'Tbilisi')
      setStreet(feature.text || '')
      if (!hasNumber && number) {
        setCoordsType('street')
      } else {
        setCoordsType('exact')
      }
      setSelectedCoords(feature.center)
    }

    setShowSuggestions(false)
    setSuggestions([])

    highlightBuildingAtLocation(feature.center)

    if (currentMarker.current) {
      currentMarker.current.remove()
    }

    currentMarker.current = new mapboxgl.Marker({ color: '#00ff88' })
      .setLngLat(feature.center)
      .setPopup(
        new mapboxgl.Popup().setHTML(`<strong>${feature.place_name}</strong>`)
      )
      .addTo(map.current)

    map.current.flyTo({
      center: feature.center,
      zoom: 17,
      pitch: is3D ? 60 : 0,
    })
  }

  const searchAddress = async () => {
    const combinedAddress = [number, street, city].filter(Boolean).join(' ')

    if (!combinedAddress.trim()) return alert('Enter at least city and street')

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      combinedAddress
    )}.json?access_token=${mapboxgl.accessToken}&countries=ge&fuzzyMatch=true`

    const res = await fetch(url)
    const data = await res.json()

    if (data.features && data.features.length > 0) {
      const coords = data.features[0].center
      const place = data.features[0].place_name

      const hasNumber =
        data.features[0].address || /^\d+/.test(data.features[0].text)
      if (!hasNumber && number) {
        setCoordsType('street')
        alert(
          `Found street "${street}" but not building #${number}. Using street-level coordinates. You can still add the item with your building number.`
        )
      } else {
        setCoordsType('exact')
      }

      setSelectedCoords(coords)

      highlightBuildingAtLocation(coords)

      if (currentMarker.current) {
        currentMarker.current.remove()
      }

      currentMarker.current = new mapboxgl.Marker({ color: '#00ff88' })
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${place}</strong>`))
        .addTo(map.current)

      map.current.flyTo({ center: coords, zoom: 17, pitch: is3D ? 60 : 0 })
    } else {
      alert('Address not found — try again.')
    }
  }

  const highlightBuildingAtLocation = coords => {
    if (!map.current.getLayer('3d-buildings')) {
      toggle3D()
    }

    if (map.current.getLayer('highlighted-building')) {
      map.current.removeLayer('highlighted-building')
      map.current.removeSource('highlighted-building')
    }

    const features = map.current.queryRenderedFeatures(
      map.current.project(coords),
      { layers: ['3d-buildings'] }
    )

    if (features.length > 0) {
      const buildingFeature = features[0]
      setHighlightedBuilding(buildingFeature)

      map.current.addLayer({
        id: 'highlighted-building',
        type: 'fill-extrusion',
        source: {
          type: 'geojson',
          data: buildingFeature.toJSON(),
        },
        paint: {
          'fill-extrusion-color': '#ff6b35',
          'fill-extrusion-height': buildingFeature.properties.height || 20,
          'fill-extrusion-base': buildingFeature.properties.min_height || 0,
          'fill-extrusion-opacity': 0.8,
        },
      })
    }
  }

  const toggle3D = () => {
    setIs3D(prev => !prev)
    if (!map.current.getLayer('3d-buildings')) {
      const layers = map.current.getStyle().layers
      const labelLayerId = layers.find(
        l => l.type === 'symbol' && l.layout['text-field']
      )?.id

      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      )
    }

    map.current.easeTo({
      pitch: !is3D ? 60 : 0,
      duration: 1000,
    })
  }

  const addItem = () => {
    if (!itemName || !quantity || !selectedCoords)
      return alert('Fill in all details and select a location.')

    const newItem = {
      id: Date.now(),
      name: itemName,
      quantity: Number(quantity),
      category,
      coords: selectedCoords,
      apartment: apartmentNumber || 'N/A',
      city: city || 'Unknown',
      street: street || 'Unknown',
      number: number || 'N/A',
      coordsType: coordsType || 'manual',
    }

    setItems([...items, newItem])

    new mapboxgl.Marker({ color: '#ff6b35' })
      .setLngLat(selectedCoords)
      .setPopup(
        new mapboxgl.Popup().setHTML(`
          <strong>${newItem.name}</strong><br/>
          Address: ${newItem.street} ${newItem.number}, ${newItem.city}<br/>
          Apartment: ${newItem.apartment}<br/>
          Qty: ${newItem.quantity}<br/>
          Category: ${newItem.category}
        `)
      )
      .addTo(map.current)

    setItemName('')
    setQuantity('')
    setApartmentNumber('')
  }

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'white',
          padding: 20,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: 300,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h3>📍 Add Inventory Item</h3>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
          💡 Enter city first (e.g., Batumi), then street name will show
          suggestions
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="City (e.g., Batumi, Tbilisi)"
            value={city}
            onChange={e => handleAddressFieldChange('city', e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <input
            type="text"
            placeholder="Street (e.g., Chavchavadze)"
            value={street}
            onChange={e => handleAddressFieldChange('street', e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <input
            type="text"
            placeholder="Number (e.g., 25)"
            value={number}
            onChange={e => handleAddressFieldChange('number', e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 6,
                maxHeight: 200,
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSuggestion(suggestion)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom:
                      idx < suggestions.length - 1 ? '1px solid #eee' : 'none',
                    background:
                      suggestion.type === 'existing' ? '#f0f9ff' : 'white',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background =
                      suggestion.type === 'existing' ? '#e0f2fe' : '#f5f5f5')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background =
                      suggestion.type === 'existing' ? '#f0f9ff' : 'white')
                  }
                >
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {suggestion.type === 'existing' && '📍 '}
                    {suggestion.text}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {suggestion.place_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedCoords && coordsType && (
          <div
            style={{
              fontSize: 11,
              color: coordsType === 'exact' ? '#059669' : '#d97706',
              marginBottom: 10,
              padding: '4px 8px',
              background: coordsType === 'exact' ? '#d1fae5' : '#fef3c7',
              borderRadius: 4,
            }}
          >
            {coordsType === 'exact'
              ? '✓ Exact location'
              : '⚠ Street-level location (enter building # manually)'}
          </div>
        )}
        <button
          onClick={searchAddress}
          style={{ width: '100%', marginBottom: 10 }}
        >
          🔍 Find Location
        </button>
        <button onClick={toggle3D} style={{ width: '100%', marginBottom: 10 }}>
          {is3D ? 'Switch to 2D' : 'Switch to 3D'}
        </button>

        <hr style={{ margin: '15px 0' }} />

        <input
          type="text"
          placeholder="Item name"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Apartment/Unit number (optional)"
          value={apartmentNumber}
          onChange={e => setApartmentNumber(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        >
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="equipment">Equipment</option>
          <option value="supplies">Supplies</option>
        </select>

        <button
          onClick={addItem}
          style={{
            marginTop: 10,
            width: '100%',
            background: '#0080ff',
            color: 'white',
            border: 'none',
            padding: 10,
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          ➕ Add Item
        </button>
      </div>
    </div>
  )
}
