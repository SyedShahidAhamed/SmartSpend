import { useState } from 'react'
import { Wallet, X } from 'lucide-react'

function CategoryModal({category,onClose,onSave,onDelete}){
  const [name,setName]=useState(category.name||'')
  const [budget,setBudget]=useState(String(category.budget??''))
  const [icon,setIcon]=useState(category.icon||'🧾')
  const [desc,setDesc]=useState(category.desc||'')
  const editing=Boolean(category.id)
  const icons=['🏠','🧹','⚡','🛒','🍚','🔥','📶','🥬','🥕','👤','⛽','📱','🧾','📲','🍗','🛋️','💰','🎓','🚗','🏥']
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><form className="confirm-modal category-form-modal" onSubmit={e=>{e.preventDefault();onSave({...category,name,budget:Number(budget),icon,desc})}}>
    <button type="button" className="modal-close" onClick={onClose}><X size={18}/></button>
    <div className="modal-icon"><Wallet size={22}/></div><h2>{editing?'Edit category':'Add expense category'}</h2><p>{editing?'Update the name, icon and monthly allocation.':'Create a new category for your monthly budget.'}</p>
    <label className="field-label">Category name</label><input className="text-input" autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Medical expenses" required maxLength={40}/>
    <label className="field-label">Monthly allocated budget (₹)</label><input className="text-input" type="number" min="0" step="1" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="e.g. 1500" required/>
    <label className="field-label">Choose an icon</label><div className="icon-picker">{icons.map(i=><button type="button" className={`icon-choice ${icon===i?'icon-choice-active':''}`} key={i} onClick={()=>setIcon(i)}>{i}</button>)}</div>
    <label className="field-label">Description <span>Optional</span></label><input className="text-input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What is this budget for?"/>
    <button className="btn btn-primary btn-wide" type="submit">{editing?'Save changes':'Add category'}</button>
    {editing&&<button type="button" className="btn btn-danger btn-wide" onClick={()=>{if(window.confirm(`Delete ${category.name}? Existing transaction history will be retained.`))onDelete(category.id)}}>Delete category</button>}
  </form></div>
}
export default CategoryModal
