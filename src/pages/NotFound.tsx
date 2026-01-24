import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '@/components/ui/Button'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-9xl font-display font-bold gradient-primary bg-clip-text text-transparent mb-4">
            404
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">
            Page non trouvée
          </h1>
          <p className="text-slate-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
