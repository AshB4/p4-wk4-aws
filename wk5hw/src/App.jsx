import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const ENTITY_CONFIG = {
  drivers: {
    title: 'Driver Management',
    subtitle: 'Create, update, and remove driver records from the live fleet roster.',
    endpoint: '/drivers',
    emptyMessage: 'No drivers found. Add the first driver to get started.',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'Jordan Ramirez' },
      { name: 'licenseType', label: 'License Type', placeholder: 'Class A' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'licenseType', label: 'License Type' },
    ],
  },
  vehicles: {
    title: 'Vehicle Management',
    subtitle: 'Maintain the active vehicle catalog connected to the Flask API.',
    endpoint: '/vehicles',
    emptyMessage: 'No vehicles found. Add the first vehicle to get started.',
    fields: [
      { name: 'licensePlate', label: 'License Plate', placeholder: 'TX-4821' },
      { name: 'model', label: 'Model', placeholder: 'Ford Transit 250' },
    ],
    columns: [
      { key: 'licensePlate', label: 'License Plate' },
      { key: 'model', label: 'Model' },
    ],
  },
}

const initialForms = {
  drivers: { name: '', licenseType: '' },
  vehicles: { licensePlate: '', model: '' },
}

function normalizeCollection(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.items)) {
    return data.items
  }

  if (Array.isArray(data?.data)) {
    return data.data
  }

  if (Array.isArray(data?.results)) {
    return data.results
  }

  return []
}

