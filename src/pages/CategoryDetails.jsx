import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Wallet, ArrowUpRight, X } from 'lucide-react'
import { PageHeading, ProgressRing, StatCard, TransactionTable } from '../components/common/Shared'
import { money } from '../utils/currency'

export default function CategoryDetails(p) {
  const { id } = useParams()
  const category = p.categories.find(item => item.id === id)
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [filter, setFilter] = useState('All')


  if (!category) {
    return (
      <section className="panel empty-state">
        <strong>Category not found</strong>
        <span>This category may have been removed.</span>
        <Link className="text-link" to="/budgets">Back to budgets</Link>
      </section>
    )
  }

  const left = Math.max(0, category.budget - category.spent)
  const percent = category.budget ? category.spent / category.budget * 100 : 0
  const history = p.transactions
    .filter(item => item.categoryId === category.id)
    .filter(item => filter === 'All' || (filter === 'This month' && item.date.startsWith(new Date().toISOString().slice(0, 7))))

  function recordExpense() {
    if (!Number.isFinite(amount) || amount <= 0 || amount > left) return

    const transaction = {
      id: crypto.randomUUID(),
      categoryId: category.id,
      categoryName: category.name,
      amount,
      description: description.trim() || `${category.name} expense`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: 'Withdrawal'
    }

    p.setCategories(current => current.map(item =>
      item.id === category.id ? { ...item, spent: item.spent + amount } : item
    ))
    p.setTransactions(current => [transaction, ...current])
    p.notify(`${money(amount)} recorded for ${category.name}`)
    setConfirm(false)
    setDescription('')
    setAmount(0)
  }

  return (
    <>
      <Link to="/budgets" className="back-link">← Back to budgets</Link>
      <PageHeading
        eyebrow="BUDGET CATEGORY"
        title={category.name}
        subtitle={category.desc || 'Manage this category and review its spending history.'}
        action={<button className="btn btn-outline" onClick={() => p.openCategoryModal(category)}>Edit category</button>}
      />

      <div className="detail-top-grid">
        <div className="panel category-hero">
          <div className="category-hero-icon" style={{ background: category.color }}>{category.icon}</div>
          <div>
            <span className="muted-label">TOTAL ALLOCATED</span>
            <h2>{money(category.budget)}</h2>
            <span className="success-text">Monthly category budget</span>
          </div>
          <div className="hero-progress">
            <ProgressRing percent={percent} />
            <span>{Math.round(percent)}% used</span>
          </div>
        </div>
        <div className="detail-stats">
          <StatCard label="Amount used" value={money(category.spent)} change={`${Math.round(percent)}%`} foot="of allocated budget" icon={ArrowUpRight} tone="orange" />
          <StatCard label="Remaining" value={money(left)} change="Available" foot="for this category" icon={Wallet} />
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel withdraw-panel">
          <div className="panel-heading">
            <div><h2>Withdraw money</h2><p>Record a new expense from this budget</p></div>
            <span className="pill pill-green">{money(left)} available</span>
          </div>
          <div className="withdraw-amount"><span>You're spending</span><strong>{money(amount)}</strong></div>
          <input
            className="range"
            type="range"
            min="0"
            max={Math.max(1, left)}
            step="50"
            value={Math.min(amount, left)}
            onChange={event => setAmount(Number(event.target.value))}
          />
          <div className="range-labels"><span>₹0</span><span>{money(left)}</span></div>
          <label className="field-label">What was this for? <span>Optional</span></label>
          <input className="text-input" value={description} onChange={event => setDescription(event.target.value)} placeholder="e.g. Monthly payment" />
          <button className="btn btn-primary btn-wide" disabled={amount <= 0 || amount > left} onClick={() => setConfirm(true)}>
            Continue <ArrowUpRight size={16} />
          </button>
          <p className="secure-note">Your budget balance will update once you confirm.</p>
        </section>

        <section className="panel utilization-panel">
          <div className="panel-heading"><div><h2>Budget utilization</h2><p>How you're doing this month</p></div></div>
          <div className="utilization-big">
            <ProgressRing percent={percent} />
            <div><strong>{Math.round(percent)}%</strong><span>of budget used</span></div>
          </div>
          <div className="legend-row"><span><i className="legend-dot green-dot" />Spent</span><b>{money(category.spent)}</b></div>
          <div className="legend-row"><span><i className="legend-dot pale-dot" />Remaining</span><b>{money(left)}</b></div>
          <div className="budget-track"><span style={{ width: `${Math.min(100, percent)}%` }} /></div>
        </section>
      </div>

      <section className="panel history-panel">
        <div className="panel-heading">
          <div><h2>{category.name} history</h2><p>Every transaction made from this category</p></div>
          <select className="select-like" value={filter} onChange={event => setFilter(event.target.value)}>
            <option>All</option><option>This month</option>
          </select>
        </div>
        <TransactionTable transactions={history} empty="No transactions for this category yet." />
      </section>

      {confirm && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <button className="modal-close" onClick={() => setConfirm(false)}><X size={18} /></button>
            <div className="modal-icon"><Wallet size={22} /></div>
            <h2>Confirm withdrawal</h2>
            <p>You're about to record this expense from your {category.name} budget.</p>
            <div className="confirm-amount">{money(amount)}</div>
            <div className="confirm-row"><span>Remaining after withdrawal</span><strong>{money(left - amount)}</strong></div>
            <button className="btn btn-primary btn-wide" onClick={recordExpense}>Confirm withdrawal</button>
            <button className="btn btn-ghost btn-wide" onClick={() => setConfirm(false)}>Go back</button>
          </div>
        </div>
      )}
    </>
  )
}
