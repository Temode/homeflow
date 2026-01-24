# Technical Specification: HomeFlow

## 1. Technical Context

### Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **Styling**: Tailwind CSS 3+
- **Routing**: React Router 6
- **State Management**: 
  - React Context + Hooks for auth/user state
  - Zustand for complex client state (favorites, UI state)
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Supabase JS Client

#### Backend (BaaS)
- **Platform**: Supabase
  - **Auth**: Email/password authentication
  - **Database**: PostgreSQL 15+
  - **Storage**: Supabase Storage for images
  - **Realtime**: WebSocket subscriptions for messaging

#### UI Libraries
- **Icons**: Lucide React (tree-shakeable)
- **Fonts**: Google Fonts (Fraunces, Outfit)
- **Date Formatting**: date-fns (lightweight)
- **Notifications**: react-hot-toast
- **Animations**: 
  - Tailwind CSS transitions (primary)
  - Framer Motion (optional, for complex animations)
- **Image Optimization**: Native lazy loading + Intersection Observer

#### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Type Checking**: TypeScript (strict mode)
- **Version Control**: Git

### Environment Requirements
- Node.js 18+ LTS
- Supabase account and project
- Environment variables: `.env.local`

---

## 2. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                   │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │  React App (Vite + TypeScript + Tailwind)    │  │
│  │                                                │  │
│  │  ├─ Pages (Routes)                            │  │
│  │  ├─ Components (UI + Features)                │  │
│  │  ├─ Contexts (Auth, Theme)                    │  │
│  │  ├─ Hooks (Custom logic)                      │  │
│  │  ├─ Utils (Helpers, formatters)               │  │
│  │  └─ Services (Supabase client)                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────┐
│                  Supabase Backend                    │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   Auth API   │  │  PostgREST   │  │ Storage  │  │
│  │ (JWT tokens) │  │   (DB API)   │  │  (S3-    │  │
│  │              │  │              │  │  like)   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│                                                       │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │   Realtime   │  │   PostgreSQL Database        │ │
│  │  (WebSocket) │  │   + Row Level Security (RLS) │ │
│  └──────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Design Patterns

1. **Compound Components**: For complex UI (PropertyCard, ChatInterface)
2. **Custom Hooks**: Reusable logic (useAuth, useProperties, useFavorites)
3. **Context Providers**: Global state (AuthContext, NotificationContext)
4. **Repository Pattern**: Data access layer (services/supabase/)
5. **Presenter/Container**: Separate data fetching from UI rendering

---

## 3. Project Structure

```
homeflow/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── illustrations/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/                # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── property/              # Property-related components
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyGrid.tsx
│   │   │   ├── PropertyFilters.tsx
│   │   │   ├── PropertyGallery.tsx
│   │   │   └── PropertyStats.tsx
│   │   ├── messaging/             # Messaging components
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ChatView.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── agent/                 # Agent-specific components
│   │   │   ├── AgentCard.tsx
│   │   │   ├── VerificationBadge.tsx
│   │   │   └── ReviewCard.tsx
│   │   └── common/                # Common components
│   │       ├── LoadingSkeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── SearchBar.tsx
│   ├── pages/
│   │   ├── Home.tsx               # Landing page
│   │   ├── Search.tsx             # Property search
│   │   ├── PropertyDetail.tsx     # Property details
│   │   ├── SignIn.tsx             # Authentication
│   │   ├── SignUp.tsx
│   │   ├── Dashboard.tsx          # Tenant dashboard
│   │   ├── DashboardAgent.tsx     # Agent dashboard
│   │   ├── NewListing.tsx         # Create listing
│   │   ├── Messages.tsx           # Messaging
│   │   ├── Favorites.tsx          # Saved properties
│   │   ├── Profile.tsx            # User profile
│   │   ├── ProfileAgent.tsx       # Public agent profile
│   │   ├── Verification.tsx       # KYC verification
│   │   └── NotFound.tsx           # 404 page
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Authentication state
│   │   ├── NotificationContext.tsx # Toast notifications
│   │   └── ThemeContext.tsx       # Future: theme switching
│   ├── hooks/
│   │   ├── useAuth.ts             # Auth operations
│   │   ├── useProperties.ts       # Property CRUD
│   │   ├── useFavorites.ts        # Favorites management
│   │   ├── useMessages.ts         # Messaging logic
│   │   ├── useSupabaseQuery.ts    # Generic query hook
│   │   └── useIntersectionObserver.ts # Lazy loading
│   ├── services/
│   │   ├── supabase.ts            # Supabase client config
│   │   ├── auth.service.ts        # Auth operations
│   │   ├── properties.service.ts  # Property operations
│   │   ├── messages.service.ts    # Messaging operations
│   │   ├── favorites.service.ts   # Favorites operations
│   │   ├── storage.service.ts     # File uploads
│   │   └── profiles.service.ts    # User profiles
│   ├── types/
│   │   ├── database.types.ts      # Supabase generated types
│   │   ├── property.types.ts      # Property types
│   │   ├── user.types.ts          # User types
│   │   └── message.types.ts       # Message types
│   ├── utils/
│   │   ├── formatters.ts          # Currency, date formatting
│   │   ├── validators.ts          # Zod schemas
│   │   ├── constants.ts           # App constants
│   │   ├── helpers.ts             # Utility functions
│   │   └── quartiers.ts           # Conakry neighborhoods data
│   ├── styles/
│   │   └── globals.css            # Global styles + Tailwind
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts              # Vite types
├── supabase/
│   ├── migrations/                # Database migrations
│   │   └── 20260124_initial_schema.sql
│   └── seed.sql                   # Demo data seeding
├── .env.local                     # Environment variables
├── .env.example                   # Example env file
├── .gitignore
├── package.json
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Tailwind config
├── vite.config.ts                 # Vite config
├── eslint.config.js               # ESLint config
├── prettier.config.js             # Prettier config
└── README.md
```

