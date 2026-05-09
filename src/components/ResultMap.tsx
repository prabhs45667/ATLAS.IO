'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    L?: typeof import('leaflet')
  }
}

interface ResultMapProps {
  guessLat: number
  guessLng: number
  actualLat: number
  actualLng: number
}

export function ResultMap({
  guessLat,
  guessLng,
  actualLat,
  actualLng,
}: ResultMapProps) {
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

      // Create markers
      const guessIcon = L.divIcon({
        className: 'guess-marker',
        html: `<div style="
          width: 14px;
          height: 14px;
          background: #c06040;
          border: 2px solid #1e1812;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(192, 96, 64, 0.5);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      const actualIcon = L.divIcon({
        className: 'actual-marker',
        html: `<div style="
          width: 12px;
          height: 12px;
          background: #6b9e78;
          border: 2px solid #1e1812;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(107, 158, 120, 0.5);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      L.marker([guessLat, guessLng], { icon: guessIcon }).addTo(mapRef.current)
      L.marker([actualLat, actualLng], { icon: actualIcon }).addTo(mapRef.current)

      // Draw line
      L.polyline([[guessLat, guessLng], [actualLat, actualLng]], {
        color: '#c06040',
        weight: 1.5,
        dashArray: '6, 8',
        opacity: 0.5,
      }).addTo(mapRef.current)

      // Fit bounds
      const bounds = L.latLngBounds(
        [guessLat, guessLng],
        [actualLat, actualLng]
      )
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })

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
  }, [guessLat, guessLng, actualLat, actualLng])

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
