'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    L?: typeof import('leaflet')
  }
}

interface GuessMarker {
  lat: number
  lng: number
  color: string
  name: string
}

interface MultiplayerResultMapProps {
  actualLat: number
  actualLng: number
  guessMarkers: GuessMarker[]
}

export function MultiplayerResultMap({
  actualLat,
  actualLng,
  guessMarkers,
}: MultiplayerResultMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    async function initMap() {
      if (!containerRef.current) return

      // Load Leaflet script if not already loaded
      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Leaflet'))
          document.head.appendChild(script)
        })
      }

      if (!mounted || !containerRef.current || !window.L) return

      const L = window.L

      // Create map
      mapRef.current = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 18 }
      ).addTo(mapRef.current)

      // Create actual location marker (cream/white)
      const actualIcon = L.divIcon({
        className: 'actual-marker',
        html: `<div style="
          width: 14px;
          height: 14px;
          background: #ebe3d4;
          border: 2px solid #1e1812;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(235, 227, 212, 0.5);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      L.marker([actualLat, actualLng], { icon: actualIcon }).addTo(mapRef.current)

      // Create guess markers and lines
      const allPoints: [number, number][] = [[actualLat, actualLng]]

      guessMarkers.forEach((marker) => {
        const guessIcon = L.divIcon({
          className: 'guess-marker',
          html: `<div style="
            width: 12px;
            height: 12px;
            background: ${marker.color};
            border: 2px solid #1e1812;
            border-radius: 50%;
            box-shadow: 0 0 8px ${marker.color}80;
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })

        L.marker([marker.lat, marker.lng], { icon: guessIcon }).addTo(mapRef.current!)

        // Draw dashed line to actual location
        L.polyline([[marker.lat, marker.lng], [actualLat, actualLng]], {
          color: marker.color,
          weight: 1.5,
          dashArray: '6, 8',
          opacity: 0.5,
        }).addTo(mapRef.current!)

        allPoints.push([marker.lat, marker.lng])
      })

      // Fit bounds to show all points
      if (allPoints.length > 1) {
        const bounds = L.latLngBounds(allPoints)
        mapRef.current.fitBounds(bounds, { padding: [40, 40] })
      } else {
        mapRef.current.setView([actualLat, actualLng], 4)
      }

      setLoaded(true)
    }

    initMap()

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [actualLat, actualLng, guessMarkers])

  return (
    <div className="relative w-full h-full vintage-map">
      <div ref={containerRef} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
