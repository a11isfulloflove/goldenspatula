import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { clearPersistedInput } from '../persistence'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    clearPersistedInput()
    console.error('[Golden Spatula] render crashed:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          background: '#141518',
          color: '#ece7dd',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <img
          src="/items/tft_item_spatula.png"
          alt=""
          width={64}
          height={64}
          style={{ transform: 'rotate(-10deg)' }}
        />
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            margin: 0,
            color: '#efc96b',
          }}
        >
          Oops — our spatula dropped
        </h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#9a978e', maxWidth: '420px' }}>
          Something went sideways while building your page. Reloading usually fixes it — your
          picks were reset, they were the culprit.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: '8px',
            fontSize: '15px',
            fontWeight: 700,
            padding: '10px 28px',
            borderRadius: '999px',
            background: '#d4a02e',
            color: '#141518',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
        <details
          style={{
            marginTop: '16px',
            maxWidth: '560px',
            fontSize: '12px',
            color: '#6b7689',
            textAlign: 'left',
          }}
        >
          <summary style={{ cursor: 'pointer', color: '#9a978e' }}>Technical details</summary>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#0d0e10',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '8px',
            }}
          >
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      </div>
    )
  }
}
