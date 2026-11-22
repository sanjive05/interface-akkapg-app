import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Search, Users, Pencil, Eye, X, UserRound, Phone, Mail, CalendarDays, BedDouble, Utensils, RefreshCw } from 'lucide-react'
import api from '../services/api'

const emptyForm = {
  fullName: '', age: '', gender: 'Male', phoneNumber: '', email: '', address: '',
  emergencyContact: '', joiningDate: new Date().toISOString().slice(0, 10),
  vacatingDate: '', roomId: '', bedNumber: '', monthlyRent: '', monthlyFoodAmount: '0', advanceAmount: '0', advancePaid: '0',
  foodIncluded: false, status: 'ACTIVE', notes: ''
}

const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const displayDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN') : '—'

export default function TenantsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [sortBy, setSortBy] = useState('joined_desc')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadTenants = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/tenants', { params: { search, status } })
      setTenants(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tenant records.')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => { loadTenants() }, [loadTenants])
  useEffect(() => { api.get('/rooms').then(r => setRooms(r.data)).catch(() => setRooms([])) }, [])

  useEffect(() => {
    const editId = location.state?.editTenantId
    if (editId && tenants.length) {
      const found = tenants.find(t => t.tenantId === editId)
      if (found) openEdit(found)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, tenants, navigate])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(tenant) {
    setEditing(tenant)
    setForm({
      ...emptyForm,
      ...tenant,
      age: tenant.age || '',
      monthlyRent: tenant.monthlyRent || '', monthlyFoodAmount: tenant.monthlyFoodAmount || '0', advanceAmount: tenant.advanceAmount || '0', advancePaid: tenant.advancePaid || '0',
      foodIncluded: String(tenant.foodIncluded).toLowerCase() === 'true',
      status: tenant.status || 'ACTIVE'
    })
    setError('')
    setModalOpen(true)
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      age: Number(form.age),
      monthlyRent: Number(form.monthlyRent), monthlyFoodAmount: Number(form.monthlyFoodAmount || 0), advanceAmount: Number(form.advanceAmount || 0), advancePaid: Number(form.advancePaid || 0),
      vacatingDate: form.vacatingDate || null,
      foodIncluded: Boolean(form.foodIncluded),
      roomId: form.roomId.trim(),
      bedNumber: form.bedNumber.trim()
    }
    try {
      if (editing) {
        await api.put(`/tenants/${editing.tenantId}`, payload)
        setNotice('Tenant details updated successfully.')
      } else {
        await api.post('/tenants', payload)
        setNotice('Tenant added successfully.')
      }
      setModalOpen(false)
      await loadTenants()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save tenant. Please check the entered details.')
    } finally {
      setSaving(false)
    }
  }

  const activeCount = tenants.filter(t => t.status === 'ACTIVE').length
  const vacatedCount = tenants.filter(t => t.status === 'VACATED').length
  const roomNumberById = Object.fromEntries(rooms.map(room => [room.roomId, room.roomNumber]))
  const sortedTenants = [...tenants].sort((a, b) => {
    const roomA = roomNumberById[a.roomId] || a.roomId || ''
    const roomB = roomNumberById[b.roomId] || b.roomId || ''
    switch (sortBy) {
      case 'joined_asc': return (a.joiningDate || '').localeCompare(b.joiningDate || '')
      case 'joined_desc': return (b.joiningDate || '').localeCompare(a.joiningDate || '')
      case 'room_asc': return roomA.localeCompare(roomB, undefined, { numeric: true }) || (a.fullName || '').localeCompare(b.fullName || '')
      case 'room_desc': return roomB.localeCompare(roomA, undefined, { numeric: true })
      case 'name_asc': return (a.fullName || '').localeCompare(b.fullName || '')
      case 'name_desc': return (b.fullName || '').localeCompare(a.fullName || '')
      default: return 0
    }
  })

  return (
    <div className="tenant-page">
      <div className="page-heading-row tenant-heading">
        <div><span className="eyebrow">RESIDENT DIRECTORY</span><h1>Tenants</h1><p>Manage resident profiles, room assignments and occupancy details.</p></div>
        <button className="primary-button add-tenant-button" onClick={openCreate}><Plus size={17} /> Add tenant</button>
      </div>

      {notice && <div className="success-banner">{notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
      {error && !modalOpen && <div className="form-error page-error">{error}<button onClick={() => setError('')}><X size={15} /></button></div>}

      <div className="tenant-summary">
        <div className="tenant-summary-card"><span className="summary-icon purple"><Users size={18} /></span><div><small>Showing records</small><strong>{tenants.length}</strong></div></div>
        <div className="tenant-summary-card"><span className="summary-icon green"><UserRound size={18} /></span><div><small>Active in current view</small><strong>{activeCount}</strong></div></div>
        <div className="tenant-summary-card"><span className="summary-icon gray"><BedDouble size={18} /></span><div><small>Vacated in current view</small><strong>{vacatedCount}</strong></div></div>
      </div>

      <section className="tenant-table-panel">
        <div className="table-toolbar">
          <div><h3>All tenants</h3><p>Search and manage your PG residents.</p></div>
          <div className="tenant-filters">
            <div className="search-box"><Search size={16} /><input aria-label="Search tenants" placeholder="Search name, phone, room..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <select aria-label="Filter tenant status" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="ALL">All status</option><option value="ACTIVE">Active</option><option value="VACATED">Vacated</option>
            </select>
            <select aria-label="Sort tenants" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="joined_desc">Joined date: newest</option><option value="joined_asc">Joined date: oldest</option>
              <option value="room_asc">Room: low to high</option><option value="room_desc">Room: high to low</option>
              <option value="name_asc">Name: A–Z</option><option value="name_desc">Name: Z–A</option>
            </select>
            <button className="refresh-button" onClick={loadTenants} title="Refresh"><RefreshCw size={16} /></button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="tenant-table">
            <thead><tr><th>TENANT</th><th>ROOM / BED</th><th>PHONE</th><th>JOINED ON</th><th>MONTHLY RENT</th><th>FOOD</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="8" className="table-state">Loading tenant records…</td></tr> :
                tenants.length === 0 ? <tr><td colSpan="8" className="table-state"><div className="empty-state"><Users size={25} /><strong>No tenants found</strong><span>Add your first tenant or change the search filters.</span></div></td></tr> :
                sortedTenants.map(tenant => (
                  <tr key={tenant.tenantId}>
                    <td><div className="tenant-name-cell"><span className="tenant-avatar">{tenant.fullName?.slice(0, 1)?.toUpperCase()}</span><div><strong>{tenant.fullName}</strong><small>{tenant.tenantId}</small></div></div></td>
                    <td>{roomNumberById[tenant.roomId] || tenant.roomId || '—'}{tenant.bedNumber ? <small className="cell-subtext">Bed {tenant.bedNumber}</small> : null}</td>
                    <td>{tenant.phoneNumber}</td>
                    <td>{displayDate(tenant.joiningDate)}</td>
                    <td className="rent-cell">{money(tenant.monthlyRent)}</td>
                    <td><span className={`food-pill ${String(tenant.foodIncluded).toLowerCase() === 'true' ? 'yes' : 'no'}`}>{String(tenant.foodIncluded).toLowerCase() === 'true' ? 'Included' : 'No food'}</span></td>
                    <td><span className={`status-pill ${tenant.status === 'VACATED' ? 'vacated' : 'active'}`}>{tenant.status || 'ACTIVE'}</span></td>
                    <td><div className="row-actions"><Link className="table-icon-button" to={`/tenants/${tenant.tenantId}`} title="View profile"><Eye size={16} /></Link><button className="table-icon-button" onClick={() => openEdit(tenant)} title="Edit tenant"><Pencil size={15} /></button></div></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {tenants.length} tenant record{tenants.length === 1 ? '' : 's'} <span>Records are saved in tenants.xlsx</span></div>
      </section>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <section className="tenant-modal" role="dialog" aria-modal="true" aria-labelledby="tenant-modal-title">
            <div className="modal-header"><div><span className="eyebrow">{editing ? 'UPDATE RESIDENT' : 'NEW RESIDENT'}</span><h2 id="tenant-modal-title">{editing ? 'Edit tenant' : 'Add a tenant'}</h2><p>Enter the resident's personal and stay details.</p></div><button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close"><X size={19} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">Personal information</div>
              <div className="form-grid">
                <label className="field full">Full name *<input name="fullName" value={form.fullName} onChange={updateField} maxLength="120" required placeholder="Enter full name" /></label>
                <label className="field">Age *<input name="age" type="number" min="1" max="120" value={form.age} onChange={updateField} required /></label>
                <label className="field">Gender *<select name="gender" value={form.gender} onChange={updateField} required><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select></label>
                <label className="field">Phone number *<input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={updateField} required maxLength="20" placeholder="Mobile number" /></label>
                <label className="field">Email address<input name="email" type="email" value={form.email} onChange={updateField} maxLength="150" placeholder="name@example.com" /></label>
                <label className="field full">Address<textarea name="address" value={form.address} onChange={updateField} rows="2" maxLength="500" placeholder="Permanent address" /></label>
                <label className="field">Emergency contact<input name="emergencyContact" value={form.emergencyContact} onChange={updateField} maxLength="30" /></label>
              </div>
              <div className="form-section-title">Stay and room details</div>
              <div className="form-grid">
                <label className="field">Joining date *<input name="joiningDate" type="date" value={form.joiningDate} onChange={updateField} required /></label>
                <label className="field">Vacating date<input name="vacatingDate" type="date" value={form.vacatingDate} onChange={updateField} /></label>
                <label className="field">Room<select name="roomId" value={form.roomId} onChange={updateField}><option value="">Not assigned</option>{rooms.map(room => <option key={room.roomId} value={room.roomId}>{room.roomNumber} ({room.availableBeds} beds free)</option>)}</select></label>
                <label className="field">Bed number<input name="bedNumber" value={form.bedNumber} onChange={updateField} maxLength="20" placeholder="e.g. B1" /></label>
                <label className="field">Monthly rent (₹) *<input name="monthlyRent" type="number" min="0" step="0.01" value={form.monthlyRent} onChange={updateField} required placeholder="6000" /></label>
                <label className="field">Monthly food amount (₹)<input name="monthlyFoodAmount" type="number" min="0" step="0.01" value={form.monthlyFoodAmount} onChange={updateField} disabled={!form.foodIncluded} /></label>
                <label className="field">Agreed advance (₹)<input name="advanceAmount" type="number" min="0" step="0.01" value={form.advanceAmount} onChange={updateField} /></label>
                <label className="field">Advance received (₹)<input name="advancePaid" type="number" min="0" step="0.01" value={form.advancePaid} onChange={updateField} /></label>
                <label className="field">Tenant status<select name="status" value={form.status} onChange={updateField}><option value="ACTIVE">Active</option><option value="VACATED">Vacated</option></select></label>
                <label className="field checkbox-field"><input name="foodIncluded" type="checkbox" checked={form.foodIncluded} onChange={e => { updateField(e); if (!e.target.checked) setForm(current => ({...current, foodIncluded:false, monthlyFoodAmount:"0"})) }} /><span><Utensils size={15} /> Food included</span></label>
                <label className="field full">Additional notes<textarea name="notes" value={form.notes} onChange={updateField} rows="2" maxLength="1000" placeholder="Any additional information..." /></label>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create tenant'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