---

## 4. Implementation Approach

### 4.1 Development Workflow

**Phase-based incremental delivery**:
1. Core infrastructure → UI foundation → Features → Polish
2. Each phase produces working, testable functionality
3. Database migrations before frontend implementation
4. Component-first development (build UI library first)

### 4.2 Component Development Strategy

**UI Component Library First**:
- Build atomic UI components (Button, Input, Badge, Card)
- Ensure consistent styling with Tailwind + design system
- All components typed with TypeScript interfaces
- Props follow consistent naming conventions

**Feature Components Second**:
- Compose UI components into feature-specific components
- PropertyCard, AgentCard, etc. use UI primitives
- Keep business logic in custom hooks
- Presentation components stay pure

### 4.3 Data Fetching Strategy

**Supabase Client Patterns**:
```typescript
// Service layer handles all Supabase calls
// services/properties.service.ts
export const getProperties = async (filters?: PropertyFilters) => {
  let query = supabase
    .from('properties')
    .select('*, profiles(*)')
    .eq('status', 'active');
  
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.quartier) query = query.eq('quartier', filters.quartier);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Custom hook wraps service calls
// hooks/useProperties.ts
export const useProperties = (filters?: PropertyFilters) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getProperties(filters)
      .then(setProperties)
      .finally(() => setLoading(false));
  }, [filters]);
  
  return { properties, loading };
};
```

### 4.4 Authentication Flow

**Supabase Auth Integration**:
1. AuthContext provides user state globally
2. Protected routes check auth status
3. JWT tokens automatically handled by Supabase client
4. RLS policies enforce server-side authorization

**Implementation**:
```typescript
// contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4.5 Form Handling

**React Hook Form + Zod Validation**:
```typescript
// utils/validators.ts
export const signUpSchema = z.object({
  full_name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^\+224/, 'Format: +224 XXX XX XX XX'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  role: z.enum(['locataire', 'demarcheur']),
});

// pages/SignUp.tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(signUpSchema),
});

const onSubmit = async (data) => {
  try {
    await signUp(data);
    toast.success('Compte créé avec succès!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 4.6 File Upload Strategy

**Image Uploads to Supabase Storage**:
```typescript
// services/storage.service.ts
export const uploadPropertyImage = async (file: File, propertyId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
  const filePath = `properties/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(filePath, file);
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath);
  
  return publicUrl;
};
```

**Multi-step Form Implementation**:
- Use React state to track current step
- Store form data in local state between steps
- Validate each step before proceeding
- Upload images only on final submit
- Show progress indicator

### 4.7 Real-time Messaging

**Supabase Realtime Subscriptions**:
```typescript
// hooks/useMessages.ts
export const useConversationMessages = (conversationId: string) => {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Fetch initial messages
    fetchMessages(conversationId).then(setMessages);
    
    // Subscribe to new messages
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);
  
  return messages;
};
```

### 4.8 State Management Strategy

**Context for Global State**:
- AuthContext: User authentication state
- NotificationContext: Toast notifications

**Zustand for Client State**:
```typescript
// stores/favoritesStore.ts
import create from 'zustand';

