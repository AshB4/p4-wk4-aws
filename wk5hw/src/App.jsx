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
      { name: 'name', label: 'Name', placeholder: 'Rick Sanchez', type: 'text' },
      { name: 'licenseType', label: 'License Type', placeholder: 'Class A', type: 'text' },
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
      { name: 'licensePlate', label: 'License Plate', placeholder: 'MEE-6', type: 'text' },
      { name: 'model', label: 'Model', placeholder: 'Portal Van', type: 'text' },
    ],
    columns: [
      { key: 'licensePlate', label: 'License Plate' },
      { key: 'model', label: 'Model' },
    ],
  },
  routes: {
    title: 'Delivery Routes',
    subtitle: 'Manage service zones and delivery dates for each route record.',
    endpoint: '/routes',
    emptyMessage: 'No routes found. Create a route before assigning packages.',
    fields: [
      { name: 'serviceZone', label: 'Service Zone', placeholder: 'Citadel Sector 7', type: 'text' },
      { name: 'date', label: 'Date', placeholder: '', type: 'date' },
      { name: 'driverId', label: 'Driver ID', placeholder: '', type: 'select', options: 'drivers' },
    ],
    columns: [
      { key: 'id', label: 'Route ID' },
      { key: 'serviceZone', label: 'Service Zone' },
      { key: 'date', label: 'Date' },
      { key: 'driverId', label: 'Driver ID' },
    ],
  },
  packages: {
    title: 'Package Management',
    subtitle: 'Assign packages to existing routes through a required Route ID link.',
    endpoint: '/packages',
    emptyMessage: 'No packages found. Create a package and link it to a route.',
    fields: [
      { name: 'description', label: 'Description', placeholder: 'Plumbus parts crate', type: 'text' },
      { name: 'weight', label: 'Weight', placeholder: '4.5', type: 'number', min: '0.1', step: '0.1' },
      { name: 'routeId', label: 'Route ID', placeholder: '', type: 'select', options: 'routes' },
    ],
    columns: [
      { key: 'id', label: 'Package ID' },
      { key: 'description', label: 'Description' },
      { key: 'weight', label: 'Weight' },
      { key: 'routeId', label: 'Route ID' },
    ],
  },
}

const initialForms = {
  drivers: { name: '', licenseType: '' },
  vehicles: { licensePlate: '', model: '' },
  routes: { serviceZone: '', date: '', driverId: '' },
  packages: { description: '', weight: '', routeId: '' },
}

function normalizeCollection(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.results)) return data.results
  return []
}

function normalizeEntity(type, entity) {
  switch (type) {
    case 'drivers':
      return {
        id: entity.id ?? entity.driver_id ?? entity.driverId,
        name: entity.name ?? entity.driver_name ?? '',
        licenseType: entity.license_type ?? entity.licenseType ?? '',
      }
    case 'vehicles':
      return {
        id: entity.id ?? entity.vehicle_id ?? entity.vehicleId,
        licensePlate: entity.license_plate ?? entity.licensePlate ?? '',
        model: entity.model ?? '',
      }
    case 'routes':
      return {
        id: entity.id ?? entity.routes_id ?? entity.route_id ?? entity.routeId,
        serviceZone: entity.service_zone ?? entity.serviceZone ?? '',
        date: entity.date ?? '',
        driverId: entity.driver_id?.toString?.() ?? entity.driverId?.toString?.() ?? '',
      }
    case 'packages':
      return {
        id: entity.id ?? entity.package_id ?? entity.packageId,
        description: entity.description ?? '',
        weight: entity.weight?.toString?.() ?? '',
        routeId: entity.route_id?.toString?.() ?? entity.routeId?.toString?.() ?? '',
      }
    default:
      return entity
  }
}

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL in a .env file to connect to the Flask API.')
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
  switch (type) {
    case 'drivers':
      return {
        name: form.name.trim(),
        license_type: form.licenseType.trim(),
      }
    case 'vehicles':
      return {
        license_plate: form.licensePlate.trim(),
        model: form.model.trim(),
      }
    case 'routes':
      return {
        service_zone: form.serviceZone.trim(),
        date: form.date,
        driver_id: Number(form.driverId),
      }
    case 'packages':
      return {
        description: form.description.trim(),
        weight: Number(form.weight),
        route_id: Number(form.routeId),
      }
    default:
      return {}
  }
}

function validateForm(type, form) {
  switch (type) {
    case 'drivers':
      return form.name.trim() && form.licenseType.trim()
    case 'vehicles':
      return form.licensePlate.trim() && form.model.trim()
    case 'routes':
      return form.serviceZone.trim() && form.date && form.driverId
    case 'packages':
      return form.description.trim() && form.weight && Number(form.weight) > 0 && form.routeId
    default:
      return false
  }
}

