import { Link } from 'react-router-dom'
import { Menu, X, Heart, MessageSquare, LogOut } from 'lucide-react'
import { useState } from 'react'
import Button from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { APP_NAME } from '../../utils/constants'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const isAuthenticated = !!user

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="hidden sm:block text-xl font-display font-bold text-slate-900">
              {APP_NAME}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/recherche" className="text-slate-700 hover:text-primary transition-colors">
              Rechercher
            </Link>
            <Link to="/demarcheurs" className="text-slate-700 hover:text-primary transition-colors">
              Démarcheurs
            </Link>
            <Link to="/comment-ca-marche" className="text-slate-700 hover:text-primary transition-colors">
              Comment ça marche
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/favoris" className="text-slate-700 hover:text-primary transition-colors relative">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/messages" className="text-slate-700 hover:text-primary transition-colors relative">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link to={user.profile?.role === 'demarcheur' ? '/dashboard/demarcheur' : '/dashboard'}>
                  <Button size="sm">Dashboard</Button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-slate-700 hover:text-danger transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <Avatar
                  name={user.profile?.full_name || user.email}
                  imageUrl={user.profile?.avatar_url}
                  isVerified={user.profile?.is_verified}
                  size="sm"
                />
              </>
            ) : (
              <>
                <Link to="/connexion">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link to="/inscription">
                  <Button size="sm">Inscription</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-slate-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/recherche"
              className="block py-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Rechercher
            </Link>
            <Link
              to="/demarcheurs"
              className="block py-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Démarcheurs
            </Link>
            <Link
              to="/comment-ca-marche"
              className="block py-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Comment ça marche
            </Link>
            <div className="pt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/favoris" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Mes favoris
                    </Button>
                  </Link>
                  <Link to="/messages" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Messages (3)
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/connexion" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/inscription" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full">Inscription</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
