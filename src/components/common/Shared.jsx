
import { Link } from 'react-router-dom'
import { ArrowUpRight, ReceiptText } from 'lucide-react'
import { money } from '../../utils/currency'

export function PageHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, change, icon: Icon, tone = 'green', foot }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span className="positive">
          <ArrowUpRight size={14} /> {change}
        </span>
        <span>{foot}</span>
      </div>
    </div>
  )
}

export function ProgressRing({ percent }) {
  const p = Math.min(100, Math.max(0, percent))

  return (
    <div className="ring-wrap">
      <div className="ring" style={{ '--progress': `${p * 3.6}deg` }}>
        <div className="ring-inner">
          <strong>{Math.round(p)}%</strong>
          <small>used</small>
        </div>
      </div>
    </div>
  )
}

export function CategoryCard({ category: c }) {
  const pct = c.budget ? (c.spent / c.budget) * 100 : 0

  return (
    <Link to={`/category/${c.id}`} className="category-card">
      <div className="category-top">
        <div className="category-emoji" style={{ background: c.color }}>
          {c.icon}
        </div>
        <span className="card-arrow">
          <ArrowUpRight size={16} />
        </span>
      </div>

      <h3>{c.name}</h3>

      <div className="category-amount">
        {money(c.spent)} <small>/ {money(c.budget)}</small>
      </div>

      <div className="progress-line">
        <span style={{ width: `${Math.min(100, pct)}%` }} />
      </div>

      <div className="category-bottom">
        <span>{Math.round(pct)}% used</span>
        <span>{money(c.budget - c.spent)} left</span>
      </div>
    </Link>
  )
}

export function TransactionTable({ transactions, empty = 'No transactions found.' }) {
  return transactions.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date & time</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>
                <div className="transaction-name">
                  <div className="transaction-icon">
                    <ArrowUpRight size={16} />
                  </div>
                  <div>
                    <strong>{t.description}</strong>
                    <small>{t.type}</small>
                  </div>
                </div>
              </td>
              <td>{t.categoryName}</td>
              <td>
                <span>{t.date}</span>
                <small className="cell-sub">{t.time}</small>
              </td>
              <td className="amount-cell">−{money(t.amount)}</td>
              <td><span className="status-pill"><i />Completed</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="empty-state">
      <div><ReceiptText size={23} /></div>
      <strong>{empty}</strong>
      <span>Your transactions will appear here.</span>
    </div>
  )
}
