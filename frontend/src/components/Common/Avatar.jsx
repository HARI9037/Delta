import { useState } from 'react'

export default function Avatar({ src, name, size = 36, className = '', style = {} }) {
  const [imgError, setImgError] = useState(false)

  const initials = name
    ? name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : ''

  const containerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#0B174E',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: size * 0.4,
    ...style,
  }

  if (src && !imgError) {
    return (
      <div className={`avatar-container ${className}`} style={containerStyle}>
        <img
          src={src}
          alt={name || 'Avatar'}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    )
  }

  return (
    <div className={`avatar-container ${className}`} style={containerStyle}>
      {initials ? initials : <i className="bi bi-person-fill" style={{ fontSize: size * 0.5 }}></i>}
    </div>
  )
}
