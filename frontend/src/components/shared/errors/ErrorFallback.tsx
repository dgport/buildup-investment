import type { FallbackProps } from 'react-error-boundary'

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className=" max-w-5xl h-full  text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">We're sorry for the inconvenience.</p>

        {import.meta.env.DEV && error && (
          <pre className="text-sm text-red-600 mb-4 text-left bg-red-50 p-4 rounded overflow-auto max-h-auto">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
