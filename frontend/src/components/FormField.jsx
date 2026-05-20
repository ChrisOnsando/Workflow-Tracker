export default function FormField({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6a66', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: '12px', color: '#dc2626' }}>{error}</span>}
    </div>
  )
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid #d1d0cb',
  borderRadius: '3px',
  background: '#fafaf8',
  color: '#1a1917',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
  width: '100%',
}

export function Input({ ...props }) {
  return (
    <input
      style={inputStyle}
      onFocus={e => (e.target.style.borderColor = '#1a1917')}
      onBlur={e => (e.target.style.borderColor = '#d1d0cb')}
      {...props}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6a66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px', cursor: 'pointer' }}
      onFocus={e => (e.target.style.borderColor = '#1a1917')}
      onBlur={e => (e.target.style.borderColor = '#d1d0cb')}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ ...props }) {
  return (
    <textarea
      style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
      onFocus={e => (e.target.style.borderColor = '#1a1917')}
      onBlur={e => (e.target.style.borderColor = '#d1d0cb')}
      {...props}
    />
  )
}
