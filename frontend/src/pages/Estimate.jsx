import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/PalmExitLogo.png'
import Navigation from '../components/Navigation.jsx'

const API = 'http://localhost:5000/api'
const YELLOW = '#FFD329'
const BTN = {
  backgroundColor:'#333', color:YELLOW, padding:'10px 14px', border:'none', borderRadius:8, fontWeight:'bold', cursor:'pointer'
}

export default function Estimate(){
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [parts, setParts] = useState([])
  const [labor, setLabor] = useState([])

  const [customerId, setCustomerId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [partRows, setPartRows] = useState([])   // {part_id, qty}
  const [laborRows, setLaborRows] = useState([]) // {labor_id, qty}
  const [taxRate, setTaxRate] = useState(0.0825) // 8.25% default; adjust for your city
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showEstimateModal, setShowEstimateModal] = useState(false)
  const [createdWorkOrderId, setCreatedWorkOrderId] = useState(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signature, setSignature] = useState('')
  const [signingCustomerName, setSigningCustomerName] = useState('')

  // load catalogs
  useEffect(() => {
    Promise.all([
      fetch(`${API}/customers`).then(r=>r.json()),
      fetch(`${API}/vehicles`).then(r=>r.json()),
      fetch(`${API}/parts`).then(r=>r.json()),
      fetch(`${API}/labor`).then(r=>r.json()),
    ]).then(([c,v,p,l]) => { setCustomers(c); setVehicles(v); setParts(p); setLabor(l) })
    .catch(err => {
      console.error('Error loading data:', err);
      // Set some fallback empty arrays in case API is not ready
      setCustomers([]);
      setVehicles([]);
      setParts([]);
      setLabor([]);
    });
  }, [])

  const customerVehicles = useMemo(() => vehicles.filter(v => String(v.customer_id) === String(customerId)), [vehicles, customerId])

  const addPartRow = () => setPartRows([...partRows, { part_id:'', qty:1 }])
  const addLaborRow = () => setLaborRows([...laborRows, { labor_id:'', qty:1 }])

  const removePartRow = i => setPartRows(partRows.filter((_,idx)=>idx!==i))
  const removeLaborRow = i => setLaborRows(laborRows.filter((_,idx)=>idx!==i))

  const cents = n => Math.round(n)
  const sumPartsCents = useMemo(() => partRows.reduce((acc, row) => {
    const p = parts.find(x => String(x.part_id) === String(row.part_id))
    const q = Number(row.qty || 0)
    return acc + (p ? cents(p.cost_cents) * q : 0)
  }, 0), [partRows, parts])

  const sumLaborCents = useMemo(() => laborRows.reduce((acc, row) => {
    const L = labor.find(x => String(x.labor_id) === String(row.labor_id))
    const q = Number(row.qty || 0)
    return acc + (L ? cents(L.labor_cost_cents) * q : 0)
  }, 0), [laborRows, labor])

  const subtotalCents = sumPartsCents + sumLaborCents
  const taxCents = Math.round(subtotalCents * Number(taxRate))
  const totalCents = subtotalCents + taxCents

  const money = c => `$${(c/100).toFixed(2)}`

  const clearForm = () => {
    setCustomerId('')
    setVehicleId('')
    setPartRows([])
    setLaborRows([])
    setTaxRate(0.0825)
    setNotes('')
  }

  const saveEstimate = async () => {
    if (!customerId && customerId !== 'estimate-only') {
      alert('Please select a customer or use "Estimate Only" option')
      return
    }
    if (!vehicleId && customerId !== 'estimate-only') {
      alert('Please select a vehicle')
      return
    }
    if (partRows.length === 0 && laborRows.length === 0) {
      alert('Please add at least one part or labor item')
      return
    }

    setSaving(true)
    try {
      // Prepare parts data with cost lookup
      const partsData = partRows.map(row => {
        const part = parts.find(p => String(p.part_id) === String(row.part_id))
        return {
          part_id: row.part_id,
          quantity: Number(row.qty),
          cost_cents: part ? part.cost_cents : 0
        }
      }).filter(p => p.part_id && p.quantity > 0)

      // Prepare labor data with cost lookup
      const laborData = laborRows.map(row => {
        const laborItem = labor.find(l => String(l.labor_id) === String(row.labor_id))
        return {
          labor_id: row.labor_id,
          quantity: Number(row.qty),
          cost_cents: laborItem ? laborItem.labor_cost_cents : 0
        }
      }).filter(l => l.labor_id && l.quantity > 0)

      const payload = {
        customer_id: customerId === 'estimate-only' ? null : customerId,
        vehicle_id: customerId === 'estimate-only' ? null : vehicleId,
        parts: partsData,
        labor: laborData,
        tax_rate: Number(taxRate),
        notes: notes,
        is_estimate: true
      }

      const response = await fetch(`${API}/work-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save estimate')
      }

      const result = await response.json()
      setCreatedWorkOrderId(result.work_order_id)
      setShowEstimateModal(true)
    } catch (error) {
      console.error('Error saving estimate:', error)
      alert('Error saving estimate: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCustomerChange = (value) => {
    if (value === 'new-customer') {
      window.open('/customer/new', '_blank', 'noopener,noreferrer')
      return
    }
    setCustomerId(value)
    setVehicleId('')
  }

  const handleKeepAsEstimate = () => {
    setShowEstimateModal(false)
    alert(`Estimate saved successfully! Work Order ID: ${createdWorkOrderId}`)
    const shouldClear = confirm('Estimate saved! Would you like to clear the form for a new estimate?')
    if (shouldClear) {
      clearForm()
    }
  }

  const handleConvertToWorkOrder = () => {
    setShowEstimateModal(false)
    // Get customer name for signature
    const customer = customers.find(c => String(c.customer_id) === String(customerId))
    if (customer) {
      setSigningCustomerName(`${customer.first_name} ${customer.last_name}`)
    } else {
      setSigningCustomerName('')
    }
    setShowSignatureModal(true)
  }

  const handleSignatureSubmit = async () => {
    if (!signature.trim() && !signingCustomerName.trim()) {
      alert('Please provide either a drawn signature or typed name')
      return
    }

    try {
      const response = await fetch(`${API}/work-orders/${createdWorkOrderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: signature.trim() || `Typed: ${signingCustomerName.trim()}`,
          customer_name: signingCustomerName.trim() || 'Customer'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve work order')
      }

      setShowSignatureModal(false)
      alert(`Work Order #${createdWorkOrderId} has been approved and is ready to begin!`)
      
      const shouldClear = confirm('Work order approved! Would you like to clear the form for a new estimate?')
      if (shouldClear) {
        clearForm()
        setSignature('')
        setSigningCustomerName('')
      }
    } catch (error) {
      console.error('Error approving work order:', error)
      alert('Error approving work order: ' + error.message)
    }
  }

  return (
    <div style={{ background:'black', minHeight:'100vh', color:YELLOW }}>
      <Navigation />
      <div style={{ padding:'24px' }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <h1 style={{margin:0, color:YELLOW}}>Create Estimate</h1>
        </div>

      {/* Customer & Vehicle */}
      <section style={{border:'1px solid #444', borderRadius:12, padding:16, marginBottom:16}}>
        <h2 style={{marginTop:0, color:YELLOW}}>Customer & Vehicle</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>Customer</label>
            <select value={customerId} onChange={e=>handleCustomerChange(e.target.value)} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}>
              <option value="">Select customer…</option>
              <option value="estimate-only" style={{fontStyle:'italic'}}>Estimate Only</option>
              <option value="new-customer" style={{fontStyle:'italic'}}>Add New Customer</option>
              <option disabled style={{color:'#666'}}>─────────────────</option>
              {customers.map(c => (
                <option key={c.customer_id} value={c.customer_id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>Vehicle</label>
            <select value={vehicleId} onChange={e=>setVehicleId(e.target.value)} disabled={!customerId || customerId === 'estimate-only'} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}>
              <option value="">
                {customerId === 'estimate-only' ? 'No vehicle (estimate only)' : 
                 customerId ? 'Select vehicle…' : 'Choose customer first'}
              </option>
              {customerId !== 'estimate-only' && customerVehicles.map(v => (
                <option key={v.vehicle_id} value={v.vehicle_id}>{`${v.year} ${v.make} ${v.model}`}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Parts */}
      <section style={{border:'1px solid #444', borderRadius:12, padding:16, marginBottom:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{margin:0, color:YELLOW}}>Parts</h2>
          <button style={BTN} onClick={addPartRow}>+ Add Part</button>
        </div>
        {partRows.length === 0 && <div style={{opacity:0.7, marginTop:8}}>No parts yet.</div>}
        {partRows.map((row, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12, marginTop:12}}>
            <select value={row.part_id} onChange={e=>{
              const next=[...partRows]; next[i]={...row, part_id:e.target.value}; setPartRows(next)
            }} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}>
              <option value="">Select part…</option>
              {parts.map(p => (
                <option key={p.part_id} value={p.part_id}>{`${p.brand} • ${p.item} (${money(p.cost_cents)})`}</option>
              ))}
            </select>
            <input type="number" min="1" value={row.qty} onChange={e=>{
              const next=[...partRows]; next[i]={...row, qty:e.target.value}; setPartRows(next)
            }} style={{background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}/>
            <button style={{...BTN, backgroundColor:'#552'}} onClick={()=>removePartRow(i)}>Remove</button>
          </div>
        ))}
      </section>

      {/* Labor */}
      <section style={{border:'1px solid #444', borderRadius:12, padding:16, marginBottom:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{margin:0, color:YELLOW}}>Labor</h2>
          <button style={BTN} onClick={addLaborRow}>+ Add Labor</button>
        </div>
        {laborRows.length === 0 && <div style={{opacity:0.7, marginTop:8}}>No labor yet.</div>}
        {laborRows.map((row, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12, marginTop:12}}>
            <select value={row.labor_id} onChange={e=>{
              const next=[...laborRows]; next[i]={...row, labor_id:e.target.value}; setLaborRows(next)
            }} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}>
              <option value="">Select labor…</option>
              {labor.map(L => (
                <option key={L.labor_id} value={L.labor_id}>{`${L.labor_name} (${money(L.labor_cost_cents)})`}</option>
              ))}
            </select>
            <input type="number" step="0.25" min="0.25" value={row.qty} onChange={e=>{
              const next=[...laborRows]; next[i]={...row, qty:e.target.value}; setLaborRows(next)
            }} style={{background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}/>
            <button style={{...BTN, backgroundColor:'#552'}} onClick={()=>removeLaborRow(i)}>Remove</button>
          </div>
        ))}
      </section>

      {/* Notes & Totals */}
      <section style={{border:'1px solid #444', borderRadius:12, padding:16, marginBottom:16}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 300px', gap:24}}>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>Notes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={8} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333', resize:'vertical'}} />
          </div>
          <div style={{minWidth:'300px'}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>Tax Rate</label>
            <input type="number" step="0.0001" value={taxRate} onChange={e=>setTaxRate(e.target.value)} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}/>

            <div style={{marginTop:16, borderTop:'1px solid #333', paddingTop:12, background:'#111', padding:'12px', borderRadius:8}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span>Parts:</span><strong>{money(sumPartsCents)}</strong></div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span>Labor:</span><strong>{money(sumLaborCents)}</strong></div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span>Subtotal:</span><strong>{money(subtotalCents)}</strong></div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span>Tax:</span><strong>{money(taxCents)}</strong></div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:22, marginTop:8, borderTop:'1px solid #333', paddingTop:8}}><span>Total:</span><strong style={{color:'#FFD329'}}>{money(totalCents)}</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
        <button style={BTN} onClick={()=>window.print()}>Print</button>
        <button 
          style={{...BTN, backgroundColor: saving ? '#666' : '#2a7c2a'}} 
          onClick={saveEstimate}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Estimate'}
        </button>
        <button 
          style={{...BTN, backgroundColor:'#c54545'}} 
          onClick={() => {
            const confirmed = confirm('Are you sure you want to clear the entire form?')
            if (confirmed) clearForm()
          }}
        >
          Clear Form
        </button>
      </div>
      
      {/* Estimate Decision Modal */}
      {showEstimateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#222',
            border: '2px solid #FFD329',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            color: '#FFD329'
          }}>
            <h2 style={{ marginTop: 0, color: '#FFD329', textAlign: 'center' }}>
              Estimate Created Successfully!
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.5', textAlign: 'center' }}>
              Work Order #{createdWorkOrderId} has been created as an estimate.
              What would you like to do next?
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              marginTop: '25px'
            }}>
              <button
                onClick={handleKeepAsEstimate}
                style={{
                  ...BTN,
                  backgroundColor: '#666',
                  fontSize: '16px',
                  padding: '12px 20px'
                }}
              >
                Keep as Estimate
              </button>
              <button
                onClick={handleConvertToWorkOrder}
                style={{
                  ...BTN,
                  backgroundColor: '#2a7c2a',
                  fontSize: '16px',
                  padding: '12px 20px'
                }}
                disabled={customerId === 'estimate-only'}
              >
                {customerId === 'estimate-only' ? 'Requires Customer' : 'Convert to Work Order'}
              </button>
            </div>
            {customerId === 'estimate-only' && (
              <p style={{
                fontSize: '12px',
                color: '#ccc',
                textAlign: 'center',
                marginTop: '10px',
                fontStyle: 'italic'
              }}>
                Work orders require a selected customer for signature capture
              </p>
            )}
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#222',
            border: '2px solid #FFD329',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            color: '#FFD329'
          }}>
            <h2 style={{ marginTop: 0, color: '#FFD329', textAlign: 'center' }}>
              Customer Authorization Required
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.5', textAlign: 'center', marginBottom: '25px' }}>
              To convert this estimate to an approved work order, we need the customer's authorization.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Customer Name (for signature)
              </label>
              <input
                type="text"
                value={signingCustomerName}
                onChange={(e) => setSigningCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#111',
                  color: '#FFD329',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  fontSize: '16px'
                }}
                placeholder="Enter customer's full name"
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Digital Signature (Optional - customer can type their name above instead)
              </label>
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: '#111',
                  color: '#FFD329',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  fontSize: '16px',
                  fontFamily: 'cursive'
                }}
                placeholder="Customer can type signature here, or just use name above"
              />
            </div>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowSignatureModal(false)}
                style={{
                  ...BTN,
                  backgroundColor: '#666',
                  fontSize: '16px',
                  padding: '12px 20px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignatureSubmit}
                style={{
                  ...BTN,
                  backgroundColor: '#2a7c2a',
                  fontSize: '16px',
                  padding: '12px 20px'
                }}
              >
                Approve Work Order
              </button>
            </div>
          </div>
        </div>
      )}
      
      </div>
    </div>
  )
}
