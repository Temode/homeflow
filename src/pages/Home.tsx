import { Link } from 'react-router-dom'
import { Search, Shield, CreditCard, FileText, MessageSquare, LayoutDashboard, ChevronRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'

export default function Home() {
  const stats = [
    { value: '2800+', label: 'Annonces' },
    { value: '450+', label: 'Démarcheurs' },
    { value: '12000+', label: 'Utilisateurs' }
  ]

  const steps = [
    { icon: Search, title: 'Rechercher', description: 'Parcourez les annonces vérifiées' },
    { icon: MessageSquare, title: 'Contacter', description: 'Discutez avec les démarcheurs' },
    { icon: Shield, title: 'Visiter', description: 'Organisez une visite' },
    { icon: CreditCard, title: 'Payer', description: 'Transaction sécurisée' }
  ]

  const features = [
    { icon: Search, title: 'Recherche avancée', description: 'Filtres puissants pour trouver rapidement' },
    { icon: Shield, title: 'Vérification KYC', description: 'Tous les démarcheurs sont vérifiés' },
    { icon: CreditCard, title: 'Paiement sécurisé', description: 'Transactions protégées' },
    { icon: FileText, title: 'Reçus automatiques', description: 'Documentation instantanée' },
    { icon: MessageSquare, title: 'Messagerie', description: 'Communication directe' },
    { icon: LayoutDashboard, title: 'Dashboard', description: 'Gérez tout en un seul endroit' }
  ]

  const testimonials = [
    {
      name: 'Aissatou Diallo',
      role: 'Locataire',
      content: 'J\'ai trouvé mon appartement en moins d\'une semaine grâce à HomeFlow. Service excellent !',
      avatar: 'AD'
    },
    {
      name: 'Mamadou Bah',
      role: 'Propriétaire',
      content: 'Plateforme professionnelle qui m\'a permis de louer ma maison rapidement.',
      avatar: 'MB'
    },
    {
      name: 'Fatoumata Sow',
      role: 'Démarcheur',
      content: 'Excellent outil pour gérer mes annonces et mes clients.',
      avatar: 'FS'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="relative bg-gradient-to-br from-slate-50 to-white py-20 md:py-32 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Trouvez votre logement idéal en toute{' '}
              <span className="gradient-primary bg-clip-text text-transparent">confiance</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              La première plateforme immobilière avec démarcheurs vérifiés en Guinée
            </p>
          </div>

          <div className="bg-white rounded-card shadow-2xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Quartier, ville..." className="md:col-span-1" />
              <Select
                options={[
                  { value: '', label: 'Type de bien' },
                  { value: 'location', label: 'Location' },
                  { value: 'achat', label: 'Achat' }
                ]}
              />
              <Link to="/recherche" className="w-full">
                <Button size="lg" className="w-full">
                  <Search className="w-5 h-5 mr-2" />
                  Rechercher
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-slate-600">Simple, rapide et sécurisé</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="hidden md:block absolute -right-12 top-1/2 -translate-y-1/2 text-slate-300 w-8 h-8" />
                    )}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Fonctionnalités
            </h2>
            <p className="text-xl text-slate-600">Tout ce dont vous avez besoin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} hover className="p-6">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Témoignages
            </h2>
            <p className="text-xl text-slate-600">Ce que nos utilisateurs disent</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar name={testimonial.name} size="md" />
                  <div className="ml-3">
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-slate-700 italic">"{testimonial.content}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Prêt à trouver votre logement idéal ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d'utilisateurs satisfaits
          </p>
          <Link to="/inscription">
            <Button variant="secondary" size="lg">
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