function normalizeEntity(type, entity) {
  if (type === 'drivers') {
    return {
      id: entity.id ?? entity.driver_id ?? entity.driverId,
      name: entity.name ?? entity.driver_name ?? '',
      licenseType: entity.license_type ?? entity.licenseType ?? '',
    }
  }

  return {
    id: entity.id ?? entity.vehicle_id ?? entity.vehicleId,
    licensePlate: entity.license_plate ?? entity.licensePlate ?? '',
    model: entity.model ?? '',
  }
}

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL in a .env file to connect to the EC2 Flask API.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (typeof payload === 'object' && (payload.message || payload.error)) ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`

    throw new Error(message)
  }

  return payload
}

function buildPayload(type, form) {
  if (type === 'drivers') {
    return {
      name: form.name.trim(),
      license_type: form.licenseType.trim(),
    }
  }

  return {
    license_plate: form.licensePlate.trim(),
    model: form.model.trim(),
  }
}

function App() {
  const [records, setRecords] = useState({ drivers: [], vehicles: [] })
  const [forms, setForms] = useState(initialForms)
  const [editingIds, setEditingIds] = useState({ drivers: null, vehicles: null })
  const [activePage, setActivePage] = useState('drivers')
  const [loading, setLoading] = useState({ drivers: true, vehicles: true })
  const [submitting, setSubmitting] = useState({ drivers: false, vehicles: false })
  const [feedback, setFeedback] = useState({ kind: '', message: '' })

  useEffect(() => {
    void Promise.all([loadRecords('drivers'), loadRecords('vehicles')])
  }, [])

  async function loadRecords(type) {
    setLoading((current) => ({ ...current, [type]: true }))

    try {
      const payload = await request(ENTITY_CONFIG[type].endpoint)
      const normalized = normalizeCollection(payload).map((item) => normalizeEntity(type, item))

      setRecords((current) => ({ ...current, [type]: normalized }))
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: `Unable to load ${type}. ${error.message}`,
      })
    } finally {
      setLoading((current) => ({ ...current, [type]: false }))
    }
  }

  function updateForm(type, field, value) {
    setForms((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [field]: value,
      },
    }))
  }

  function resetForm(type) {
    setForms((current) => ({ ...current, [type]: initialForms[type] }))
    setEditingIds((current) => ({ ...current, [type]: null }))
  }

  function startEdit(type, record) {
    setActivePage(type)
    setEditingIds((current) => ({ ...current, [type]: record.id }))
    setForms((current) => ({ ...current, [type]: { ...record } }))
  }

  async function handleSubmit(type, event) {
    event.preventDefault()

    const isEditing = Boolean(editingIds[type])
    const payload = buildPayload(type, forms[type])

    if (Object.values(payload).some((value) => !value)) {
      setFeedback({
        kind: 'error',
        message: 'All form fields are required before submitting.',
      })
      return
    }

    setSubmitting((current) => ({ ...current, [type]: true }))

    try {
      const path = isEditing
        ? `${ENTITY_CONFIG[type].endpoint}/${editingIds[type]}`
        : ENTITY_CONFIG[type].endpoint

      await request(path, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })

      setFeedback({
        kind: 'success',
        message: `${isEditing ? 'Updated' : 'Created'} ${type.slice(0, -1)} successfully.`,
      })
      resetForm(type)
      await loadRecords(type)
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: `Unable to save ${type.slice(0, -1)}. ${error.message}`,
      })
    } finally {
      setSubmitting((current) => ({ ...current, [type]: false }))
    }
  }

  async function handleDelete(type, id) {
    setSubmitting((current) => ({ ...current, [type]: true }))

    try {
      await request(`${ENTITY_CONFIG[type].endpoint}/${id}`, {
        method: 'DELETE',
      })

      setFeedback({
        kind: 'success',
        message: `${type.slice(0, -1)} deleted successfully.`,
      })

      if (editingIds[type] === id) {
        resetForm(type)
      }

      await loadRecords(type)
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: `Unable to delete ${type.slice(0, -1)}. ${error.message}`,
      })
    } finally {
      setSubmitting((current) => ({ ...current, [type]: false }))
    }
  }

  const currentConfig = ENTITY_CONFIG[activePage]

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Week 5 Day 1</p>
          <h1>Fleet Management Console</h1>
          <p className="hero-copy">
            Manage your primary ERD entities from one React interface connected to the live Flask API on EC2.
          </p>
        </div>
        <div className="api-card">
          <span className="status-dot" />
          <div>
            <p className="api-label">API Base URL</p>
            <code>{API_BASE_URL || 'Not configured'}</code>
          </div>
        </div>
      </section>

      <nav className="page-tabs" aria-label="Management pages">
        {Object.entries(ENTITY_CONFIG).map(([key, config]) => (
          <button
            key={key}
            type="button"
            className={key === activePage ? 'tab active' : 'tab'}
            onClick={() => setActivePage(key)}
          >
            {config.title}
          </button>
        ))}
      </nav>

      {feedback.message ? (
        <p className={feedback.kind === 'error' ? 'feedback error' : 'feedback success'}>{feedback.message}</p>
      ) : null}

      <section className="management-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>{currentConfig.title}</h2>
            <p>{currentConfig.subtitle}</p>
          </div>

          <form className="entity-form" onSubmit={(event) => handleSubmit(activePage, event)}>
            {currentConfig.fields.map((field) => (
              <label key={field.name}>
                <span>{field.label}</span>
                <input
                  type="text"
                  value={forms[activePage][field.name]}
                  placeholder={field.placeholder}
                  onChange={(event) => updateForm(activePage, field.name, event.target.value)}
                />
              </label>
            ))}

            <div className="form-actions">
              <button type="submit" disabled={submitting[activePage]}>
                {editingIds[activePage] ? 'Update Record' : 'Add Record'}
              </button>
              {editingIds[activePage] ? (
                <button type="button" className="secondary" onClick={() => resetForm(activePage)}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>{activePage === 'drivers' ? 'Current Drivers' : 'Current Vehicles'}</h2>
            <p>Live data pulled from the REST API.</p>
          </div>

          {loading[activePage] ? (
            <p className="empty-state">Loading records...</p>
          ) : records[activePage].length === 0 ? (
            <p className="empty-state">{currentConfig.emptyMessage}</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {currentConfig.columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records[activePage].map((record) => (
                    <tr key={record.id}>
                      {currentConfig.columns.map((column) => (
                        <td key={column.key}>{record[column.key]}</td>
                      ))}
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => startEdit(activePage, record)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          disabled={submitting[activePage]}
                          onClick={() => handleDelete(activePage, record.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default App
