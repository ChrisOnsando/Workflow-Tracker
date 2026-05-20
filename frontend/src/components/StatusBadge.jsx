import { STATUS_COLOR } from '../constants'

export default function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || '#6b7280'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      fontWeight: 500,
      color,
      background: color + '14',
      border: `1px solid ${color}30`,
      borderRadius: '3px',
      padding: '2px 8px',
      fontFamily: 'var(--mono)',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }} />
      {status}
    </span>
  )
}
