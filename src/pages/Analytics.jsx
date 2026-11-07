
import { ArrowUpRight, CalendarDays, TrendingUp, PiggyBank } from 'lucide-react'
import {
  PageHeading,
  StatCard,
  ProgressRing
} from '../components/common/Shared'
import { money } from '../utils/currency'

export default function Analytics(p) {
  const bars = p.categories.slice(0, 7).map(c => ({
    name: c.name,
    spent: c.spent,
    budget: c.budget
  }))

  const maxSpent = Math.max(...bars.map(c => c.spent), 1)

  const spendingPercentage = p.salary > 0
    ? Math.min(100, (p.spent / p.salary) * 100)
    : 0

  const savingsRate = p.salary > 0
    ? Math.max(0, Math.round(
        ((p.salary - p.spent) / p.salary) * 100
      ))
    : 0

  return (
    <>
      <PageHeading
        eyebrow="INSIGHTS & REPORTS"
        title="Analytics"
        subtitle="Understand your spending habits and make smarter decisions."
        action={
          <button className="select-like">
            <CalendarDays size={15} /> November 2026
          </button>
        }
      />

      <div className="stats-grid three-stats">
        <StatCard
          label="Total spent"
          value={money(p.spent)}
          change="This month"
          foot="monthly spending"
          icon={ArrowUpRight}
          tone="orange"
        />

        <StatCard
          label="Daily average"
          value={money(p.spent / 7)}
          change="Based on 7 days"
          foot="average per day"
          icon={TrendingUp}
        />

        <StatCard
          label="Savings rate"
          value={`${savingsRate}%`}
          change="Of income"
          foot="remaining this month"
          icon={PiggyBank}
          tone="purple"
        />
      </div>

      <div className="analytics-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Spending by category</h2>
              <p>Where your money is going</p>
            </div>
          </div>

          {bars.length > 0 ? (
            <div className="bar-chart">
              {bars.map(c => (
                <div className="bar-row" key={c.name}>
                  <span>{c.name}</span>
                  <div className="bar-bg">
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (c.spent / maxSpent) * 100
                        )}%`
                      }}
                    />
                  </div>
                  <b>{money(c.spent)}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No spending data yet</strong>
              <span>Add categories and transactions to see analytics.</span>
            </div>
          )}
        </section>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Budget health</h2>
              <p>Spent vs remaining</p>
            </div>
          </div>

          <div className="analytics-ring">
            <ProgressRing percent={spendingPercentage} />
            <div>
              <strong>{money(p.spent)}</strong>
              <span>spent this month</span>
            </div>
          </div>

          <div className="legend-row">
            <span>
              <i className="legend-dot green-dot" /> Spent
            </span>
            <b>{money(p.spent)}</b>
          </div>

          <div className="legend-row">
            <span>
              <i className="legend-dot pale-dot" /> Remaining
            </span>
            <b>{money(Math.max(0, p.remaining))}</b>
          </div>
        </section>
      </div>
    </>
  )
}
