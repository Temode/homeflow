import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react'
import { APP_NAME } from '@/utils/constants'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-xl font-display font-bold">{APP_NAME}</span>
            </div>
            <p className="text-slate-400 text-sm">
              Trouvez votre logement idéal en toute confiance en Guinée.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/recherche" className="text-slate-400 hover:text-white transition-colors">Rechercher</Link></li>
              <li><Link to="/demarcheurs" className="text-slate-400 hover:text-white transition-colors">Démarcheurs</Link></li>
              <li><Link to="/comment-ca-marche" className="text-slate-400 hover:text-white transition-colors">Comment ça marche</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/conditions" className="text-slate-400 hover:text-white transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/confidentialite" className="text-slate-400 hover:text-white transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/mentions-legales" className="text-slate-400 hover:text-white transition-colors">Mentions légales</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-slate-400">contact@homeflow.gn</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
