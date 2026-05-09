'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    L?: typeof import('leaflet')
  }
}

interface GuessMapProps {
  onGuess: (lat: number, lng: number) => void
  guessLat: number | null
  guessLng: number | null
}

export function GuessMap({ onGuess, guessLat, guessLng }: GuessMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
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
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 18 }
      ).addTo(mapRef.current)

      // Click handler
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        onGuess(e.latlng.lat, e.latlng.lng)
      })

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
  }, [onGuess])

  // Update marker when guess changes
  useEffect(() => {
    if (!mapRef.current || !window.L || guessLat === null || guessLng === null)
      return

    const L = window.L

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove()
    }

    // Create guess marker
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

    markerRef.current = L.marker([guessLat, guessLng], { icon: guessIcon }).addTo(
      mapRef.current
    )
  }, [guessLat, guessLng])

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
