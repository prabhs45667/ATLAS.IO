'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    pannellum?: {
      viewer: (
        container: string | HTMLElement,
        config: Record<string, unknown>
      ) => {
        destroy: () => void
      }
    }
  }
}

interface PanoramaViewerProps {
  src: string
  onLoad?: () => void
}

export function PanoramaViewer({ src, onLoad }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<{ destroy: () => void; on: (event: string, cb: () => void) => void } | null>(null)
  const [loaded, setLoaded] = useState(false)
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad

  useEffect(() => {
    let mounted = true

    async function initViewer() {
      if (!containerRef.current) return

      // Load Pannellum script if not already loaded
      if (!window.pannellum) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src =
            'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Pannellum'))
          document.head.appendChild(script)
        })
      }

      if (!mounted || !containerRef.current || !window.pannellum) return

      // Destroy existing viewer
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }

      // Create viewer
      setLoaded(false)
      viewerRef.current = window.pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: src,
        autoLoad: true,
        showControls: false,
        compass: false,
        mouseZoom: true,
        hfov: 110,
        minHfov: 50,
        maxHfov: 120,
        autoRotate: -1,
        autoRotateInactivityDelay: 3000,
        friction: 0.15,
        yaw: 0,
        pitch: 0,
        backgroundColor: [30, 24, 18],
      })

      // Wait for the actual panorama image to finish loading
      viewerRef.current.on('load', () => {
        if (!mounted) return
        setLoaded(true)
        onLoadRef.current?.()
      })
    }

    initViewer()

    return () => {
      mounted = false
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [src])

  return (
    <div className="absolute inset-0 film-grain vignette">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ backgroundColor: '#1e1812' }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] tracking-[0.15em] text-muted/60 uppercase mt-4">
              Loading panorama
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
