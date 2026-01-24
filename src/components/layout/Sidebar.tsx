import { Link, useLocation } from 'react-router-dom'
import { Home, Heart, MessageSquare, Settings, Plus, LayoutDashboard, LogOut } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const userRole = 'locataire' as 'locataire' | 'demarcheur' | 'proprietaire'

  const tenantLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Vue d\'ensemble' },
    { to: '/favoris', icon: Heart, label: 'Mes favoris' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profil', icon: Settings, label: 'Mon profil' },
  ]

  const agentLinks = [
    { to: '/dashboard/demarcheur', icon: LayoutDashboard, label: 'Vue d\'ensemble' },
    { to: '/nouvelle-annonce', icon: Plus, label: 'Nouvelle annonce' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profil', icon: Settings, label: 'Mon profil' },
  ]

  const links = userRole === 'demarcheur' ? agentLinks : tenantLinks

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold">HomeFlow</span>
          </Link>
        </div>

        <nav className="px-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button className="flex items-center space-x-3 px-4 py-3 w-full text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
