const variants = {
  primary: {
    background: '#1a1917',
    color: '#fff',
    border: '1px solid #1a1917',
  },
  secondary: {
    background: 'transparent',
    color: '#1a1917',
    border: '1px solid #d1d0cb',
  },
  danger: {
    background: 'transparent',
    color: '#dc2626',
    border: '1px solid #fca5a5',
  },
  success: {
    background: 'transparent',
    color: '#16a34a',
    border: '1px solid #86efac',
  },
  warning: {
    background: 'transparent',
    color: '#d97706',
    border: '1px solid #fcd34d',
  },
}

export default function Button({ children, variant = 'primary', disabled, onClick, style }) {
  const v = variants[variant] || variants.primary
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        padding: '7px 16px',
        borderRadius: '3px',
        fontSize: '13px',
        fontWeight: 500,
        opacity: disabled ? 0.45 : 1,
        transition: 'opacity 0.15s, transform 0.1s',
        ...style,
      }}
      onMouseEnter={e => !disabled && (e.target.style.opacity = '0.8')}
      onMouseLeave={e => !disabled && (e.target.style.opacity = '1')}
    >
      {children}
    </button>
  )
}
