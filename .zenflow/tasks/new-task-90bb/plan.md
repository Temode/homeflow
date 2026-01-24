# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: 1eadd60c-1717-4c4e-8da1-e3e1b6e36caf -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: 80f38170-ece0-4a00-8979-ea63171e2d5b -->

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning
<!-- chat-id: b1bd37c7-2afb-4b61-9805-4935f0cbc4a1 -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

1. Break down the work into concrete tasks
2. Each task should reference relevant contracts and include verification steps
3. Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function) or too broad (entire feature).

If the feature is trivial and doesn't warrant full specification, update this workflow to remove unnecessary steps and explain the reasoning to the user.

Save to `{@artifacts_path}/plan.md`.

### [x] Step: Phase 1 - Foundation & Project Setup
<!-- chat-id: a7ea35a5-e4aa-4e8c-99a5-4925a01b2fa3 -->

**Goal**: Set up project structure, UI component library, and static pages

#### 1.1 Project Initialization
- [x] Create Vite + React + TypeScript project
- [x] Install dependencies (Tailwind CSS, React Router, Lucide icons, react-hot-toast, React Hook Form, Zod, date-fns)
- [x] Configure Tailwind with design system (colors: primary #14A800, accent #00D4AA, fonts: Fraunces/Outfit, border-radius)
- [x] Setup ESLint + Prettier
- [x] Create .gitignore with common paths (node_modules, dist, .env.local)
- [x] Create .env.example file

#### 1.2 Supabase Setup
- [x] Create migration file `supabase/migrations/20260124_initial_schema.sql` with all tables (profiles, properties, favorites, conversations, messages, verifications, reviews)
- [x] Add RLS policies for all tables
- [x] Configure Supabase client in `src/services/supabase.ts`
- [ ] Create Supabase project (requires user to do this manually in Supabase dashboard)
- [ ] Configure storage buckets (avatars, property-images, verification-documents) - will be done when needed
- [ ] Add storage RLS policies - will be done when storage is configured

#### 1.3 UI Component Library
- [x] Create `components/ui/Button.tsx` (variants: primary, secondary, outline, ghost; sizes: sm, md, lg)
- [x] Create `components/ui/Input.tsx` (text, select, textarea with label, helper text, error states)
- [x] Create `components/ui/Select.tsx` (select component)
- [x] Create `components/ui/Badge.tsx` (variants: success, warning, info, premium)
- [x] Create `components/ui/Card.tsx` (with border-card radius)
- [x] Create `components/ui/Avatar.tsx` (with initials fallback and verification badge)
- [x] Create `components/ui/Modal.tsx` (with border-modal radius)
- [x] Create `components/common/LoadingSkeleton.tsx` (for property cards)
- [x] Create utility function `src/utils/cn.ts` for conditional classes

#### 1.4 Layout Components
- [x] Create `components/layout/Navbar.tsx` (logo, navigation, auth state awareness, mobile hamburger)
- [x] Create `components/layout/Footer.tsx` (links, copyright)
- [x] Create `components/layout/DashboardLayout.tsx` (sidebar navigation, responsive)
- [x] Create `components/layout/Sidebar.tsx` (collapsible on mobile)

#### 1.5 Static Pages & Routing
- [x] Setup React Router in `src/App.tsx` with all routes
- [x] Create `pages/Home.tsx` (hero section with decorative circles, search bar, statistics, "Comment ça marche" 4 steps, features 6 cards, testimonials, CTA)
- [x] Create `pages/Search.tsx` (filters UI, property grid placeholder with hardcoded data)
- [x] Create `pages/PropertyDetail.tsx` (gallery carousel, info, description, agent card, Google Maps placeholder)
- [x] Create `pages/NotFound.tsx` (404 page)
- [x] Create global styles in `src/styles/globals.css`

**Verification**:
- [x] Run `npm run dev` - all pages render without errors
- [x] Run `npm run type-check` - zero TypeScript errors
- [x] Run `npm run lint` - clean or minimal warnings
- [x] Run `npm run build` - production build successful
- [x] Verify Tailwind classes apply correctly

---

### [ ] Step: Phase 2 - Authentication & Dynamic Data

**Goal**: Implement user accounts, property data, and dashboards

#### 2.1 Authentication System
- [ ] Create `contexts/AuthContext.tsx` (AuthProvider with user state)
- [ ] Create `hooks/useAuth.ts` (hook to consume auth context)
- [ ] Create `services/auth.service.ts` (signUp, signIn, signOut, getUser)
- [ ] Create `pages/SignIn.tsx` (email + password, illustration on side)
- [ ] Create `pages/SignUp.tsx` (name, email, phone, password, role selection, illustration)
- [ ] Create `components/common/ProtectedRoute.tsx` (redirect to login if not authenticated)
- [ ] Create `components/common/RoleRoute.tsx` (check user role)
- [ ] Add logout functionality to Navbar

#### 2.2 Supabase Services Layer
- [ ] Create TypeScript types in `src/types/database.types.ts` (auto-generate from Supabase)
- [ ] Create `types/property.types.ts` (Property, PropertyFilters)
- [ ] Create `types/user.types.ts` (Profile, UserRole)
- [ ] Create `services/properties.service.ts` (getProperties, getPropertyById, createProperty, updateProperty, deleteProperty)
- [ ] Create `services/profiles.service.ts` (getProfile, updateProfile, uploadAvatar)
- [ ] Create `services/storage.service.ts` (uploadPropertyImage, uploadVerificationDoc)
- [ ] Create `utils/constants.ts` (app constants, quartiers list)
- [ ] Create `utils/formatters.ts` (formatPrice for GNF, formatDate)

#### 2.3 Property Features
- [ ] Create `hooks/useProperties.ts` (fetch properties with filters)
- [ ] Create `components/property/PropertyCard.tsx` (image, badge, price, location, characteristics, agent info)
- [ ] Create `components/property/PropertyGrid.tsx` (responsive grid)
- [ ] Create `components/property/PropertyFilters.tsx` (type, quartier, price range, pieces)
- [ ] Create `components/property/PropertyGallery.tsx` (image carousel for detail page)
- [ ] Create `components/agent/AgentCard.tsx` (photo, name, verification badge, rating, contact button)
- [ ] Create `components/agent/VerificationBadge.tsx` (shield-check icon with tooltip)
- [ ] Update `pages/Search.tsx` to use real data and filters
- [ ] Update `pages/PropertyDetail.tsx` to fetch and display property by ID

#### 2.4 Dashboards
- [ ] Create `pages/Dashboard.tsx` (tenant dashboard: favorites count, messages, recent views)
- [ ] Create `pages/DashboardAgent.tsx` (agent dashboard: active listings count, views, messages, listings table)
- [ ] Create `components/property/PropertyStats.tsx` (stats cards for dashboard)

#### 2.5 New Listing Form
- [ ] Create `pages/NewListing.tsx` (multi-step wizard: 5 steps)
- [ ] Create `utils/validators.ts` (Zod schemas for listing form, signup, signin)
- [ ] Step 1: Basic info (title, description, type, quartier)
- [ ] Step 2: Photos upload (multiple files, preview)
- [ ] Step 3: Location (ville, quartier selection)
- [ ] Step 4: Pricing (price, pieces, surface, parking, meuble checkboxes)
- [ ] Step 5: Recap (summary, submit)
- [ ] Implement form validation with React Hook Form + Zod
- [ ] Handle image upload to Supabase Storage
- [ ] Create property in database on submit
- [ ] Redirect to dashboard on success with toast notification

**Verification**:
- [ ] Sign up creates user and profile
- [ ] Sign in authenticates successfully
- [ ] Auth state persists across page refresh
- [ ] Properties load from database in search page
- [ ] Filters work correctly (type, quartier, price, pieces)
- [ ] Property detail page shows complete info
- [ ] Agent info displays with verification badge
- [ ] New listing wizard completes all 5 steps
- [ ] Images upload to Supabase Storage
- [ ] Property saves to database
- [ ] Run `npm run type-check` - zero errors
- [ ] Run `npm run lint` - clean

---

### [ ] Step: Phase 3 - Interactive Features

**Goal**: Implement favorites, real-time messaging, and user profiles

#### 3.1 Favorites System
- [ ] Create `services/favorites.service.ts` (addFavorite, removeFavorite, getFavorites)
- [ ] Create `hooks/useFavorites.ts` (manage favorites state, optimistic updates)
- [ ] Add heart icon to PropertyCard (empty/filled states, animation)
- [ ] Create `pages/Favorites.tsx` (grid of favorited properties)
- [ ] Create `components/common/EmptyState.tsx` (illustration + message + CTA)
- [ ] Add empty state to Favorites page
- [ ] Update favorites count in tenant dashboard
- [ ] Show login prompt if user tries to favorite while not authenticated

#### 3.2 Messaging System
- [ ] Create `types/message.types.ts` (Conversation, Message)
- [ ] Create `services/messages.service.ts` (getConversations, getMessages, sendMessage, createConversation)
- [ ] Create `hooks/useMessages.ts` (with Supabase Realtime subscription)
- [ ] Create `components/messaging/ConversationList.tsx` (list of conversations with avatars, last message, timestamp)
- [ ] Create `components/messaging/ChatView.tsx` (header + messages area + input)
- [ ] Create `components/messaging/MessageBubble.tsx` (sent = green right, received = gray left)
- [ ] Create `components/messaging/ChatInput.tsx` (text field + send button + attachment button)
- [ ] Create `pages/Messages.tsx` (split layout: conversations list + chat view)
- [ ] Add "Contacter" button to PropertyCard that creates/opens conversation
- [ ] Add unread messages badge to Navbar
- [ ] Implement mobile-friendly messaging (separate views on mobile)

#### 3.3 User Profiles
- [ ] Create `pages/Profile.tsx` (view/edit own profile: photo, name, email, phone, bio, password change)
- [ ] Implement avatar upload functionality
- [ ] Add profile update form with validation
- [ ] Add password change section
- [ ] Show success/error toasts

#### 3.4 Public Agent Profile
- [ ] Create `pages/ProfileAgent.tsx` (public view of agent)
- [ ] Display agent header (photo, name, verification badge)
- [ ] Show agent stats (X annonces, membre depuis, rating)
- [ ] Display bio
- [ ] List agent's active properties
- [ ] Create `components/agent/ReviewCard.tsx` (stars, comment, author, date)
- [ ] Add reviews section (display only, no creation yet)
- [ ] Add "Contacter" button

**Verification**:
- [ ] Favorites add/remove works with heart icon animation
- [ ] Favorites page displays saved properties
- [ ] Favorites persist after refresh
- [ ] Messages send successfully
- [ ] Messages appear in real-time for both users
- [ ] Conversations list updates when new message received
- [ ] Unread badge shows in navbar
- [ ] "Contacter" button creates conversation
- [ ] Profile updates save correctly
- [ ] Avatar upload works
- [ ] Public agent profile displays all info
- [ ] Agent's properties list correctly
- [ ] Run `npm run type-check` - zero errors

---

### [ ] Step: Phase 4 - Polish & User Experience

**Goal**: Add loading states, animations, mobile optimization, and notifications

#### 4.1 Loading States
- [ ] Add loading spinner to Button component
- [ ] Create skeleton loaders for PropertyCard
- [ ] Add loading states to Dashboard (spinner while fetching stats)
- [ ] Create full-page loader component
- [ ] Add loading states to all async operations

#### 4.2 Empty States
- [ ] Create illustrations or use simple SVG icons for empty states
- [ ] Add empty state for search with no results
- [ ] Add empty state for no favorites
- [ ] Add empty state for no messages
- [ ] Add empty state for agent with no listings
- [ ] Ensure all empty states have helpful CTAs

#### 4.3 Toast Notifications
- [ ] Setup react-hot-toast in `contexts/NotificationContext.tsx`
- [ ] Configure toast positioning (bottom-right)
- [ ] Add success toasts (account created, property saved, message sent, etc.)
- [ ] Add error toasts (login failed, upload error, etc.)
- [ ] Add info toasts where appropriate
- [ ] Style toasts to match design system (green for success, red for error)

#### 4.4 Animations & Transitions
- [ ] Add fade-in animations on scroll for landing page sections
- [ ] Add hover lift effect to PropertyCard (translateY -8px, shadow-xl)
- [ ] Add smooth transitions to all buttons (duration-300)
- [ ] Add decorative floating circles to hero section (blur, green/cyan)
- [ ] Add subtle float animation to hero elements
- [ ] Add image zoom on hover for PropertyCard images
- [ ] Add page transitions
- [ ] Ensure all animations are performant (use transform/opacity)

#### 4.5 Mobile Responsiveness
- [ ] Implement hamburger menu for mobile navigation
- [ ] Create mobile sidebar that slides from right
- [ ] Test all pages on mobile viewport (375px)
- [ ] Fix PropertyGrid to 1 column on mobile, 2 on tablet, 3 on desktop
- [ ] Fix Features section to 1 column mobile, 2 tablet, 3 desktop
- [ ] Stack hero section vertically on mobile
- [ ] Make search bar single column on mobile
- [ ] Implement mobile messaging (full screen, separate conversation list and chat views)
- [ ] Hide dashboard sidebar by default on mobile with toggle button
- [ ] Arrange dashboard stats in 2x2 grid on mobile
- [ ] Ensure touch targets are at least 44x44px
- [ ] Test on real mobile device or browser DevTools

#### 4.6 Form Enhancements
- [ ] Add real-time validation to all forms
- [ ] Display error messages under form fields
- [ ] Disable submit buttons when form is invalid
- [ ] Show validation feedback on blur
- [ ] Add success states to inputs

#### 4.7 KYC Verification Page
- [ ] Create `pages/Verification.tsx` (accessible only to agents)
- [ ] Create verification form (CNI number, CNI front/back upload, selfie upload)
- [ ] Show verification status (pending/verified/rejected)
- [ ] Add verification status to agent dashboard
- [ ] If not verified, show CTA to verification page
- [ ] If pending, show "Vérification en cours" message
- [ ] If verified, show green badge

**Verification**:
- [ ] All loading states display correctly
- [ ] Empty states are helpful and actionable
- [ ] Toasts appear for all user actions
- [ ] Animations are smooth with no jank
- [ ] Mobile navigation works perfectly
- [ ] All pages are fully responsive
- [ ] Forms validate in real-time
- [ ] Error messages are clear
- [ ] Verification page functional
- [ ] Test on mobile viewport or device
- [ ] Run `npm run type-check` - zero errors
- [ ] Run `npm run lint` - clean

---

### [ ] Step: Phase 5 - Launch Preparation

**Goal**: Add demo data, optimize performance, and prepare for deployment

#### 5.1 Demo Data Seeding
- [ ] Create `supabase/seed.sql` file
- [ ] Add 6 realistic properties for Conakry (Kipé, Nongo, Lambanyi, Cosa, Cameroun, Kaloum)
- [ ] Add 3 demo agents (Mamadou Diallo - verified, Aissatou Barry - verified, Ibrahima Sow - pending)
- [ ] Add property prices in GNF (1.5M - 8M for location, 850M for achat)
- [ ] Add sample reviews for agents
- [ ] Create test user accounts (1 tenant, 1 agent)
- [ ] Add sample conversations and messages
- [ ] Run seed script to populate database

#### 5.2 Environment & Configuration
- [ ] Update .env.example with all required variables
- [ ] Document Supabase setup in README
- [ ] Add instructions for local development
- [ ] Add instructions for running migrations

#### 5.3 Error Handling & Resilience
- [ ] Create `components/common/ErrorBoundary.tsx`
- [ ] Wrap app in ErrorBoundary
- [ ] Add network error handling to all service calls
- [ ] Add graceful degradation for failed image loads
- [ ] Test error scenarios (network offline, invalid data)

#### 5.4 Performance Optimization
- [ ] Implement lazy loading for routes (React.lazy)
- [ ] Add image lazy loading (native loading="lazy")
- [ ] Optimize Tailwind bundle (purge unused classes)
- [ ] Check bundle size with Vite build analyzer
- [ ] Ensure bundle is < 500KB gzipped
- [ ] Test with Chrome DevTools Lighthouse (target > 90 score)

#### 5.5 SEO & Meta Tags
- [ ] Add meta tags to index.html (title, description, keywords)
- [ ] Add Open Graph tags
- [ ] Create and add favicon
- [ ] Add logo SVG to public folder
- [ ] Optionally add dynamic meta tags per page

#### 5.6 Final Testing & Build
- [ ] Complete full user flow test (signup → browse → favorite → message → create listing)
- [ ] Test all protected routes
- [ ] Test role-based routing (tenant vs agent)
- [ ] Test RLS policies (try to access unauthorized data)
- [ ] Run `npm run build` - ensure no errors
- [ ] Test production build locally
- [ ] Check console for errors/warnings

#### 5.7 Deployment (Optional)
- [ ] Deploy to Vercel or Netlify
- [ ] Configure environment variables in hosting platform
- [ ] Test deployed app thoroughly
- [ ] Check all features work in production
- [ ] Optional: Configure custom domain
- [ ] Optional: Setup analytics

**Verification**:
- [ ] Demo data loads correctly
- [ ] All environment variables documented
- [ ] Error boundaries catch errors gracefully
- [ ] Build succeeds with no errors
- [ ] Bundle size is optimized
- [ ] Lighthouse score > 90
- [ ] All features work in production
- [ ] SEO meta tags present
- [ ] No console errors in production

---

### [ ] Step: Final Review & Documentation

**Goal**: Ensure code quality and document the project

#### Final Checks
- [ ] Run `npm run type-check` - zero TypeScript errors
- [ ] Run `npm run lint` - zero errors, minimal warnings
- [ ] Test all features one final time
- [ ] Verify responsive design on multiple devices
- [ ] Check all links work
- [ ] Verify all images load
- [ ] Test auth flows thoroughly
- [ ] Verify RLS policies work correctly

#### Documentation
- [ ] Update README.md with project overview
- [ ] Document setup instructions
- [ ] Document environment variables
- [ ] Document Supabase configuration
- [ ] Add screenshots (optional)
- [ ] Document known issues/limitations
- [ ] Add contribution guidelines (if open source)

**Final Deliverable**:
- [ ] Functional HomeFlow platform with all MVP features
- [ ] Clean, typed TypeScript codebase
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Real-time messaging
- [ ] Secure authentication with RLS
- [ ] Demo data populated
- [ ] Ready for deployment or further development

