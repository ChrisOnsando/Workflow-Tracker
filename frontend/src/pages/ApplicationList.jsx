import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { listApplications } from '../api/applications'
import StatusBadge from '../components/StatusBadge'
import Button from '../components/Button'

export default function ApplicationList() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    listApplications()
      .then(setApps)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#6b6a66', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            Workflow Tracker
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}> Applications</h1>
        </div>
        <Button onClick={() => navigate('/applications/new')}>+ New Application</Button>
      </div>

      {loading ? (
        <p style={{ color: '#6b6a66', fontFamily: 'var(--mono)', fontSize: 13 }}>Loading...</p>
      ) : apps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b6a66' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, marginBottom: 16 }}>No applications yet</div>
          <Button onClick={() => navigate('/applications/new')}>Create your first application</Button>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', background: 'var(--surface)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f8f5', borderBottom: '1px solid var(--border)' }}>
                {['Tracking #', 'Applicant', 'Company', 'Type', 'Status', 'Created'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b6a66', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map((app, i) => (
                <tr
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  style={{
                    borderBottom: i < apps.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9f8f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 13, color: '#2563eb', fontWeight: 500 }}>
                    {app.tracking_number}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{app.applicant_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b6a66' }}>{app.company_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{app.application_type}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={app.status} /></td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: '#6b6a66', whiteSpace: 'nowrap' }}>
                    {format(new Date(app.created_at), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
