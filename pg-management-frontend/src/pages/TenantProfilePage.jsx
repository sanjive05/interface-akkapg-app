import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, UserRound, Phone, Mail, MapPin, CalendarDays, BedDouble, Utensils, Wallet, LogOut } from 'lucide-react'
import api from '../services/api'

const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const date = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function TenantProfilePage() {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/tenants/${tenantId}`)
      .then(response => { if (active) setTenant(response.data) })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Unable to load tenant profile.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [tenantId])

  if (loading) return <div className="screen-loader">Loading tenant profile…</div>
  if (error) return <div className="profile-error"><p>{error}</p><Link to="/tenants">Back to tenants</Link></div>
  if (!tenant) return null

  const active = tenant.status !== 'VACATED'
  return (
    <div className="tenant-profile-page">
      <Link to="/tenants" className="back-link"><ArrowLeft size={16} /> Back to tenants</Link>
      <div className="profile-heading">
        <div className="profile-identity"><span className="profile-avatar">{tenant.fullName?.slice(0, 1)?.toUpperCase()}</span><div><span className="eyebrow">TENANT PROFILE · {tenant.tenantId}</span><h1>{tenant.fullName}</h1><div className="profile-subline"><span className={`status-pill ${active ? 'active' : 'vacated'}`}>{tenant.status}</span><span>{tenant.roomId ? `Room ${tenant.roomId}` : 'Room not assigned'}</span></div></div></div>
        <button className="primary-button profile-edit-button" onClick={() => navigate('/tenants', { state: { editTenantId: tenant.tenantId } })}><Pencil size={15} /> Edit details</button>
      </div>
      <div className="profile-stat-grid">
        <div className="profile-stat"><span className="summary-icon purple"><Wallet size={17} /></span><small>Monthly rent</small><strong>{money(tenant.monthlyRent)}</strong></div>
        <div className="profile-stat"><span className="summary-icon green"><CalendarDays size={17} /></span><small>Joined on</small><strong>{date(tenant.joiningDate)}</strong></div>
        <div className="profile-stat"><span className="summary-icon blue"><Utensils size={17} /></span><small>Monthly food</small><strong>{String(tenant.foodIncluded).toLowerCase() === 'true' ? money(tenant.monthlyFoodAmount) : 'Not included'}</strong></div>
        <div className="profile-stat"><span className="summary-icon purple"><Wallet size={17} /></span><small>Advance balance</small><strong>{money(Math.max(0, Number(tenant.advanceAmount||0)-Number(tenant.advancePaid||0)))}</strong></div>
      </div>
      <div className="profile-content-grid">
        <section className="profile-panel"><h3>Personal information</h3><div className="detail-grid">
          <div className="detail-item"><UserRound /><div><small>Age / Gender</small><strong>{tenant.age || '—'} / {tenant.gender || '—'}</strong></div></div>
          <div className="detail-item"><Phone /><div><small>Phone number</small><strong>{tenant.phoneNumber || '—'}</strong></div></div>
          <div className="detail-item"><Mail /><div><small>Email address</small><strong>{tenant.email || '—'}</strong></div></div>
          <div className="detail-item"><Phone /><div><small>Emergency contact</small><strong>{tenant.emergencyContact || '—'}</strong></div></div>
          <div className="detail-item full"><MapPin /><div><small>Address</small><strong>{tenant.address || '—'}</strong></div></div>
        </div></section>
        <section className="profile-panel"><h3>Stay information</h3><div className="detail-grid">
          <div className="detail-item"><CalendarDays /><div><small>Joining date</small><strong>{date(tenant.joiningDate)}</strong></div></div>
          <div className="detail-item"><CalendarDays /><div><small>Vacating date</small><strong>{date(tenant.vacatingDate)}</strong></div></div>
          <div className="detail-item"><BedDouble /><div><small>Room / Bed</small><strong>{tenant.roomId || '—'} / {tenant.bedNumber || '—'}</strong></div></div>
          <div className="detail-item"><Wallet /><div><small>Monthly rent</small><strong>{money(tenant.monthlyRent)}</strong></div></div>
          <div className="detail-item"><Wallet /><div><small>Advance agreed / received</small><strong>{money(tenant.advanceAmount)} / {money(tenant.advancePaid)}</strong></div></div>
          <div className="detail-item"><Utensils /><div><small>Monthly food amount</small><strong>{String(tenant.foodIncluded).toLowerCase()==='true' ? money(tenant.monthlyFoodAmount) : 'Not included'}</strong></div></div>
          <div className="detail-item full"><Utensils /><div><small>Food facility</small><strong>{String(tenant.foodIncluded).toLowerCase() === 'true' ? 'Included' : 'Not included'}</strong></div></div>
        </div></section>
      </div>
      <section className="profile-panel profile-notes"><h3>Additional notes</h3><p>{tenant.notes || 'No additional notes added.'}</p></section>
      <div className="profile-history-note">To record a payment, open <Link to="/payments">Payments</Link> and select this tenant’s monthly bill. Tenant records are retained when a resident vacates.</div>
    </div>
  )
}
