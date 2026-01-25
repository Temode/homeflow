# HomeFlow 🏠

Plateforme immobilière moderne pour le marché guinéen connectant locataires, propriétaires et démarcheurs immobiliers vérifiés.

![HomeFlow](./public/logo.svg)

## 🌟 Fonctionnalités

- **Recherche avancée** : Filtrez par type, quartier, prix, nombre de pièces
- **Vérification KYC** : Démarcheurs vérifiés pour votre sécurité
- **Messagerie en temps réel** : Communiquez directement avec les agents
- **Favoris** : Sauvegardez vos propriétés préférées
- **Dashboards personnalisés** : Pour locataires et démarcheurs
- **Paiements sécurisés** : Transactions transparentes
- **Responsive design** : Optimisé mobile, tablette et desktop

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase (gratuit)

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd homeflow
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**

Créez un projet sur [Supabase](https://supabase.com/dashboard):

- Créez un nouveau projet
- Allez dans **SQL Editor** et exécutez le fichier `supabase/migrations/20260124_initial_schema.sql`
- (Optionnel) Exécutez `supabase/seed.sql` pour des données de démo

4. **Variables d'environnement**

Copiez `.env.example` vers `.env.local`:
```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos credentials Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. **Configuration Storage Supabase** (optionnel mais recommandé)

Dans votre dashboard Supabase, allez dans **Storage** et créez ces buckets:
- `avatars` (public)
- `property-images` (public)
- `verification-documents` (privé)

Ajoutez les policies RLS pour permettre les uploads authentifiés.

6. **Lancer l'application**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📦 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build de production
- `npm run type-check` - Vérifier les erreurs TypeScript
- `npm run lint` - Linter le code

## 🗄️ Structure de la base de données

### Tables principales

- **profiles** : Profils utilisateurs (locataires, démarcheurs, propriétaires)
- **properties** : Annonces immobilières
- **favorites** : Propriétés favorites des utilisateurs
- **conversations** : Fils de discussion
- **messages** : Messages entre utilisateurs
- **verifications** : Vérifications KYC des démarcheurs
- **reviews** : Avis sur les démarcheurs

Voir `supabase/migrations/20260124_initial_schema.sql` pour le schéma complet.

## 🎨 Design System

- **Couleur primaire** : `#14A800` (vert)
- **Couleur accent** : `#00D4AA` (cyan)
- **Police titres** : Fraunces (serif, bold)
- **Police corps** : Outfit (sans-serif)
- **Border radius** : 12px (boutons), 16px (cartes), 24px (modals)

## 🏗️ Architecture technique

### Stack

- **Frontend** : React 18 + TypeScript
- **Build** : Vite
- **Routing** : React Router v6
- **Styling** : Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Forms** : React Hook Form + Zod
- **Icons** : Lucide React
- **Notifications** : React Hot Toast

### Structure du projet

```
homeflow/
├── public/              # Fichiers statiques
├── src/
│   ├── components/      # Composants React
│   │   ├── common/      # Composants communs (ErrorBoundary, etc.)
│   │   ├── layout/      # Layout (Navbar, Footer, Sidebar)
│   │   ├── ui/          # Composants UI réutilisables
│   │   ├── property/    # Composants liés aux propriétés
│   │   ├── agent/       # Composants liés aux agents
│   │   └── messaging/   # Composants de messagerie
│   ├── contexts/        # Contexts React (Auth, etc.)
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Pages de l'application
│   ├── services/        # Services API (Supabase)
│   ├── types/           # Types TypeScript
│   ├── utils/           # Utilitaires et helpers
│   └── styles/          # Styles globaux
├── supabase/
│   ├── migrations/      # Migrations SQL
│   └── seed.sql         # Données de démo
└── ...
```

## 🔐 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Authentication** via Supabase Auth
- **Vérification KYC** pour les démarcheurs
- **Validation côté client et serveur**

## 📱 Responsive Design

L'application est entièrement responsive avec des breakpoints optimisés:

- **Mobile** : < 640px (1 colonne)
- **Tablet** : 640px - 1024px (2 colonnes)
- **Desktop** : > 1024px (3 colonnes)

## 🌐 Déploiement

### Vercel (recommandé)

1. Créez un compte sur [Vercel](https://vercel.com)
2. Importez votre repository
3. Configurez les variables d'environnement
4. Déployez !

### Netlify

1. Créez un compte sur [Netlify](https://netlify.com)
2. Connectez votre repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Ajoutez les variables d'environnement

## 🧪 Données de démo

Le fichier `supabase/seed.sql` contient:
- 3 démarcheurs (2 vérifiés, 1 en attente)
- 1 locataire de test
- 6 propriétés à Conakry (Kipé, Nongo, Kaloum, Lambanyi, Cameroun, Cosa)
- 5 avis pour les agents
- Conversations et messages de test

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commit vos changements (`git commit -m 'Ajout de ma feature'`)
4. Push vers la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

MIT

## 📞 Support

Pour toute question ou problème:
- Ouvrez une issue sur GitHub
- Email: support@homeflow.gn

---

Fait avec ❤️ pour la Guinée