function App() {
  const [records, setRecords] = useState({
    drivers: [],
    vehicles: [],
    routes: [],
    packages: [],
  })
  const [forms, setForms] = useState(initialForms)
  const [editingIds, setEditingIds] = useState({
    drivers: null,
    vehicles: null,
    routes: null,
    packages: null,
  })
  const [activePage, setActivePage] = useState('drivers')
  const [loading, setLoading] = useState({
    drivers: true,
    vehicles: true,
    routes: true,
    packages: true,
  })
  const [submitting, setSubmitting] = useState({
    drivers: false,
    vehicles: false,
    routes: false,
    packages: false,
  })
  const [feedback, setFeedback] = useState({ kind: '', message: '' })
  const [selectedRouteId, setSelectedRouteId] = useState('')

  useEffect(() => {
    void Promise.all([
      loadRecords('drivers'),
      loadRecords('vehicles'),
      loadRecords('routes'),
      loadRecords('packages'),
    ])
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

  async function refreshLinkedData(type) {
    await loadRecords(type)

    if (type === 'routes') {
      await loadRecords('packages')
    }

    if (type === 'packages') {
      await loadRecords('routes')
    }
  }

  async function handleSubmit(type, event) {
    event.preventDefault()

    if (!validateForm(type, forms[type])) {
      setFeedback({
        kind: 'error',
        message: 'All required fields must be filled in, and linked IDs cannot be left blank.',
      })
      return
    }

    const isEditing = Boolean(editingIds[type])
    const payload = buildPayload(type, forms[type])
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
      await refreshLinkedData(type)
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

      await refreshLinkedData(type)
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: `Unable to delete ${type.slice(0, -1)}. ${error.message}`,
      })
    } finally {
      setSubmitting((current) => ({ ...current, [type]: false }))
    }
  }

  function renderField(type, field) {
    if (field.type === 'select') {
      const options = records[field.options]
      const optionLabel =
        field.options === 'drivers'
          ? (item) => `#${item.id} - ${item.name}`
          : (item) => `#${item.id} - ${item.serviceZone}`

      return (
        <label key={field.name}>
          <span>{field.label}</span>
          <select
            value={forms[type][field.name]}
            onChange={(event) => updateForm(type, field.name, event.target.value)}
          >
            <option value="">Select {field.label}</option>
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {optionLabel(item)}
              </option>
            ))}
          </select>
        </label>
      )
    }

    return (
      <label key={field.name}>
        <span>{field.label}</span>
        <input
          type={field.type}
          min={field.min}
          step={field.step}
          value={forms[type][field.name]}
          placeholder={field.placeholder}
          onChange={(event) => updateForm(type, field.name, event.target.value)}
        />
      </label>
    )
  }

  const currentConfig = ENTITY_CONFIG[activePage]
  const effectiveRouteId =
    selectedRouteId && records.routes.some((route) => route.id?.toString() === selectedRouteId)
      ? selectedRouteId
      : records.routes[0]?.id?.toString?.() ?? ''
  const selectedRoutePackages = records.packages.filter(
    (item) => item.routeId?.toString() === effectiveRouteId,
  )
  const selectedRoute = records.routes.find((item) => item.id?.toString() === effectiveRouteId)

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Week 5 Day 2</p>
          <h1>Fleet Management Console</h1>
          <p className="hero-copy">
            Manage drivers, vehicles, delivery routes, and packages with route-linked package tracking.
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
            {currentConfig.fields.map((field) => renderField(activePage, field))}

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
            <h2>{currentConfig.title} List</h2>
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

      <section className="details-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Route Details</h2>
            <p>Select a route to see every package tied to that Route ID.</p>
          </div>

          {records.routes.length === 0 ? (
            <p className="empty-state">Create a route before viewing route details.</p>
          ) : (
            <>
              <label className="route-picker">
                <span>Route ID</span>
                <select value={effectiveRouteId} onChange={(event) => setSelectedRouteId(event.target.value)}>
                  {records.routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      #{route.id} - {route.serviceZone}
                    </option>
                  ))}
                </select>
              </label>

              {selectedRoute ? (
                <div className="route-summary">
                  <p>
                    <strong>Service Zone:</strong> {selectedRoute.serviceZone}
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedRoute.date}
                  </p>
                  <p>
                    <strong>Driver ID:</strong> {selectedRoute.driverId}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Packages On Selected Route</h2>
            <p>Filtered package records for the chosen Route ID.</p>
          </div>

          {effectiveRouteId === '' ? (
            <p className="empty-state">Select a route to inspect its package list.</p>
          ) : selectedRoutePackages.length === 0 ? (
            <p className="empty-state">No packages are assigned to this route yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Package ID</th>
                    <th>Description</th>
                    <th>Weight</th>
                    <th>Route ID</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRoutePackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>{pkg.id}</td>
                      <td>{pkg.description}</td>
                      <td>{pkg.weight}</td>
                      <td>{pkg.routeId}</td>
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
