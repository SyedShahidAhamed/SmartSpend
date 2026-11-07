import { useState } from 'react'
import { CircleHelp, X, ChevronRight, ArrowUpRight, Send, CheckCircle2 } from 'lucide-react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqppobvg'

function HelpModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', topic: 'General question', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const faqs = [
    ['How do I add an expense category?', 'Open My budgets and choose New category. Enter a name, monthly allocation and icon, then save.'],
    ['How do withdrawals work?', 'Open a category, choose an amount with the slider, add an optional note and confirm. The amount is recorded in your transaction history.'],
    ['Can I change a category budget?', 'Open the category and choose Edit category. You can update its name, icon, description and allocation.'],
    ['Where can I see all my spending?', 'Use Transactions for the complete transaction list, or Analytics for category-wise spending insights.'],
    ['Can SmartSpend send daily email receipts?', 'Daily email receipt delivery is not enabled yet. You can contact support if you need help with your account.']
  ]

  function updateField(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  async function submitSupport(event) {
    event.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          topic: form.topic,
          message: form.message.trim(),
          _subject: `SmartSpend support: ${form.topic}`
        })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result?.errors?.[0]?.message || 'Unable to send your message. Please try again.')
      setStatus('success')
      setForm({ name: '', email: '', topic: 'General question', message: '' })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="help-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close help centre"><X size={18} /></button>
        <div className="help-modal-head">
          <div className="modal-icon"><CircleHelp size={22} /></div>
          <span className="eyebrow">SMARTSPEND SUPPORT</span>
          <h2>How can we help?</h2>
          <p>Quick answers and direct support for your SmartSpend account.</p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}><summary>{question}<ChevronRight size={16} /></summary><p>{answer}</p></details>
          ))}
        </div>
        <form className="contact-support support-form" onSubmit={submitSupport}>
          <div className="support-form-heading">
            <div><strong>Still need help?</strong><p>Send us a message and we'll get back to you.</p></div>
          </div>
          {status === 'success' ? (
            <div className="support-success" role="status"><CheckCircle2 size={18} /> Your message was sent successfully. Thank you!</div>
          ) : (
            <>
              <label className="field-label" htmlFor="support-name">Your name</label>
              <input id="support-name" className="text-input" name="name" value={form.name} onChange={updateField} required maxLength={100} placeholder="Enter your name" />
              <label className="field-label" htmlFor="support-email">Email address</label>
              <input id="support-email" className="text-input" type="email" name="email" value={form.email} onChange={updateField} required placeholder="you@example.com" />
              <label className="field-label" htmlFor="support-topic">What do you need help with?</label>
              <select id="support-topic" className="text-input" name="topic" value={form.topic} onChange={updateField}>
                <option>General question</option><option>Account and login</option><option>Budgets and categories</option><option>Transactions</option><option>Report a bug</option><option>Feature request</option>
              </select>
              <label className="field-label" htmlFor="support-message">Message</label>
              <textarea id="support-message" className="text-input" name="message" value={form.message} onChange={updateField} required rows={4} maxLength={3000} placeholder="Describe how we can help..." />
              {status === 'error' && <p className="support-error" role="alert">{error}</p>}
              <button className="btn btn-primary btn-wide" type="submit" disabled={status === 'sending'}>
                <Send size={15} /> {status === 'sending' ? 'Sending...' : 'Send message'}
              </button>
            </>
          )}
          {status === 'success' && <button type="button" className="btn btn-outline btn-wide" onClick={() => setStatus('idle')}>Send another message</button>}
          {status !== 'success' && <a className="support-form-link" href="https://formspree.io/f/mqppobvg" target="_blank" rel="noreferrer">Formspree endpoint <ArrowUpRight size={13} /></a>}
        </form>
      </div>
    </div>
  )
}

export default HelpModal
