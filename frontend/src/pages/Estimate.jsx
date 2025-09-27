import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/PalmExitLogo.png'
import Navigation from '../components/Navigation.jsx'

const API = 'http://localhost:5000/api'
const YELLOW = '#FFD329'
const BTN = {
  backgroundColor:'#333', color:YELLOW, padding:'10px 14px', border:'none', borderRadius:8, fontWeight:'bold', cursor:'pointer'
}

export default function Estimate(){
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
            <select value={customerId} onChange={e=>{setCustomerId(e.target.value); setVehicleId('')}} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}>
              <option value="">Select customer…</option>
              {customers.map(c => (
                <option key={c.customer_id} value={c.customer_id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>Vehicle</label>
            <select value={vehicleId} onChange={e=>setVehicleId(e.target.value)} disabled={!customerId} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}>
              <option value="">{customerId ? 'Select vehicle…' : 'Choose customer first'}</option>
              {customerVehicles.map(v => (
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
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>Notes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={5} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333', resize:'vertical'}} />
          </div>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>Tax Rate</label>
            <input type="number" step="0.0001" value={taxRate} onChange={e=>setTaxRate(e.target.value)} style={{width:'100%', background:'#111', color:YELLOW, padding:10, borderRadius:8, border:'1px solid #333'}}/>

            <div style={{marginTop:16, borderTop:'1px solid #333', paddingTop:12}}>
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
      <div style={{display:'flex', gap:12}}>
        <button style={BTN} onClick={()=>window.print()}>🖨️ Print</button>
        <button style={BTN} onClick={()=>alert('Save functionality coming soon: will add work_orders tables to backend to persist.')}>💾 Save (coming soon)</button>
      </div>
      </div>
    </div>
  )
}