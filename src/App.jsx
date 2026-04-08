import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ImageGenPage from './pages/ImageGenPage'
import VideoGenPage from './pages/VideoGenPage'
import AnalyzerPage from './pages/AnalyzerPage'
import TokensPage from './pages/TokensPage'
import LibraryPage from './pages/LibraryPage'
import PrompterPage from './pages/PrompterPage'
import VideoPrompterPage from './pages/VideoPrompterPage'
import AffiliatePage from './pages/AffiliatePage'
import PodcastPrompterPage from './pages/PodcastPrompterPage'
import AffiliateGeneratorPage from './pages/AffiliateGeneratorPage'

function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  // Rehydrate auth state from localStorage on first render
  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/images"    element={<PrivateRoute><ImageGenPage /></PrivateRoute>} />
        <Route path="/videos"    element={<PrivateRoute><VideoGenPage /></PrivateRoute>} />
        <Route path="/analyzer"  element={<PrivateRoute><AnalyzerPage /></PrivateRoute>} />
        <Route path="/tokens"    element={<PrivateRoute><TokensPage /></PrivateRoute>} />
        <Route path="/library"   element={<PrivateRoute><LibraryPage /></PrivateRoute>} />
        <Route path="/prompter"  element={<PrivateRoute><PrompterPage /></PrivateRoute>} />
        <Route path="/video-prompter" element={<PrivateRoute><VideoPrompterPage /></PrivateRoute>} />
        <Route path="/affiliate-analyzer" element={<PrivateRoute><AffiliatePage /></PrivateRoute>} />
        <Route path="/podcast-prompter" element={<PrivateRoute><PodcastPrompterPage /></PrivateRoute>} />
        <Route path="/video-generator" element={<PrivateRoute><AffiliateGeneratorPage /></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
