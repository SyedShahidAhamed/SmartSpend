
import { useState, useEffect } from 'react'
import { auth, googleProvider } from '../firebase'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth'
import { Wallet } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Handle the result after Google redirects back to SmartSpend
  useEffect(() => {
    getRedirectResult(auth)
      .catch(err => {
        console.error('Google redirect error:', err)
        setError(err.message || 'Google sign-in failed.')
      })
  }, [])

  async function emailSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    const normalizedEmail = email.trim().toLowerCase()

    try {
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(
          auth, normalizedEmail, password
        )

        if (name.trim()) {
          await updateProfile(result.user, {
            displayName: name.trim()
          })
        }
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password)
      }
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'No account found. Please create an account.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/email-already-in-use': 'This email already has an account.',
        'auth/weak-password': 'Please use at least 6 characters.',
        'auth/invalid-credential': 'Incorrect email or password. Please try again.',
        'auth/network-request-failed': 'Check your internet connection.'
      }

      setError(messages[err.code] || 'Unable to continue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function googleLogin() {
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

      if (isMobile) {
        await signInWithRedirect(auth, googleProvider)
        return
      }

      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Google login error:', err)
      setError(err.message || 'Google sign-in failed.')
      setLoading(false)
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }

    setLoading(true)
    setError('')
    setNotice('')

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase())
      setNotice('If this email has an account, a reset email will arrive shortly.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-preview">
      <div className="login-card">

        <div className="brand login-brand">
          <div className="brand-mark">
            <Wallet />
          </div>
          <span>smart<span className="brand-green">spend</span></span>
        </div>

        <h1>{isSignup ? 'Create account' : 'Welcome back'}</h1>

        <p>
          {isSignup
            ? 'Start tracking your money with SmartSpend.'
            : 'Sign in to continue managing your money.'}
        </p>

        <form onSubmit={emailSubmit}>
          {isSignup && (
            <>
              <label className="field-label">Full name</label>
              <input
                className="text-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </>
          )}

          <label className="field-label">Email address</label>
          <input
            className="text-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label className="field-label">Password</label>
          <input
            className="text-input"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            minLength={6}
            required
          />

          {error && (
            <p className="login-error" role="alert">{error}</p>
          )}

          <button
            className="btn btn-primary btn-wide"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {!isSignup && (
          <button
            type="button"
            className="text-link"
            onClick={resetPassword}
            disabled={loading}
          >
            Forgot password?
          </button>
        )}

        <p className="login-divider">or</p>

        <button
          type="button"
          className="google-btn"
          onClick={googleLogin}
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>

        {notice && (
          <p className="login-notice" role="status">{notice}</p>
        )}

        <p className="login-switch">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setIsSignup(!isSignup)
              setError('')
              setNotice('')
            }}
          >
            {isSignup ? 'Sign in' : 'Create account'}
          </button>
        </p>

      </div>
    </main>
  )
}
