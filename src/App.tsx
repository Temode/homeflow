import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { RoleRoute } from './components/common/RoleRoute'
import { Loader2 } from 'lucide-react'

const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DashboardAgent = lazy(() => import('./pages/DashboardAgent'))
const NewListing = lazy(() => import('./pages/NewListing'))
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })))
const Messages = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const ProfileAgent = lazy(() => import('./pages/ProfileAgent').then(m => ({ default: m.ProfileAgent })))
const Verification = lazy(() => import('./pages/Verification').then(m => ({ default: m.Verification })))
const NotFound = lazy(() => import('./pages/NotFound'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recherche" element={<Search />} />
        <Route path="/propriete/:id" element={<PropertyDetail />} />
        <Route path="/demarcheur/:id" element={<ProfileAgent />} />
        <Route path="/connexion" element={<SignIn />} />
        <Route path="/inscription" element={<SignUp />} />
        
        <Route
          path="/favoris"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['locataire', 'proprietaire']}>
                <Dashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/demarcheur"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['demarcheur']}>
                <DashboardAgent />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/nouvelle-annonce"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['demarcheur']}>
                <NewListing />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/verification"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['demarcheur']}>
                <Verification />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
