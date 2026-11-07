
import { PageHeading } from '../components/common/Shared'
import { money } from '../utils/currency'

export default function SettingsPage(p) {
  return (
    <>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="Settings"
        subtitle="Manage your profile and monthly preferences."
      />

      <div className="settings-grid">
        <section className="panel settings-panel">
          <h2>Profile information</h2>
          <p>Your personal account details.</p>

          <label className="field-label">Full name</label>
          <input
            className="text-input"
            value={p.user.name}
            readOnly
          />

          <label className="field-label">Email address</label>
          <input
            className="text-input"
            value={p.user.email}
            disabled
          />

          <button
            className="btn btn-primary"
            onClick={() => p.notify('Profile name is managed by Firebase Authentication.')}
          >
            Profile information
          </button>
        </section>

        <section className="panel settings-panel">
          <h2>Monthly budget</h2>
          <p>Set the income you want to manage each month.</p>

          <label className="field-label">Monthly income (INR)</label>
          <input
            className="text-input"
            type="number"
            min="0"
            value={p.salary}
            onChange={e => p.setSalary(Math.max(0, Number(e.target.value)))}
          />

          <div className="settings-tip">
            Your category budgets total {money(p.allocated)}.
            Update allocations from My budgets.
          </div>
        </section>
      </div>
    </>
  )
}
