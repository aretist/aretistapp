'use client'

interface Props {
  title: string
}

export default function ShareButton({ title }: Props) {
  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url)
      alert('¡Enlace copiado al portapapeles!')
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        width: '100%',
        padding: '11px',
        background: 'white',
        color: 'var(--text-primary)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-full)',
        fontWeight: 500,
        fontSize: 14,
        fontFamily: 'var(--font)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      Compartir
    </button>
  )
}
