// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary компонент для перехоплення помилок в React дереві
 * Запобігає падінню всього додатку при помилці в компоненті
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    
    // Тут можна додати логування в Sentry або інший сервіс
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // TODO: Інтегрувати з Sentry
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, { extra: { errorInfo } })
    // }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  private handleGoHome = (): void => {
    window.location.href = '/'
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-neo p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">
              Щось пішло не так
            </h1>
            
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Виникла неочікувана помилка. Спробуйте оновити сторінку або повернутися на головну.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                  Деталі помилки (dev only)
                </summary>
                <pre className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs overflow-auto max-h-40">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Спробувати знову
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors flex items-center gap-2"
              >
                <Home size={16} />
                На головну
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Хук для програмного виклику помилки (тестування)
 */
export function useErrorTrigger(): () => void {
  return () => {
    throw new Error('Manual error trigger for testing ErrorBoundary')
  }
}

export default ErrorBoundary
