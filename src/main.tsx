import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode temporairement désactivé pour debug - cause des AbortError avec Supabase
  // <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </ErrorBoundary>
  // </React.StrictMode>,
)
