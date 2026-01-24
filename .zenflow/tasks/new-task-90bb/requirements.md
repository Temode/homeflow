# Product Requirements Document: HomeFlow

## Executive Summary

**Product Name**: HomeFlow  
**Target Market**: Guinean Real Estate Market (West Africa)  
**Primary Language**: French  
**Currency**: GNF (Guinean Franc)

HomeFlow is a modern real estate platform connecting tenants, landlords, and verified real estate agents (démarcheurs) in Guinea. The platform enables property search, verified agent communication, and secure payment processing.

---

## Product Vision

### Core Value Proposition
- **For Tenants**: Find trusted properties with verified agents and secure payment options
- **For Agents (Démarcheurs)**: Professional platform to showcase properties and build reputation
- **For Landlords**: Reach qualified tenants through verified agents

### Success Metrics
- 2,800+ property listings
- 450+ verified agents
- 12,000+ registered users
- High user engagement through messaging and favorites

---

## Design System

### Visual Identity

#### Color Palette
- **Primary**: `#14A800` (Green) - Trust, growth, prosperity
- **Accent**: `#00D4AA` (Cyan) - Modern, fresh
- **Warning**: `#F59E0B` (Orange) - Alerts, pending actions
- **Danger**: `#EF4444` (Red) - Errors, critical actions
- **Neutral**: Standard slate/gray palette for text and backgrounds

#### Typography
- **Display Font**: Fraunces (Google Fonts)
  - Usage: Page titles, hero headlines, prices
  - Weight: Bold
  - Style: Serif
  
- **Body Font**: Outfit (Google Fonts)
  - Usage: Body text, labels, descriptions
  - Weights: Regular (400), Medium (500), Semibold (600), Bold (700)
  - Style: Sans-serif

#### Spacing & Layout
- **Border Radius**:
  - Buttons/Inputs: `12px`
  - Cards: `16px`
  - Modals: `24px`
  
- **Design Principles**:
  - Mobile-first approach
  - Clean, modern, professional aesthetic
  - Consistent spacing using Tailwind's spacing scale
  - Accessible contrast ratios

#### Component Styling
- **Buttons**:
  - Primary: Gradient from `#14A800` to `#00D4AA` with colored shadow
  - Secondary: Solid colors
  - Outline: Border with transparent background
  - Ghost: Transparent with hover state
  - Transitions: `0.3s` smooth

- **Cards**:
  - Subtle border: `border-slate-200`
  - Hover: `shadow-xl` + `translateY(-8px)`
  - Image zoom on hover

---

## User Roles & Permissions

### 1. Locataire (Tenant)
**Capabilities**:
- Browse and search properties
- Save favorites
- Contact agents via messaging
- Request property visits
- View agent profiles and reviews
- Manage personal profile

**Restrictions**:
- Cannot create property listings
- Cannot access agent dashboard

### 2. Démarcheur (Real Estate Agent)
**Capabilities**:
- All tenant capabilities
- Create and manage property listings
- Receive and respond to inquiries
- View listing statistics (views, messages)
- Complete KYC verification process
- Build public profile with reviews

**Restrictions**:
- Must be verified to appear as "trusted"
- Unverified agents can post but lack verification badge

### 3. Propriétaire (Landlord)
**Capabilities**:
- Similar to démarcheur
- Can delegate listings to agents

**Note**: Focus MVP on Locataire and Démarcheur roles

---

## Core Features

### 1. Landing Page (`/`)

**Purpose**: Convert visitors to users and initiate property search

**Sections**:

#### Hero Section
- **Headline**: "Trouvez votre logement idéal en toute confiance"
- **Subheadline**: Supporting text about trust and ease
- **Search Bar**:
  - Text input: Location/keyword search
  - Select dropdown: Type (Location/Achat)
  - Primary CTA button: "Rechercher"
- **Visual**: Decorative blurred circles (green/cyan gradient) in background
- **Animation**: Subtle float animation on decorative elements

#### Statistics Section
- Three key metrics in prominent display:
  - **2,800+** annonces actives
  - **450+** démarcheurs vérifiés
  - **12,000+** utilisateurs inscrits

#### How It Works (4 Steps)
1. **Rechercher**: Browse verified listings
2. **Contacter**: Message verified agents
3. **Visiter**: Schedule property visits
4. **Payer**: Secure payment processing

Visual: Step cards with icons, numbers, and descriptions

#### Features Grid (6 Cards)
1. **Recherche avancée**: Advanced filters for precise search
2. **Vérification KYC**: All agents verified with ID
3. **Paiement sécurisé**: Protected transactions
4. **Reçus automatiques**: Automatic payment receipts
5. **Messagerie intégrée**: Built-in real-time chat
6. **Dashboard complet**: Comprehensive user dashboard

Each card: Icon, title, description

#### Testimonials (3 Cards)
- User photo/avatar
- Name and role
- Star rating
- Testimonial text
- Example content showcasing platform benefits

#### Final CTA Section
- Headline encouraging sign-up
- Two CTAs: "Créer un compte" (Primary) + "Explorer les annonces" (Secondary)

#### Footer
- Logo + tagline
- Links: À propos, Contact, Conditions, Confidentialité
- Social media icons
- Copyright notice

---

### 2. Property Search Page (`/recherche`)

**Purpose**: Enable users to find properties matching their criteria

