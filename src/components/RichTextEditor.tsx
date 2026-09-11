'use client'

import { useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

const EMOJIS = ['😊', '🎭', '🎬', '🎤', '💃', '🕺', '🎵', '🎶', '👏', '⭐', '🌟', '✨', '🔥', '💪', '🎯', '📍', '📅', '💼', '🤝', '❤️']

export default function RichTextEditor({ value, onChange, placeholder = 'Escribe aquí...', minHeight = 120 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')

  function execCommand(command: string, value?: string) {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  function handleInput() {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  function insertEmoji(emoji: string) {
    editorRef.current?.focus()
    document.execCommand('insertText', false, emoji)
    setShowEmojis(false)
    handleInput()
  }

  function insertLink() {
    if (!linkUrl) return
    const text = linkText || linkUrl
    const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #B00020;">${text}</a>`
    document.execCommand('insertHTML', false, html)
    setShowLinkInput(false)
    setLinkUrl('')
    setLinkText('')
    handleInput()
  }

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'var(--bg-highlight)' : 'transparent',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    color: active ? 'var(--red)' : 'var(--text-secondary)',
    fontFamily: 'var(--font)',
  })

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'visible', background: 'white', position: 'relative' }}>

      {/* Barra de herramientas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px 10px', borderBottom: '0.5px solid var(--border)', flexWrap: 'wrap' }}>

        <button type="button" onClick={() => execCommand('bold')} style={btnStyle()} title="Negrita">
          <strong>B</strong>
        </button>

        <button type="button" onClick={() => execCommand('italic')} style={btnStyle()} title="Cursiva">
          <em>I</em>
        </button>

        <button type="button" onClick={() => execCommand('underline')} style={btnStyle()} title="Subrayado">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>

        <div style={{ width: '0.5px', height: 20, background: 'var(--border)', margin: '0 4px' }} />

        <button type="button" onClick={() => execCommand('insertUnorderedList')} style={btnStyle()} title="Lista">
          ≡
        </button>

        <div style={{ width: '0.5px', height: 20, background: 'var(--border)', margin: '0 4px' }} />

        {/* Enlace */}
        <button
          type="button"
          onClick={() => { setShowLinkInput(!showLinkInput); setShowEmojis(false) }}
          style={btnStyle(showLinkInput)}
          title="Insertar enlace"
        >
          🔗
        </button>

        {/* Emojis */}
        <button
          type="button"
          onClick={() => { setShowEmojis(!showEmojis); setShowLinkInput(false) }}
          style={btnStyle(showEmojis)}
          title="Emojis"
        >
          😊
        </button>

      </div>

      {/* Panel de emojis */}
      {showEmojis && (
        <div style={{ padding: '10px', borderBottom: '0.5px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '2px', borderRadius: 4 }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Panel de enlace */}
      {showLinkInput && (
        <div style={{ padding: '10px 12px', borderBottom: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            placeholder="Texto del enlace (opcional)"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-surface)' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertLink()}
              style={{ flex: 1, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-surface)' }}
            />
            <button
              type="button"
              onClick={insertLink}
              disabled={!linkUrl}
              style={{ padding: '7px 14px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font)', cursor: 'pointer', opacity: !linkUrl ? 0.5 : 1 }}
            >
              Insertar
            </button>
          </div>
        </div>
      )}

      {/* Área de texto editable */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={value ? undefined : undefined}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{
          minHeight,
          padding: '12px 14px',
          outline: 'none',
          fontFamily: 'var(--font)',
          fontSize: 15,
          color: 'var(--text-primary)',
          lineHeight: 1.6,
        }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-secondary);
          pointer-events: none;
        }
        [contenteditable] ul {
          padding-left: 20px;
          margin: 4px 0;
        }
        [contenteditable] a {
          color: var(--red);
        }
      `}</style>
    </div>
  )
}
