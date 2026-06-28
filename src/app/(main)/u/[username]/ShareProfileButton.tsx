'use client'

export default function ShareProfileButton({ username }: { username: string }) {
  function handleShare() {
    navigator.clipboard.writeText(`aretist.es/${username}`)
      .then(() => alert('¡Enlace copiado!'))
      .catch(() => {})
  }

  return (
    <button
      onClick={handleShare}
      style={{
        width: '100%',
        padding: '13px 20px',
        background: 'var(--bg-highlight)',
        color: 'var(--red)',
        border: '1.5px solid var(--red)',
        borderRadius: 'var(--radius-full)',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'var(--font)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      Compartir mi perfil → aretist.es/{username}
    </button>
  )
}
