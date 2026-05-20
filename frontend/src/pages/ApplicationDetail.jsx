import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { getApplication, startReview, submitApplication, recordDecision } from '../api/applications'
import { STATUS } from '../constants'
import StatusBadge from '../components/StatusBadge'
import Button from '../components/Button'
import { Textarea } from '../components/FormField'

function DetailRow({ label, value, mono }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#6b6a66', textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 14, fontFamily: mono ? 'var(--mono)' : undefined }}>{value || '—'}</span>
    </div>
  )
}

function DecisionModal({ onClose, onSubmit }) {
  const [decision, setDecision] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const needsComment = decision === STATUS.REJECTED || decision === STATUS.NEED_MORE_INFO

  const handleSubmit = async () => {
    if (!decision) return setError('Select a decision')
    if (needsComment && !comment.trim()) return setError('A comment is required for this decision')
    setSubmitting(true)
    try {
      await onSubmit({ decision, comment: comment || undefined })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 6, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, letterSpacing: '-0.01em' }}>Record Decision</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: STATUS.APPROVED, label: 'Approve', color: '#16a34a' },
              { value: STATUS.NEED_MORE_INFO, label: 'Need More Info', color: '#7c3aed' },
              { value: STATUS.REJECTED, label: 'Reject', color: '#dc2626' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setDecision(opt.value); setError('') }}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  borderRadius: 3,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: decision === opt.value ? `2px solid ${opt.color}` : '2px solid #e2e1dc',
                  color: decision === opt.value ? opt.color : '#6b6a66',
                  background: decision === opt.value ? opt.color + '10' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b6a66', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>
              Comment {needsComment ? <span style={{ color: '#dc2626' }}>*</span> : '(optional)'}
            </label>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add reviewer notes…" rows={3} />
          </div>

          {error && <p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || !decision}>
              {submitting ? 'Submitting…' : 'Confirm Decision'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [showDecision, setShowDecision] = useState(false)

  const load = () => getApplication(id).then(setApp).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  const act = async fn => {
    setActing(true)
    try { setApp(await fn()) }
    catch (err) { alert(err.response?.data?.detail || 'Action failed') }
    finally { setActing(false) }
  }

  if (loading) return <p style={{ padding: 40, fontFamily: 'var(--mono)', fontSize: 13, color: '#6b6a66' }}>Loading...</p>
  if (!app) return <p style={{ padding: 40 }}>Application not found.</p>

  const { status } = app
  const canEdit = status === STATUS.DRAFT || status === STATUS.NEED_MORE_INFO
  const canSubmit = status === STATUS.DRAFT || status === STATUS.NEED_MORE_INFO
  const canStartReview = status === STATUS.SUBMITTED
  const canDecide = status === STATUS.UNDER_REVIEW

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      {showDecision && (
        <DecisionModal
          onClose={() => setShowDecision(false)}
          onSubmit={data => recordDecision(id, data).then(updated => { setApp(updated); return updated })}
        />
      )}

      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#6b6a66', fontSize: 13, cursor: 'pointer', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← All Applications
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#2563eb', fontWeight: 500, marginBottom: 4 }}>
            {app.tracking_number}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{app.company_name}</h1>
          <p style={{ color: '#6b6a66', fontSize: 14, marginTop: 2 }}>{app.applicant_name} · {app.applicant_email}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Details */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '0 20px', marginBottom: 24 }}>
        <DetailRow label="Application Type" value={app.application_type} />
        <DetailRow label="Description" value={app.description} />
        <DetailRow label="Created" value={format(new Date(app.created_at), 'MMM d, yyyy HH:mm')} mono />
        {app.submitted_at && <DetailRow label="Submitted" value={format(new Date(app.submitted_at), 'MMM d, yyyy HH:mm')} mono />}
        {app.reviewed_at && <DetailRow label="Reviewed" value={format(new Date(app.reviewed_at), 'MMM d, yyyy HH:mm')} mono />}
        {app.reviewer_comment && (
          <DetailRow label="Reviewer Comment" value={
            <span style={{ background: '#fef3c7', padding: '6px 10px', borderRadius: 3, display: 'block', fontSize: 13, border: '1px solid #fde68a' }}>
              {app.reviewer_comment}
            </span>
          } />
        )}
      </div>

      {/* Actions */}
      {(canEdit || canSubmit || canStartReview || canDecide) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {canEdit && (
            <Button variant="secondary" onClick={() => navigate(`/applications/${id}/edit`)}>
              Edit
            </Button>
          )}
          {canSubmit && (
            <Button onClick={() => act(() => submitApplication(id))} disabled={acting}>
              {acting ? 'Submitting…' : 'Submit Application'}
            </Button>
          )}
          {canStartReview && (
            <Button variant="warning" onClick={() => act(() => startReview(id))} disabled={acting}>
              {acting ? 'Starting…' : 'Start Review'}
            </Button>
          )}
          {canDecide && (
            <Button onClick={() => setShowDecision(true)}>Record Decision</Button>
          )}
        </div>
      )}
    </div>
  )
}