#### Filters Sidebar/Panel
- **Type**: Radio buttons (Location / Achat)
- **Quartier**: Multi-select dropdown with Conakry neighborhoods
  - Kaloum, Dixinn, Matam, Ratoma, Matoto
  - Common areas: Kipé, Nongo, Lambanyi, Cosa, Cameroun
- **Prix**: Range slider with min/max inputs (in GNF)
- **Nombre de pièces**: Checkboxes (Studio, 1, 2, 3, 4, 5+)
- **Options**: Checkboxes (Parking, Meublé)
- **Apply/Reset** buttons

#### Results Grid
- **Layout**: Responsive grid
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns

- **PropertyCard Component** (per result):
  - Main image with type badge overlay (Location/Achat)
  - Favorite heart icon (top right)
  - Price (large, bold, primary color)
  - Title/address
  - Location (quartier, ville)
  - Key specs: Pièces • m² • Parking (if applicable)
  - Agent section:
    - Avatar (small)
    - Name + verification badge
  - Hover effect: Lift + shadow

- **Pagination**: Load more or numbered pages
- **Sort options**: Plus récent, Prix croissant, Prix décroissant

#### Empty State
- Illustration
- Message: "Aucune propriété trouvée"
- CTA: "Modifier les filtres" or "Voir toutes les annonces"

---

### 3. Property Detail Page (`/propriete/:id`)

**Purpose**: Provide comprehensive property information and enable contact

#### Photo Gallery
- **Main display**: Large featured image
- **Carousel/Thumbnails**: Navigate through all photos
- **Lightbox**: Click to view full-screen gallery
- **Count indicator**: "1 / 8" format

#### Property Information
- **Title**: Property name/description
- **Location**: Quartier, Ville with map pin icon
- **Price**: Large display with payment frequency
- **Type Badge**: Location/Achat/Terrain
- **Status Badge**: Disponible/Loué/Vendu

#### Key Characteristics
Icon-based grid:
- Pièces (bedrooms)
- Surface (m²)
- Parking (Yes/No)
- Meublé (Yes/No)
- Additional amenities

#### Description Section
- Full text description
- Expandable if long

#### Agent Card
- **Photo**: Profile picture
- **Name**: Full name
- **Verification badge**: Shield icon + "Vérifié"
- **Rating**: Stars (e.g., 4.8/5)
- **Stats**: X annonces actives
- **CTA**: "Contacter" button (primary)
- **Secondary CTA**: "Voir le profil"

#### Action Buttons
- **Primary**: "Demander une visite"
- **Secondary**: Add to favorites (heart icon)
- **Share**: Share property link

#### Location Map
- Embedded map showing property location (Google Maps or placeholder)
- Quartier highlighted

#### Related Properties
- "Propriétés similaires" section
- 3-4 PropertyCards in horizontal scroll/grid

---

### 4. Authentication Pages

#### Sign Up (`/inscription`)

**Layout**: Split screen design
- **Left**: Form (60% on desktop, full width on mobile)
- **Right**: Illustration/brand image (40% on desktop, hidden on mobile)

**Form Fields**:
- Nom complet (required)
- Email (required, validated)
- Téléphone (required, Guinea format: +224...)
- Mot de passe (required, strength indicator)
- Confirmer mot de passe (required, must match)
- Rôle (required): Radio buttons
  - Locataire
  - Démarcheur

**Footer**:
- Checkbox: "J'accepte les conditions d'utilisation"
- Submit button: "Créer mon compte"
- Link: "Déjà inscrit ? Se connecter"

**Validation**:
- Real-time field validation
- Error messages below fields
- Disabled submit until valid

#### Sign In (`/connexion`)

**Layout**: Same split screen design

**Form Fields**:
- Email (required)
- Mot de passe (required)
- "Se souvenir de moi" checkbox
- "Mot de passe oublié ?" link

**Footer**:
- Submit button: "Se connecter"
- Link: "Pas encore inscrit ? Créer un compte"

#### Password Reset (Future)
- Email-based reset flow via Supabase Auth

---

### 5. Tenant Dashboard (`/dashboard`)

**Purpose**: Centralized hub for tenant activities

#### Layout
- **Sidebar Navigation** (collapsible on mobile):
  - Vue d'ensemble
  - Mes favoris
  - Messages
  - Mon profil
  - Déconnexion

#### Overview Tab
**Metrics Cards** (2x2 grid):
- Favoris enregistrés (count)
- Messages non lus (count)
- Visites planifiées (count)
- Propriétés consultées (count)

**Recent Activity**:
- List of recent actions (favorites added, messages sent, visits requested)

**Recommended Properties**:
- Based on search history/favorites
- 3-4 PropertyCards

#### Favorites Tab
**Grid of Saved Properties**:
- PropertyCards with "Retirer des favoris" button
- Filter/sort options
- Empty state: "Aucun favori" + CTA to explore

#### Messages Tab
- Redirects to `/messages` page
- Or embedded conversation list + chat view

#### Profile Tab
- Redirects to `/profil` page
- Or embedded profile form

---

### 6. Agent Dashboard (`/dashboard/demarcheur`)

**Purpose**: Property management and performance tracking for agents

#### Layout
Similar sidebar navigation with different tabs:
- Vue d'ensemble
- Mes annonces
- Messages
- Mon profil
- Vérification (if not verified)
- Déconnexion

#### Overview Tab
**Performance Metrics** (2x2 grid):
- Annonces actives (count)
- Vues totales (sum of all listing views)
- Messages reçus (count this month)
- Avis reçus (average rating)

