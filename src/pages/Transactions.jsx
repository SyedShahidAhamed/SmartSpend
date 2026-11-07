
import { useState } from 'react'
import {
  ArrowLeftRight,
  Search,
  ArrowUpRight,
  Download,
  Filter,
  TrendingUp
} from 'lucide-react'

import {
  PageHeading,
  StatCard,
  TransactionTable
} from '../components/common/Shared'

import { money } from '../utils/currency'

export default function Transactions(p) {
  const [q, setQ] = useState('')
  const [range, setRange] = useState('All time')

  // Filter transactions by search
  const rows = p.transactions.filter(t =>
    (t.categoryName + ' ' + t.description)
      .toLowerCase()
      .includes(q.toLowerCase())
  )

  // Generate and download CSV
  function exportCSV() {
    if (rows.length === 0) {
      p.notify('No transactions available to export.')
      return
    }

    const headers = [
      'Date',
      'Time',
      'Description',
      'Category',
      'Type',
      'Amount (INR)'
    ]

    const csvRows = rows.map(t => [
      t.date || '',
      t.time || '',
      t.description || '',
      t.categoryName || '',
      t.type || 'Expense',
      Number(t.amount) || 0
    ])

    // Escape special characters for CSV
    const escapeCSV = value =>
      `"${String(value).replace(/"/g, '""')}"`

    const csvContent = [
      headers,
      ...csvRows
    ]
      .map(row => row.map(escapeCSV).join(','))
      .join('\r\n')

    // BOM helps Excel display text correctly
    const blob = new Blob(
      ['\uFEFF' + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    const today = new Date().toISOString().split('T')[0]

    link.href = url
    link.download = `SmartSpend-Transactions-${today}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    p.notify('Transactions exported successfully!')
  }

  const totalAmount = p.transactions.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  )

  return (
    <>
      <PageHeading
        eyebrow="YOUR MONEY MOVEMENTS"
        title="Transactions"
        subtitle="Every expense, all in one place."
        action={
          <button
            className="btn btn-outline"
            onClick={exportCSV}
          >
            <Download size={16} />
            Export CSV
          </button>
        }
      />

      <div className="stats-grid three-stats">
        <StatCard
          label="Total transactions"
          value={p.transactions.length}
          change="Recorded"
          foot="all time"
          icon={ArrowLeftRight}
        />

        <StatCard
          label="Total spent"
          value={money(p.spent)}
          change="This month"
          foot="across categories"
          icon={ArrowUpRight}
          tone="orange"
        />

        <StatCard
          label="Average transaction"
          value={money(
            p.transactions.length
              ? totalAmount / p.transactions.length
              : 0
          )}
          change="Per transaction"
          foot="all records"
          icon={TrendingUp}
          tone="purple"
        />
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="searchbox table-search">
            <Search size={16} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search transactions..."
            />
          </div>

          <select
            className="select-like"
            value={range}
            onChange={e => setRange(e.target.value)}
          >
            <option>All time</option>
            <option>This month</option>
            <option>Last month</option>
          </select>

          <button
            className="btn btn-outline btn-filter"
            onClick={() => setQ('')}
          >
            <Filter size={15} />
            Clear
          </button>
        </div>

        <TransactionTable transactions={rows} />
      </section>
    </>
  )
}