interface FavoritesState {
  favoriteIds: Set<string>;
  toggleFavorite: (propertyId: string) => void;
  loadFavorites: (userId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  favoriteIds: new Set(),
  toggleFavorite: async (propertyId) => {
    // Optimistic update
    set((state) => {
      const newIds = new Set(state.favoriteIds);
      if (newIds.has(propertyId)) {
        newIds.delete(propertyId);
        removeFavorite(propertyId); // API call
      } else {
        newIds.add(propertyId);
        addFavorite(propertyId); // API call
      }
      return { favoriteIds: newIds };
    });
  },
  loadFavorites: async (userId) => {
    const favorites = await fetchFavorites(userId);
    set({ favoriteIds: new Set(favorites.map(f => f.property_id)) });
  },
}));
```

### 4.9 Styling Approach

**Tailwind CSS Configuration**:
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#14A800',
        accent: '#00D4AA',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        card: '16px',
        modal: '24px',
      },
      boxShadow: {
        'primary': '0 4px 14px rgba(20, 168, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
```

**Component Styling Patterns**:
- Use Tailwind utility classes directly in JSX
- Extract repeated patterns into components
- Use `clsx` or `cn` helper for conditional classes
- Maintain consistent spacing (Tailwind scale: 4, 6, 8, 12, 16, 24)

---

## 5. Data Model Implementation

### 5.1 Database Schema

**Migration File**: `supabase/migrations/20260124_initial_schema.sql`

All tables follow this structure (see requirements.md for complete schema):
- profiles
- properties
- favorites
- conversations
- messages
- verifications
- reviews

### 5.2 Row Level Security (RLS) Policies

**Critical Security Rules**:

```sql
-- Profiles: Public read, own update
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Properties: Public read active, own CRUD
CREATE POLICY "Anyone can view active properties"
  ON properties FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can create properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

-- Favorites: Own only
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id);

-- Messages: Conversation participants only
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() 
           OR conversations.participant_2 = auth.uid())
    )
  );
```

### 5.3 Storage Buckets Configuration

**Bucket Setup**:
```typescript
// Three buckets with different access policies

// 1. avatars (public read)
supabase.storage.createBucket('avatars', {
  public: true,
  fileSizeLimit: 2 * 1024 * 1024, // 2MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

// 2. property-images (public read)
supabase.storage.createBucket('property-images', {
  public: true,
  fileSizeLimit: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

// 3. verification-documents (private)
supabase.storage.createBucket('verification-documents', {
  public: false,
  fileSizeLimit: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
});
```

**Storage RLS Policies**:
```sql
-- Avatars: Anyone read, own upload
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Property images: Public read, authenticated write
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');
```

---

## 6. Component Architecture

### 6.1 Reusable UI Components