**Quick Actions**:
- Large CTA: "Créer une nouvelle annonce"
- Secondary: "Voir toutes mes annonces"

**Recent Activity**:
- New messages
- New favorites on your listings
- Listing view stats

#### Listings Tab
**Property List Table/Grid**:
- Each row/card shows:
  - Thumbnail
  - Title
  - Status badge (Actif, Loué, Vendu, Inactif)
  - Views count
  - Messages count
  - Actions: Modifier, Désactiver, Supprimer

**Filters**:
- All, Actif, Loué, Vendu, Inactif

**CTA**: "Nouvelle annonce" button

---

### 7. New Listing Form (`/nouvelle-annonce`)

**Purpose**: Multi-step form for agents to create property listings

**Access**: Agents only

#### Step 1: Basic Information
- Titre de l'annonce (required)
- Type (required): Location / Achat / Terrain
- Description (textarea, optional)
- Continue button

#### Step 2: Photos
- **Upload Zone**: Drag & drop or click to upload
- **Multiple files**: Support 1-10 images
- **Preview**: Thumbnail grid with reorder and delete
- **Formats**: JPG, PNG, WebP
- **Max size**: 5MB per image
- Back/Continue buttons

#### Step 3: Location
- Ville (default: Conakry, dropdown for future expansion)
- Quartier (required): Dropdown
  - Kaloum, Dixinn, Matam, Ratoma, Matoto
  - Plus: Kipé, Nongo, Lambanyi, Cosa, Cameroun, etc.
- Adresse précise (optional textarea)
- Map preview (future: drag pin to exact location)
- Back/Continue buttons

#### Step 4: Details & Pricing
- Prix (required): Number input + unit (GNF/mois or GNF)
- Nombre de pièces (required for Location/Achat): Number input
- Surface (m²) (required): Number input
- Checkboxes:
  - Parking disponible
  - Meublé
  - Jardin
  - Terrasse
  - Piscine
- Back/Continue buttons

#### Step 5: Summary
- **Review all information** in read-only cards
- Edit buttons per section (returns to that step)
- Submit button: "Publier l'annonce"
- Success: Redirect to listing detail or dashboard

**Validation**:
- Required fields marked
- Cannot proceed to next step if current step invalid
- Final submit disabled until all steps complete

**Draft Saving** (Future):
- Auto-save progress
- Resume later

---

### 8. Messaging System (`/messages`)

**Purpose**: Real-time communication between tenants and agents

#### Layout (Desktop)
**Two-column split**:

##### Left Sidebar (30%): Conversation List
- Search/filter conversations
- Each conversation item:
  - Avatar
  - Name + verification badge
  - Last message preview (truncated)
  - Timestamp (relative: "Il y a 2h")
  - Unread badge (count)
- Active conversation highlighted
- Sorted by most recent

##### Right Panel (70%): Chat View
**Header**:
- Avatar + Name + verification badge
- Property link (if conversation is about a property)
- Info button (view property details)

