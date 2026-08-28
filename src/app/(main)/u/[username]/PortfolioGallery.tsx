'use client'

import { useState } from 'react'

export default function PortfolioGallery({ urls }: { urls: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  function handlePrev() {
    if (selectedIndex === null) return
    setSelectedIndex(selectedIndex === 0 ? urls.length - 1 : selectedIndex - 1)
  }

  function handleNext() {
    if (selectedIndex === null) return
    setSelectedIndex(selectedIndex === urls.length - 1 ? 0 : selectedIndex + 1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setSelectedIndex(null)
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'ArrowRight') handleNext()
  }

  return (
    <>
      {/* Grid de fotos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        {urls.map((url, i) => (
          <div
            key={i}
            onClick={() => setSelectedIndex(i)}
            style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '0.5px solid var(--border)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <img
              src={url}
              alt={`Foto ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Hover overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Cerrar */}
          <button
            onClick={() => setSelectedIndex(null)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: '50%',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>

          {/* Flecha anterior */}
          {urls.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); handlePrev() }}
              style={{
                position: 'absolute',
                left: 16,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'white',
                width: 40,
                height: 40,
                borderRadius: '50%',
                fontSize: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ‹
            </button>
          )}

          {/* Imagen */}
          <img
            src={urls[selectedIndex]}
            alt={`Foto ${selectedIndex + 1}`}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 8,
            }}
          />

          {/* Flecha siguiente */}
          {urls.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); handleNext() }}
              style={{
                position: 'absolute',
                right: 16,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'white',
                width: 40,
                height: 40,
                borderRadius: '50%',
                fontSize: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ›
            </button>
          )}

          {/* Contador */}
          {urls.length > 1 && (
            <p style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
              fontFamily: 'var(--font)',
            }}>
              {selectedIndex + 1} / {urls.length}
            </p>
          )}
        </div>
      )}
    </>
  )
}