**Button Component** (`components/ui/Button.tsx`):
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'rounded-xl font-medium transition-all duration-300';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-accent text-white shadow-primary hover:shadow-xl hover:scale-102',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-primary hover:bg-primary/10',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
```

**PropertyCard Component** (`components/property/PropertyCard.tsx`):
```typescript
interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  return (
    <Card className="group hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden rounded-t-card">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <Badge variant={property.type === 'location' ? 'success' : 'info'} className="absolute top-4 left-4">
          {property.type === 'location' ? 'Location' : 'Achat'}
        </Badge>
        <button 
          onClick={onFavoriteToggle}
          className="absolute top-4 right-4 p-2 bg-white rounded-full hover:scale-110 transition"
        >
          <Heart fill={isFavorite ? '#EF4444' : 'none'} stroke={isFavorite ? '#EF4444' : '#000'} />
        </button>
      </div>
      
      <div className="p-4">
        <p className="text-2xl font-display font-bold text-primary mb-2">
          {formatPrice(property.price)} {property.type === 'location' ? 'GNF/mois' : 'GNF'}
        </p>
        <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
        <p className="text-slate-600 text-sm mb-3">
          <MapPin className="inline w-4 h-4" /> {property.quartier}, {property.ville}
        </p>
        
        <div className="flex gap-4 text-sm text-slate-600 mb-3">
          {property.pieces && <span><Home className="inline w-4 h-4" /> {property.pieces} pièces</span>}
          {property.surface && <span>{property.surface} m²</span>}
          {property.parking && <span><Car className="inline w-4 h-4" /> Parking</span>}
        </div>
        
        <div className="flex items-center gap-2 pt-3 border-t">
          <Avatar user={property.profiles} size="sm" />
          <span className="text-sm font-medium">{property.profiles.full_name}</span>
          {property.profiles.is_verified && <VerificationBadge size="sm" />}
        </div>
      </div>
    </Card>
  );
};
```

### 6.2 Layout Components

**DashboardLayout** (`components/layout/DashboardLayout.tsx`):
- Persistent sidebar navigation
- Responsive: collapsible on mobile
- Nested routing for dashboard sections
- Logout functionality

**Navbar** (`components/layout/Navbar.tsx`):
- Logo + navigation links
- Authentication state awareness
- Messages notification badge
- Mobile hamburger menu

---

## 7. Routing Structure

**React Router Configuration** (`src/App.tsx`):
```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'recherche', element: <Search /> },
      { path: 'propriete/:id', element: <PropertyDetail /> },
      { path: 'connexion', element: <SignIn /> },
      { path: 'inscription', element: <SignUp /> },
      { path: 'favoris', element: <ProtectedRoute><Favorites /></ProtectedRoute> },
      { path: 'messages', element: <ProtectedRoute><Messages /></ProtectedRoute> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'demarcheur', element: <RoleRoute role="demarcheur"><DashboardAgent /></RoleRoute> },
        ],
      },
      { path: 'nouvelle-annonce', element: <RoleRoute role="demarcheur"><NewListing /></RoleRoute> },
      { path: 'profil', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: 'demarcheur/:id', element: <ProfileAgent /> },
      { path: 'verification', element: <RoleRoute role="demarcheur"><Verification /></RoleRoute> },
    ],
  },
]);
```

---

## 8. Delivery Phases

### Phase 1: Foundation (Day 1) ✅
**Goal**: Basic structure and static pages

**Tasks**:
1. Project initialization
   - Create Vite + React + TypeScript project
   - Install dependencies (Tailwind, React Router, etc.)
   - Configure Tailwind with design system colors/fonts
   - Setup ESLint + Prettier

2. Supabase setup
   - Create Supabase project
   - Run initial migration (all tables + RLS)
   - Configure storage buckets
   - Test connection from client

3. UI component library
   - Button (all variants)
   - Input (text, select, textarea)
   - Badge
   - Card
   - Avatar (with initials fallback)
   - Modal
   - Loading skeletons

4. Layout components
   - Navbar (responsive)
   - Footer
   - DashboardLayout with sidebar

5. Static pages
   - Landing page (hero, features, testimonials, stats)
   - Property search page (UI only, hardcoded data)
   - Property detail page (UI only)
   - 404 page

**Verification**:
- All pages render without errors
- Tailwind classes apply correctly
- Responsive design works (mobile, tablet, desktop)
- TypeScript compiles with no errors

---

### Phase 2: Authentication & Data (Day 2) ✅
**Goal**: User accounts and dynamic property data

**Tasks**:
1. Authentication system
   - AuthContext + AuthProvider
   - Sign up page (functional)
   - Sign in page (functional)
   - Protected route wrapper
   - Role-based route wrapper
   - Logout functionality

2. Supabase integration
   - Configure Supabase client
   - Auth service (signUp, signIn, signOut, getUser)
   - Properties service (CRUD operations)
   - Profiles service

3. Property features
   - Fetch properties from Supabase
   - Display in search page
   - Property detail page with real data
   - Search filters (type, quartier, price, pieces)
   - PropertyCard component (functional)

4. Dashboards
   - Tenant dashboard (overview, stats)
   - Agent dashboard (overview, stats, listings table)
   - Role-based navigation

5. New listing form
   - Multi-step wizard (5 steps)
   - Form validation (Zod schemas)
   - Image upload to Supabase Storage
   - Create property in database
   - Success redirect

**Verification**:
- User can sign up and sign in
- Auth state persists across page refresh
- Properties load from database
- Filters work correctly
- New listing creation succeeds
- TypeScript + ESLint pass

---

### Phase 3: Interactive Features (Day 3) ✅
**Goal**: Favorites, messaging, and profiles

**Tasks**:
1. Favorites system
   - Favorites service (add, remove, fetch)
   - useFavorites hook or Zustand store
   - Heart icon toggle on PropertyCard
   - Favorites page with grid
   - Empty state
   - Optimistic UI updates

2. Messaging system
   - Messages service (conversations, messages)
   - useMessages hook with Realtime subscriptions
   - Messages page layout (list + chat)
   - ConversationList component
   - ChatView component
   - MessageBubble component
   - ChatInput with send functionality
   - "Contacter" button creates/opens conversation
   - Unread badge in navbar

3. User profiles
   - Profile page (view/edit own profile)
   - Avatar upload
   - Profile update (name, phone, bio)
   - Password change

4. Public agent profile
   - ProfileAgent page
   - Display agent info + stats
   - List agent's properties
   - Reviews section (display only)
   - "Contacter" button

**Verification**:
- Favorites add/remove works
- Messages send and receive in real-time
- Conversations list updates
- Profile updates save correctly
- Public agent profile displays properly

---

### Phase 4: Polish & UX (Day 4) ✅
**Goal**: Production-ready user experience

**Tasks**:
1. Loading states
   - PropertyCard skeleton
   - Dashboard loading spinners
   - Button loading states
   - Full-page loader

2. Empty states
   - No search results
   - No favorites
   - No messages
   - No listings (for agents)
   - Use illustrations + helpful CTAs

3. Toast notifications
   - Setup react-hot-toast
   - Success/error/info/warning toasts
   - Integrate in all user actions
   - Bottom-right positioning

4. Animations
   - Scroll animations (fade in sections)
   - Card hover effects
   - Button interactions
   - Hero background decorative circles
   - Page transitions

5. Mobile responsiveness
   - Test all pages on mobile
   - Fix layout issues
   - Mobile navigation (hamburger menu)
   - Mobile messaging (separate views)
   - Touch-friendly buttons

6. Form enhancements
   - Real-time validation
   - Error messages
   - Success feedback
   - Disabled states

7. KYC verification page
   - Verification form (basic UI)
   - Document upload (CNI, selfie)
   - Status display (pending/verified/rejected)

**Verification**:
- All loading states show correctly
- Empty states are helpful
- Toasts appear for all actions
- Animations are smooth (no jank)
- Mobile experience is excellent
- Forms validate properly

---

### Phase 5: Launch Prep (Bonus) 🚀
**Goal**: Production deployment

**Tasks**:
1. Demo data seeding
   - Create seed.sql file
   - 6 properties with realistic data
   - 3 agents (2 verified, 1 pending)
   - Sample reviews
   - Test user accounts

2. Environment configuration
   - .env.example file
   - Document all env variables
   - Supabase URL and anon key

3. Error handling
   - Error boundaries
   - 404 page
   - Network error handling
   - Graceful degradation

4. Performance optimization
   - Code splitting (lazy routes)
   - Image lazy loading
   - Optimize Tailwind bundle
   - Minimize bundle size

5. SEO & Meta tags
   - Meta tags for each page
   - Open Graph images
   - Favicon

6. Deployment
   - Build for production
   - Deploy to Vercel/Netlify
   - Configure environment variables
   - Test deployed app
   - Custom domain (optional)

**Verification**:
- Demo data loads correctly
- Build succeeds with no errors
- Production app is performant
- SEO meta tags present
- All features work in production

---

## 9. Verification Approach

### 9.1 Type Checking
```bash
# Run before committing
npm run type-check
# Should show 0 errors
```

### 9.2 Linting
```bash
# Run ESLint
npm run lint
# Fix auto-fixable issues
npm run lint:fix
```

### 9.3 Manual Testing Checklist

**Authentication Flow**:
- [ ] Sign up with valid data
- [ ] Sign up validation errors
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong credentials
- [ ] Auth state persists after refresh
- [ ] Logout works

**Property Features**:
- [ ] Properties load on search page
- [ ] Filters work correctly
- [ ] Property detail shows all info
- [ ] Property images display
- [ ] Agent info appears

**Favorites**:
- [ ] Add to favorites (logged in)
- [ ] Remove from favorites
- [ ] Favorites page shows saved properties
- [ ] Favorites persist after refresh
- [ ] Prompt to login if not authenticated

**Messaging**:
- [ ] Create new conversation from property
- [ ] Send message
- [ ] Receive message in real-time
- [ ] Conversations list updates
- [ ] Unread count shows

**Agent Features**:
- [ ] Agent dashboard shows stats
- [ ] Create new listing (all 5 steps)
- [ ] Upload property images
- [ ] Listings appear in agent dashboard
- [ ] Edit/delete listings

**Responsive Design**:
- [ ] Mobile navigation works
- [ ] All pages work on mobile
- [ ] Touch targets are adequate
- [ ] No horizontal scroll
- [ ] Images scale properly

### 9.4 Performance Metrics

**Target Metrics**:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance: > 90
- Bundle size: < 500KB (gzipped)

**Tools**:
- Chrome DevTools Lighthouse
- Vite bundle analyzer
- React DevTools Profiler

---

## 10. Environment Variables

**`.env.local`** (not committed):
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**`.env.example`** (committed):
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 11. Key Technical Decisions

### 11.1 Why Vite?
- Faster dev server than CRA
- Better TypeScript support
- Smaller production bundles
- Modern tooling

### 11.2 Why Supabase?
- Full backend solution (auth + DB + storage + realtime)
- PostgreSQL with RLS for security
- Generous free tier
- Easy deployment
- Auto-generated API

### 11.3 Why Tailwind CSS?
- Utility-first matches component architecture
- Faster development
- Consistent design system
- Excellent responsive utilities
- Tree-shakeable (small bundle)

### 11.4 Why Not Next.js?
- SSR not critical for this app (mostly authenticated views)
- Simpler deployment with SPA
- Faster development for MVP
- Can migrate later if SEO becomes priority

### 11.5 State Management Choice
- Context API sufficient for auth
- Zustand for favorites (simpler than Redux)
- React Query not needed (Supabase client handles caching)

---

## 12. Security Considerations

### 12.1 Row Level Security
- All tables have RLS enabled
- Users can only access their own data (favorites, messages, profile)
- Public data properly scoped (active properties, public profiles)
- Admin-only operations protected

### 12.2 File Upload Security
- File size limits enforced
- MIME type validation
- Private documents bucket (verification)
- Public buckets for user-uploaded images

### 12.3 Input Validation
- Client-side: Zod schemas
- Server-side: PostgreSQL constraints + RLS
- XSS prevention: React escapes by default
- SQL injection prevention: Supabase uses parameterized queries

### 12.4 Authentication
- JWT tokens managed by Supabase
- Secure password hashing (bcrypt)
- Email verification (future)
- Session timeout handling

---

## 13. Future Enhancements (Post-MVP)

**Technical Debt to Address**:
1. Add comprehensive unit tests (Vitest + React Testing Library)
2. E2E tests (Playwright/Cypress)
3. Implement proper caching strategy (React Query)
4. Add image optimization (Sharp/next-image alternative)
5. Implement proper logging (Sentry)
6. Add analytics (Plausible/Google Analytics)
7. Migrate to Next.js for better SEO
8. Implement PWA features (service worker, offline support)
9. Add internationalization (i18next)
10. Optimize database queries (indexes, materialized views)

---

## 14. Success Metrics

**Technical KPIs**:
- Zero TypeScript errors
- < 5 ESLint warnings
- Lighthouse score > 90
- Page load < 3s
- Zero critical security vulnerabilities

**Functional KPIs**:
- All core user flows working
- Real-time messaging functional
- RLS policies enforced
- File uploads working
- Responsive on all devices

---

This technical specification provides a comprehensive blueprint for implementing HomeFlow. All architectural decisions are based on modern React best practices, Supabase capabilities, and the requirements outlined in the PRD.