**Messages Area**:
- Scrollable message list
- **Sent messages** (right-aligned):
  - Green background (#14A800)
  - White text
  - Timestamp below
- **Received messages** (left-aligned):
  - Light gray background
  - Dark text
  - Timestamp below
- Auto-scroll to latest
- Date separators

**Input Area**:
- Text input field
- Send button (icon)
- Attachment button (icon, future)
- Enter to send, Shift+Enter for new line

#### Mobile Layout
- **Two separate views**:
  1. Conversation list (full screen)
  2. Chat view (full screen) with back button

#### Real-time Functionality
- **Supabase Realtime** subscriptions
- Instant message delivery
- Typing indicators (future)
- Read receipts (future)

#### Integration Points
- **PropertyCard "Contacter" button**:
  - If conversation exists: Opens existing conversation
  - If new: Creates conversation and opens chat
  - Pre-fills with template: "Bonjour, je suis intéressé(e) par [Property Title]..."

#### Notifications
- **Navbar badge**: Shows total unread message count
- **Browser notifications** (future): Permission-based alerts

#### Empty State
- No conversations yet
- Illustration + message
- CTA: "Explorer les annonces"

---

### 9. Favorites System

**Purpose**: Allow users to save and track preferred properties

#### Functionality

##### Add to Favorites
- **Heart icon** on PropertyCard (search, detail pages)
- **States**:
  - Empty heart: Not favorited
  - Filled red heart: Favorited
- **Animation**: Pop/scale on click
- **Authentication**: Must be logged in
  - Unauthenticated: Prompt to sign in

##### Remove from Favorites
- Click filled heart to toggle off
- From Favorites page: "Retirer" button or heart icon

#### Favorites Page (`/favoris`)

**Layout**:
- Same as search results page
- Grid of PropertyCards (all user's favorites)
- No filters (or basic filter: Type, Quartier)
- **Empty state**:
  - Illustration
  - "Aucun favori enregistré"
  - CTA: "Explorer les annonces"

**Sorting**:
- Plus récent (date added)
- Prix croissant/décroissant

#### Data Model
- **Table**: `favorites`
- **Fields**: `user_id`, `property_id`, `created_at`
- **Unique constraint**: (user_id, property_id)
- **RLS**: Users can only view/modify their own favorites

---

### 10. KYC Verification System

**Purpose**: Verify agent identities to build trust

#### Verification Badge
- **Icon**: Shield with check mark
- **Color**: Green (#14A800)
- **Placement**:
  - Next to agent name on PropertyCard
  - On agent profile
  - In messages
- **Tooltip**: "Identité vérifiée"

#### Verification Status
Three states:
1. **Not Submitted**: No badge, CTA to verify
2. **Pending**: Orange badge "En attente de vérification"
3. **Verified**: Green shield badge
4. **Rejected**: Red icon with re-submit option

#### Verification Page (`/verification`)

**Access**: Agents only, redirects if already verified

**Form Fields**:
- **Numéro CNI** (Guinean national ID number): Text input
- **Photo CNI Recto**: File upload
- **Photo CNI Verso**: File upload
- **Selfie avec CNI**: File upload (user holding ID next to face)
- Instructions and examples for each upload

**Submission**:
- Validation: All fields required
- Submit button: "Soumettre ma demande"
- Success message: "Demande envoyée. Nous vous répondrons sous 48-72h."
- Redirect to dashboard

**File Requirements**:
- Formats: JPG, PNG
- Max size: 5MB each
- Clear, readable photos

#### Agent Profile Integration
**Verification Status Section**:
- **If not verified**:
  - Warning banner: "Votre compte n'est pas vérifié"
  - Benefits of verification listed
  - CTA: "Commencer la vérification"
- **If pending**:
  - Info banner: "Vérification en cours d'examen"
  - Submitted date shown
- **If verified**:
  - Success banner with green badge
  - "Vérifié le [date]"

#### Admin Review (Future Phase)
- Admin dashboard to review submissions
- Approve/reject with reason
- Email notification to agent

---

### 11. User Profiles

#### My Profile Page (`/profil`)

**Access**: Authenticated users only

**Sections**:

##### Profile Photo
- **Current photo** displayed (or initials avatar)
- **Upload button**: Change photo
- **Stored in**: Supabase Storage (`avatars` bucket)

##### Personal Information
**Form fields** (editable):
- Nom complet
- Email (display only, cannot change)
- Téléphone
- Bio (textarea, for agents especially)
- Save button

##### Security
- **Change password** section:
  - Current password
  - New password
  - Confirm new password
  - Update button

##### Account Settings
- Email notifications toggle
- Language preference (future)
- Delete account (with confirmation modal)

##### Agent-Specific
- **Link to public profile**: "Voir mon profil public"
- **Verification status** widget with CTA if needed

**Save Confirmation**:
- Toast notification: "Profil mis à jour"

---

#### Public Agent Profile (`/demarcheur/:id`)

**Access**: Anyone (public page)

**Purpose**: Showcase agent credibility and listings

**Sections**:

##### Header
- **Large avatar** or profile photo
- **Name** with verification badge
- **Role**: "Démarcheur Immobilier"
- **Location**: Conakry, Guinée

##### Statistics Bar
- **Annonces actives**: Count with icon
- **Membre depuis**: Date (e.g., "Janvier 2023")
- **Note moyenne**: Star rating (e.g., 4.8/5)
- **Avis reçus**: Count of reviews

##### About Section
- **Bio**: Agent's description
- **Contact button**: "Envoyer un message"

##### Active Listings
- **Grid of PropertyCards** (agent's active listings only)
- Filter: All / Location / Achat
- Paginated if many listings

##### Reviews Section
- **AvisCard Component** (Review Card):
  - Star rating (1-5)
  - Comment text
  - Reviewer name + avatar
  - Date posted
- **Sort**: Plus récent, Meilleur note
- **Pagination**: Show 5-10 per page
- **Empty state**: "Aucun avis pour le moment"

##### Write Review (Future)
- Only if user has completed transaction with agent
- Form: Rating + comment
- Submit → adds to reviews list

---

### 12. Toast Notification System

**Purpose**: Provide user feedback for actions

#### Notification Types
1. **Success**:
   - Color: Green (#14A800)
   - Icon: Checkmark circle
   - Examples: "Annonce publiée", "Favori ajouté", "Profil mis à jour"

2. **Error**:
   - Color: Red (#EF4444)
   - Icon: X circle
   - Examples: "Échec de connexion", "Erreur de téléchargement", "Champ requis manquant"

3. **Info**:
   - Color: Blue
   - Icon: Info circle
   - Examples: "Message envoyé", "Verification en cours"

4. **Warning**:
   - Color: Orange (#F59E0B)
   - Icon: Alert triangle
   - Examples: "Session expire bientôt", "Compte non vérifié"

#### Behavior
- **Position**: Bottom-right corner
- **Duration**: 4 seconds (auto-dismiss)
- **Dismissible**: X button to close manually
- **Stacking**: Multiple toasts stack vertically
- **Animation**: Slide in from right, fade out

---

### 13. Loading & Empty States

#### Loading States

##### Skeleton Loaders
- **PropertyCard skeleton**:
  - Gray rectangles animating (pulse)
  - Placeholder for image, title, specs
- **Used on**: Search results, dashboard, favorites while loading

##### Spinner in Buttons
- **During action**: Replace button text with spinner
- Disable button to prevent double-click

##### Full Page Loading
- **Logo** (animated breathing effect)
- **Loading text**: "Chargement..."
- **Used on**: Initial page load, auth redirect

#### Empty States

##### No Search Results
- **Illustration**: Magnifying glass or empty box
- **Headline**: "Aucune propriété trouvée"
- **Subtext**: "Essayez de modifier vos filtres"
- **CTA**: "Réinitialiser les filtres" or "Voir toutes les annonces"

##### No Favorites
- **Illustration**: Empty heart
- **Headline**: "Aucun favori enregistré"
- **Subtext**: "Commencez à sauvegarder vos propriétés préférées"
- **CTA**: "Explorer les annonces"

##### No Messages
- **Illustration**: Empty inbox
- **Headline**: "Aucune conversation"
- **Subtext**: "Contactez un démarcheur pour commencer"
- **CTA**: "Voir les annonces"

##### No Listings (Agent)
- **Illustration**: Plus icon or empty folder
- **Headline**: "Aucune annonce publiée"
- **Subtext**: "Commencez à ajouter vos propriétés"
- **CTA**: "Créer une annonce"

---

### 14. Responsive Design

**Mobile-First Approach**: Design for mobile first, enhance for larger screens

#### Breakpoints (Tailwind)
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

#### Navigation
- **Mobile**:
  - Hamburger menu icon
  - Sidebar slides from right
  - Logo only (no text)
- **Desktop**:
  - Full horizontal nav
  - Logo + text
  - Inline menu items

#### Grids
- **PropertyCard Grid**:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns

- **Feature Cards**:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns

- **Dashboard Stats**:
  - Mobile: 2x2 grid (stacked)
  - Desktop: 4 columns

#### Forms
- **Hero Search Bar**:
  - Mobile: Single column stack (input, select, button)
  - Desktop: Horizontal row

#### Messaging
- **Mobile**: Separate pages (list → chat)
- **Desktop**: Split view (list + chat)

#### Dashboard Sidebar
- **Mobile**: Hidden by default, hamburger toggle
- **Desktop**: Always visible, collapsible

---

### 15. Animations & Visual Polish

#### Scroll Animations
- **Fade in**: Sections fade in as user scrolls down
- **Library**: Use Intersection Observer or lightweight library
- **Sections**: Features, testimonials, stats

#### Card Interactions
- **Hover**:
  - Lift: `translateY(-8px)`
  - Shadow: Increase to `shadow-xl`
  - Image zoom: Slight scale (1.05) on image inside card
- **Transition**: `0.3s ease-in-out`

#### Button Animations
- **Hover**: Slight scale (1.02) and deeper shadow
- **Active/Click**: Scale down (0.98)
- **Gradient buttons**: Subtle shift in gradient position

#### Hero Background
- **Decorative circles**:
  - Blurred gradient circles (green/cyan)
  - Positioned absolutely
  - Subtle float animation (slow vertical movement)

#### Form Interactions
- **Focus**: Input border changes to primary color, shadow appears
- **Success**: Green checkmark animates in
- **Error**: Red border with shake animation

#### Page Transitions
- **Route changes**: Smooth fade transition
- **Modals**: Fade in background, slide up content

---

## Data Model (Supabase)

### Database Schema

#### Table: `profiles`
Extends `auth.users` with application-specific data

```
id: uuid (PK, references auth.users)
full_name: text
phone: text
avatar_url: text (Supabase Storage URL)
role: text ('locataire' | 'demarcheur' | 'proprietaire')
is_verified: boolean (default: false)
bio: text (nullable)
created_at: timestamp with time zone
```

**Indexes**:
- `id` (primary)
- `role`

**RLS Policies**:
- Anyone can view profiles
- Users can update only their own profile

---

#### Table: `properties`
Property listings

```
id: uuid (PK, default: gen_random_uuid())
user_id: uuid (FK → profiles.id, NOT NULL)
title: text (NOT NULL)
description: text (nullable)
type: text ('location' | 'achat' | 'terrain')
price: integer (NOT NULL, in GNF)
quartier: text (NOT NULL)
ville: text (default: 'Conakry')
pieces: integer (nullable)
surface: integer (nullable, in m²)
parking: boolean (default: false)
meuble: boolean (default: false)
images: text[] (array of Supabase Storage URLs)
is_featured: boolean (default: false)
status: text (default: 'active', values: 'active' | 'loue' | 'vendu' | 'inactif')
created_at: timestamp with time zone
updated_at: timestamp with time zone
```

**Indexes**:
- `id` (primary)
- `user_id`
- `type`
- `quartier`
- `status`
- `price`

**RLS Policies**:
- Anyone can view active properties
- Only authenticated users can create
- Only owner can update/delete their properties

---

#### Table: `favorites`
User's saved properties

```
id: uuid (PK, default: gen_random_uuid())
user_id: uuid (FK → profiles.id, NOT NULL)
property_id: uuid (FK → properties.id, NOT NULL)
created_at: timestamp with time zone

CONSTRAINT: unique(user_id, property_id)
```

**Indexes**:
- `id` (primary)
- `user_id`
- `property_id`
- `unique(user_id, property_id)`

**RLS Policies**:
- Users can view only their favorites
- Users can insert only for themselves
- Users can delete only their favorites

---

#### Table: `conversations`
Chat conversations between users

```
id: uuid (PK, default: gen_random_uuid())
property_id: uuid (FK → properties.id, nullable)
participant_1: uuid (FK → profiles.id, NOT NULL)
participant_2: uuid (FK → profiles.id, NOT NULL)
created_at: timestamp with time zone

CONSTRAINT: check(participant_1 != participant_2)
```

**Indexes**:
- `id` (primary)
- `participant_1`
- `participant_2`
- `property_id`

**RLS Policies**:
- Users can view conversations where they are a participant
- Users can create conversations

---

#### Table: `messages`
Individual messages in conversations

```
id: uuid (PK, default: gen_random_uuid())
conversation_id: uuid (FK → conversations.id, NOT NULL)
sender_id: uuid (FK → profiles.id, NOT NULL)
content: text (NOT NULL)
is_read: boolean (default: false)
created_at: timestamp with time zone
```

**Indexes**:
- `id` (primary)
- `conversation_id`
- `sender_id`
- `created_at` (for sorting)

**RLS Policies**:
- Users can view messages in their conversations
- Users can insert messages in their conversations
- Users can update only `is_read` on messages sent to them

---

#### Table: `verifications`
KYC verification submissions

```
id: uuid (PK, default: gen_random_uuid())
user_id: uuid (FK → profiles.id, NOT NULL, UNIQUE)
cni_number: text (nullable)
cni_front_url: text (Supabase Storage URL, nullable)
cni_back_url: text (Supabase Storage URL, nullable)
selfie_url: text (Supabase Storage URL, nullable)
status: text (default: 'pending', values: 'pending' | 'verified' | 'rejected')
submitted_at: timestamp with time zone
reviewed_at: timestamp with time zone (nullable)
rejection_reason: text (nullable)
```

**Indexes**:
- `id` (primary)
- `user_id` (unique)
- `status`

**RLS Policies**:
- Users can view only their verification
- Users can insert/update only their verification (status change admin only)
- Admins can update status and reviewed_at

---

#### Table: `reviews`
Agent reviews from tenants

```
id: uuid (PK, default: gen_random_uuid())
demarcheur_id: uuid (FK → profiles.id, NOT NULL)
author_id: uuid (FK → profiles.id, NOT NULL)
rating: integer (CHECK: rating >= 1 AND rating <= 5)
comment: text (nullable)
created_at: timestamp with time zone

CONSTRAINT: check(demarcheur_id != author_id)
```

**Indexes**:
- `id` (primary)
- `demarcheur_id`
- `author_id`

**RLS Policies**:
- Anyone can view reviews
- Authenticated users can create reviews
- Users can update/delete only their reviews

---

### Storage Buckets

#### `avatars`
- **Purpose**: User profile photos
- **Access**: Public read, authenticated write (own files only)
- **Max size**: 2MB
- **Formats**: JPG, PNG, WebP

#### `property-images`
- **Purpose**: Property listing photos
- **Access**: Public read, authenticated write (own files only)
- **Max size**: 5MB per file
- **Formats**: JPG, PNG, WebP

#### `verification-documents`
- **Purpose**: KYC documents (CNI, selfies)
- **Access**: Private (owner and admin only)
- **Max size**: 5MB
- **Formats**: JPG, PNG, PDF

---

## Demo Data Requirements

### Properties (6 total)

#### 1. Villa Moderne 4 Pièces
- **Type**: Location
- **Prix**: 5,500,000 GNF/mois
- **Quartier**: Kipé, Ratoma
- **Pièces**: 4
- **Surface**: 320 m²
- **Parking**: Oui
- **Meublé**: Oui
- **Description**: Villa moderne avec jardin spacieux, idéale pour famille
- **Images**: 5-6 photos (villa moderne africaine)

#### 2. Appartement F3 Standing
- **Type**: Location
- **Prix**: 2,800,000 GNF/mois
- **Quartier**: Nongo, Ratoma
- **Pièces**: 3
- **Surface**: 95 m²
- **Parking**: Oui
- **Meublé**: Non
- **Description**: Appartement moderne avec finitions de qualité
- **Images**: 4-5 photos

#### 3. Studio Meublé Proche Centre
- **Type**: Location
- **Prix**: 1,500,000 GNF/mois
- **Quartier**: Kaloum, Centre-ville
- **Pièces**: 1
- **Surface**: 35 m²
- **Parking**: Non
- **Meublé**: Oui
- **Description**: Studio cosy parfait pour jeune professionnel
- **Images**: 3-4 photos

#### 4. Maison Familiale 5 Pièces
- **Type**: Achat
- **Prix**: 850,000,000 GNF
- **Quartier**: Lambanyi, Ratoma
- **Pièces**: 5
- **Surface**: 450 m²
- **Parking**: Oui
- **Meublé**: Non
- **Description**: Grande maison avec jardin, parfaite pour grande famille
- **Images**: 6-7 photos

#### 5. Duplex de Luxe Vue Mer
- **Type**: Location
- **Prix**: 8,000,000 GNF/mois
- **Quartier**: Cameroun, Dixinn
- **Pièces**: 4
- **Surface**: 200 m²
- **Parking**: Oui
- **Meublé**: Oui
- **Description**: Duplex luxueux avec terrasse et vue sur mer
- **Images**: 7-8 photos

#### 6. Appartement F2 Économique
- **Type**: Location
- **Prix**: 1,800,000 GNF/mois
- **Quartier**: Cosa, Matam
- **Pièces**: 2
- **Surface**: 55 m²
- **Parking**: Non
- **Meublé**: Non
- **Description**: Appartement propre et bien situé
- **Images**: 3-4 photos

---

### Agents (3 total)

#### 1. Mamadou Diallo
- **Role**: Démarcheur
- **Verified**: Yes
- **Properties**: 15 (assign demo properties #1, #2)
- **Rating**: 4.8/5
- **Reviews**: 24
- **Member Since**: January 2023
- **Bio**: "Spécialiste immobilier à Conakry depuis 10 ans. Je connais chaque quartier et je vous aide à trouver le logement parfait pour vos besoins."
- **Phone**: +224 621 XX XX XX

#### 2. Aissatou Barry
- **Role**: Démarcheur
- **Verified**: Yes
- **Properties**: 8 (assign demo properties #3, #5)
- **Rating**: 4.9/5
- **Reviews**: 18
- **Member Since**: March 2024
- **Bio**: "Passionnée par l'immobilier, je vous accompagne dans toutes vos démarches pour trouver le logement de vos rêves."
- **Phone**: +224 622 XX XX XX

#### 3. Ibrahima Sow
- **Role**: Démarcheur
- **Verified**: No (Pending)
- **Properties**: 3 (assign demo properties #4, #6)
- **Rating**: N/A (new)
- **Reviews**: 0
- **Member Since**: January 2026
- **Bio**: "Agent immobilier débutant mais très motivé. Je m'engage à vous fournir un service de qualité."
- **Phone**: +224 623 XX XX XX

---

### Sample Reviews

#### For Mamadou Diallo:
1. **5 stars** - "Excellent service, Mamadou m'a aidé à trouver ma villa en seulement 2 semaines!" - Fatoumata K. (Dec 2025)
2. **5 stars** - "Très professionnel et à l'écoute. Je recommande!" - Boubacar S. (Nov 2025)
3. **4 stars** - "Bon service mais parfois un peu long à répondre." - Mariama D. (Oct 2025)

#### For Aissatou Barry:
1. **5 stars** - "Aissatou est formidable! Elle a compris exactement ce que je cherchais." - Amadou T. (Jan 2026)
2. **5 stars** - "Merci pour votre aide précieuse dans ma recherche." - Kadiatou B. (Dec 2025)

---

### Test Users

#### Tenant Account
- **Email**: locataire@test.com
- **Password**: Test123!
- **Name**: Jean Kamara
- **Role**: Locataire
- **Has favorites**: Properties #1, #3, #5

#### Agent Account
- **Email**: demarcheur@test.com
- **Password**: Test123!
- **Name**: Mamadou Diallo
- **Role**: Démarcheur
- **Verified**: Yes

---

## Logo Design

**Description**: HomeFlow logo combines trust and modernity

**Concept**:
- **Shape**: Hexagonal/isometric form suggesting structure and solidity
- **Internal design**: Flow lines representing movement and connectivity
- **Top element**: Circle representing completion/wholeness
- **Colors**: Gradient from primary green (#14A800) to accent cyan (#00D4AA)

**Implementation Options**:
1. **Custom SVG**: Create simple geometric SVG with described elements
2. **Icon placeholder**: Use building/home icon from Heroicons/Lucide
3. **Text-based**: "HF" monogram with geometric styling

**Sizes needed**:
- Navbar: 40x40px
- Favicon: 32x32px, 16x16px
- Social share: 1200x630px

---

## Image Strategy

### Placeholder Service
Use **Unsplash API** or **Lorem Picsum** for demo property images:
- Search terms: "modern house africa", "apartment interior", "luxury villa", "african architecture"
- Dimensions: 800x600px (4:3 ratio) for property cards, 1200x800px for detail pages

### User Avatars
- **Initials-based avatars**: Generate colored circles with user initials
- **Library**: UI Avatar API or custom component
- **Fallback**: Neutral user icon

### Empty States
- **Illustrations**: Use Undraw.co or similar free illustration service
- **Style**: Minimal, matches brand colors

---

## Technical Assumptions

Since this is a new project, the following technology stack is assumed:

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 3+
- **Routing**: React Router 6
- **State Management**: React Context + Hooks (Zustand for complex state)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Supabase client (built-in)

### Backend
- **BaaS**: Supabase
  - **Auth**: Email/password, social login (future)
  - **Database**: PostgreSQL with Row Level Security
  - **Storage**: File uploads (images, documents)
  - **Realtime**: WebSocket subscriptions for messages

### Additional Libraries
- **Icons**: Lucide React or Heroicons
- **Fonts**: Google Fonts (Fraunces, Outfit)
- **Date formatting**: date-fns
- **Image optimization**: Lazy loading with Intersection Observer
- **Notifications**: React Hot Toast or similar
- **Animations**: Tailwind transitions + Framer Motion (optional)

### Development Tools
- **Package Manager**: npm or pnpm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

---

## MVP Phases (4-Day Plan)

### Phase 1: Core (Day 1)
**Goal**: Basic navigation and property browsing

- [ ] Project setup (Vite + React + TypeScript + Tailwind)
- [ ] Supabase project creation and database schema
- [ ] Landing page with hero and basic sections
- [ ] Search page with property grid (static data first)
- [ ] Property detail page
- [ ] Basic navigation and routing

### Phase 2: Functionality (Day 2)
**Goal**: User accounts and property management

- [ ] Authentication (sign up, sign in, sign out)
- [ ] Supabase integration (fetch real properties)
- [ ] Tenant dashboard (basic)
- [ ] Agent dashboard (basic)
- [ ] New listing form (multi-step)
- [ ] Favorites system (add/remove)

### Phase 3: Communication (Day 3)
**Goal**: Messaging and profiles

- [ ] Messaging page (conversation list + chat)
- [ ] Real-time message subscriptions
- [ ] Contact button integration
- [ ] User profile page (view/edit)
- [ ] Public agent profile page
- [ ] Reviews display

### Phase 4: Polish (Day 4)
**Goal**: Responsive design and UX improvements

- [ ] Mobile responsive adjustments
- [ ] Loading states (skeletons, spinners)
- [ ] Empty states (illustrations, messages)
- [ ] Toast notifications system
- [ ] Animations (hover, transitions, scroll)
- [ ] Form validation refinements
- [ ] Image uploads (property photos, avatars)
- [ ] KYC verification page (basic)

### Phase 5: Launch Prep (Bonus)
**Goal**: Production readiness

- [ ] Demo data seeding
- [ ] Environment variables configuration
- [ ] Error boundaries
- [ ] 404 page
- [ ] SEO meta tags
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Deploy to Vercel/Netlify
- [ ] Custom domain setup

---

## Out of Scope (Future Enhancements)

The following features are acknowledged but deferred to post-MVP:

1. **Payment Integration**:
   - Orange Money, MTN Mobile Money integration
   - Payment receipts generation
   - Transaction history

2. **Advanced Search**:
   - Map-based search
   - Saved searches with alerts
   - AI-powered recommendations

3. **Visit Scheduling**:
   - Calendar integration
   - Visit confirmation/reminders
   - Agent availability management

4. **Multi-language Support**:
   - French/English toggle
   - Local language support (Susu, Pular, Malinke)

5. **Admin Dashboard**:
   - User management
   - KYC review interface
   - Analytics and reporting
   - Featured listings management

6. **Advanced Messaging**:
   - File attachments
   - Voice messages
   - Video calls
   - Typing indicators
   - Read receipts

7. **Social Features**:
   - Share listings on social media
   - Referral program
   - User ratings beyond agents

8. **Mobile Apps**:
   - React Native iOS/Android apps

9. **Email Notifications**:
   - New message alerts
   - Listing updates
   - Weekly digest

---

## Success Criteria

The MVP is considered successful when:

1. **Core User Flows Work**:
   - ✅ User can sign up and create profile
   - ✅ Tenant can search and browse properties
   - ✅ Tenant can favorite properties
   - ✅ Tenant can contact agent via messages
   - ✅ Agent can create and manage listings
   - ✅ Real-time messaging functions correctly

2. **Quality Standards Met**:
   - ✅ Fully responsive (mobile, tablet, desktop)
   - ✅ No critical bugs in core flows
   - ✅ Page load times < 3 seconds
   - ✅ TypeScript with no errors
   - ✅ Consistent design system applied

3. **Data Integrity**:
   - ✅ RLS policies protect user data
   - ✅ Form validation prevents bad data
   - ✅ Demo data is realistic and diverse

4. **User Experience**:
   - ✅ Intuitive navigation
   - ✅ Clear feedback for all actions
   - ✅ Helpful empty states
   - ✅ Professional visual design

---

## Open Questions & Decisions Made

### Questions for Clarification:
1. **Payment Provider**: Which mobile money service should we prioritize? (Orange Money, MTN, Wave?)
   - **Decision**: Defer to Phase 5+, use placeholder for MVP

2. **Google Maps**: Do we have a budget for Google Maps API?
   - **Decision**: Use static map placeholder/screenshot for MVP, integrate later

3. **Email Service**: Which provider for transactional emails? (SendGrid, Mailgun, Supabase native?)
   - **Decision**: Use Supabase Auth emails for MVP, defer custom emails

4. **Image Hosting**: Use Supabase Storage or external CDN?
   - **Decision**: Supabase Storage for simplicity in MVP

5. **Visit Scheduling**: Calendar integration preference (Google Calendar, custom?)
   - **Decision**: Out of scope for MVP, simple "request visit" button only

### Assumptions & Decisions:
1. **Primary language**: French (Guinea's official language)
2. **Currency display**: "GNF" suffix, no decimals, space separator for thousands (e.g., "5 500 000 GNF")
3. **Phone format**: Guinea format (+224 XXX XX XX XX)
4. **Default city**: Conakry (can expand to other cities later)
5. **Property images**: 1-10 per listing, first is featured
6. **Agent verification**: Manual review process (admin approves)
7. **Messaging**: Text only for MVP (no files, images, voice)
8. **Reviews**: Anyone can review after messaging (no transaction requirement for MVP)

---

## Appendix

### Guinean Real Estate Context

**Common Neighborhoods (Conakry)**:
- **Kaloum**: Central business district, expensive
- **Dixinn**: Coastal, diplomatic area, upscale
- **Matam**: University area, mixed residential
- **Ratoma**: Largest commune, diverse
  - Kipé: Residential, popular
  - Nongo: Mixed, accessible
  - Lambanyi: Growing area
- **Matoto**: Industrial and residential
  - Cosa: Residential
  - Yimbaya: Popular neighborhood

**Typical Price Ranges** (Location):
- Studio: 1,200,000 - 2,000,000 GNF/month
- F2 (2 rooms): 1,500,000 - 3,000,000 GNF/month
- F3 (3 rooms): 2,500,000 - 4,500,000 GNF/month
- F4+ (4+ rooms): 4,000,000 - 8,000,000 GNF/month
- Villas: 6,000,000 - 15,000,000 GNF/month

**Purchase Prices**:
- Apartments: 300,000,000 - 800,000,000 GNF
- Villas: 600,000,000 - 2,000,000,000+ GNF
- Land plots: 50,000,000 - 500,000,000+ GNF

---

This PRD provides a comprehensive foundation for building HomeFlow MVP. All requirements are based on the task description with reasonable assumptions for technical implementation.
