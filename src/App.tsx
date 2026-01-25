import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { RoleRoute } from './components/common/RoleRoute'
import Home from './pages/Home'
import Search from './pages/Search'
import PropertyDetail from './pages/PropertyDetail'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import DashboardAgent from './pages/DashboardAgent'
import NewListing from './pages/NewListing'
import { Favorites } from './pages/Favorites'
import { Messages } from './pages/Messages'
import { Profile } from './pages/Profile'
import { ProfileAgent } from './pages/ProfileAgent'
import { Verification } from './pages/Verification'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
