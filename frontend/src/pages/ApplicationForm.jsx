import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createApplication, getApplication, updateApplication } from '../api/applications'
import { APPLICATION_TYPES } from '../constants'
import Button from '../components/Button'
import FormField, { Input, Select, Textarea } from '../components/FormField'

const empty = {
  applicant_name: '',
  applicant_email: '',
  company_name: '',
  application_type: '',
  description: '',
}

export default function ApplicationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    getApplication(id)
      .then(app => setForm({
        applicant_name: app.applicant_name,
        applicant_email: app.applicant_email,
        company_name: app.company_name,
        application_type: app.application_type,
        description: app.description,
      }))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.applicant_name.trim()) e.applicant_name = 'Required'
    if (!form.applicant_email.trim()) e.applicant_email = 'Required'
    if (!form.company_name.trim()) e.company_name = 'Required'
    if (!form.application_type) e.application_type = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await updateApplication(id, form)
        navigate(`/applications/${id}`)
      } else {
        const app = await createApplication(form)
        navigate(`/applications/${app.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ padding: 40, fontFamily: 'var(--mono)', fontSize: 13, color: '#6b6a66' }}>Loading...</p>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
      <button
        onClick={() => navigate(isEdit ? `/applications/${id}` : '/')}
        style={{ background: 'none', border: 'none', color: '#6b6a66', fontSize: 13, cursor: 'pointer', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 32 }}>
        {isEdit ? 'Edit Application' : 'New Application'}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField label="Applicant Name" error={errors.applicant_name}>
          <Input value={form.applicant_name} onChange={set('applicant_name')} placeholder="Full name" />
        </FormField>

        <FormField label="Applicant Email" error={errors.applicant_email}>
          <Input type="email" value={form.applicant_email} onChange={set('applicant_email')} placeholder="email@example.com" />
        </FormField>

        <FormField label="Company Name" error={errors.company_name}>
          <Input value={form.company_name} onChange={set('company_name')} placeholder="Company or organisation" />
        </FormField>

        <FormField label="Application Type" error={errors.application_type}>
          <Select value={form.application_type} onChange={set('application_type')}>
            <option value="">Select application type…</option>
            {APPLICATION_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Description" error={errors.description}>
          <Textarea value={form.description} onChange={set('description')} placeholder="Describe the application in detail…" rows={5} />
        </FormField>

        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Draft'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(isEdit ? `/applications/${id}` : '/')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
