# Configuration Supabase pour HomeFlow

Guide complet pour configurer Supabase pour votre projet HomeFlow.

## 1. Créer un projet Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur **New Project**
3. Remplissez les informations:
   - **Name**: homeflow-prod (ou votre choix)
   - **Database Password**: Créez un mot de passe fort (sauvegardez-le !)
   - **Region**: Choisissez la région la plus proche (ex: `eu-west-1` pour l'Europe)
4. Cliquez sur **Create new project**
5. Attendez ~2 minutes que le projet soit créé

## 2. Récupérer les credentials

Une fois le projet créé:

1. Allez dans **Settings** > **API**
2. Copiez les valeurs suivantes:
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon/public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Mettez-les dans votre fichier `.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Créer le schéma de base de données

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Cliquez sur **New query**
3. Copiez le contenu du fichier `supabase/migrations/20260124_initial_schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** (ou Ctrl+Enter)
6. Vérifiez qu'il n'y a pas d'erreurs (✓ Success)

## 4. (Optionnel) Ajouter des données de démo

Pour tester l'application avec des données:

1. Dans **SQL Editor**, créez une nouvelle query
2. Copiez le contenu du fichier `supabase/seed.sql`
3. Collez-le et cliquez sur **Run**
4. Vérifiez les données dans **Table Editor**:
   - profiles: 4 utilisateurs
   - properties: 6 propriétés
   - reviews: 5 avis
   - etc.

## 5. Configurer le Storage

Pour permettre l'upload d'images et de documents:

### Créer les buckets

1. Allez dans **Storage**
2. Cliquez sur **Create bucket**
3. Créez ces 3 buckets:

**Bucket 1: avatars**
- Name: `avatars`
- Public: ✓ (coché)
- File size limit: 2 MB
- Allowed MIME types: `image/jpeg,image/png,image/webp`

**Bucket 2: property-images**
- Name: `property-images`
- Public: ✓ (coché)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg,image/png,image/webp`

**Bucket 3: verification-documents**
- Name: `verification-documents`
- Public: ✗ (non coché - privé)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg,image/png,application/pdf`

### Configurer les policies RLS pour Storage

Pour chaque bucket, ajoutez ces policies:

#### Avatars

```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Property Images

```sql
-- Allow authenticated users to upload property images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow public read access
CREATE POLICY "Property images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow users to delete their property images
CREATE POLICY "Users can delete own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Verification Documents

```sql
-- Allow users to upload their own verification documents
CREATE POLICY "Users can upload own verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own verification documents
CREATE POLICY "Users can view own verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 6. Configurer l'authentification

1. Allez dans **Authentication** > **Providers**
2. **Email provider** devrait déjà être activé
3. (Optionnel) Configurez d'autres providers (Google, Facebook, etc.)

### Configurer les paramètres Email

1. Allez dans **Authentication** > **Email Templates**
2. Personnalisez les templates si besoin:
   - Confirmation signup
   - Reset password
   - etc.

### Désactiver la confirmation email (pour dev/test uniquement)

Si vous voulez tester sans avoir à confirmer les emails:

1. Allez dans **Authentication** > **Settings**
2. Sous **Email Auth**, décochez **Enable email confirmations**
3. ⚠️ **IMPORTANT**: Réactivez ceci en production !

## 7. Activer Realtime (pour la messagerie)

1. Allez dans **Database** > **Replication**
2. Activez la réplication pour ces tables:
   - `messages`
   - `conversations`
3. Cliquez sur **Save**

## 8. Vérifier que tout fonctionne

Checklist finale:

- [ ] Les 7 tables sont créées (profiles, properties, favorites, conversations, messages, verifications, reviews)
- [ ] Les RLS policies sont activées sur toutes les tables
- [ ] Les 3 buckets storage sont créés
- [ ] Les policies storage sont configurées
- [ ] Les credentials sont dans `.env.local`
- [ ] Realtime est activé pour messages et conversations
- [ ] (Optionnel) Les données de démo sont chargées

## 9. Tester l'application

1. Lancez l'application: `npm run dev`
2. Créez un compte utilisateur
3. Vérifiez que:
   - L'inscription fonctionne
   - Vous pouvez vous connecter
   - Les propriétés s'affichent
   - Vous pouvez ajouter des favoris
   - La messagerie fonctionne

## Problèmes courants

### Erreur "Invalid API key"
- Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont corrects
- Relancez le serveur de dev après avoir modifié `.env.local`

### Erreur "Row Level Security"
- Vérifiez que les policies RLS sont bien créées
- Essayez de vous reconnecter

### Images ne s'uploadent pas
- Vérifiez que les buckets storage existent
- Vérifiez que les policies storage sont configurées
- Vérifiez la taille des fichiers (limites)

### Messages en temps réel ne marchent pas
- Vérifiez que Realtime est activé pour `messages` et `conversations`
- Vérifiez la console browser pour des erreurs WebSocket

## Support

En cas de problème:
- Documentation Supabase: https://supabase.com/docs
- Support Supabase: https://supabase.com/support
- GitHub Issues: [votre-repo]/issues

---

Bonne configuration ! 🚀
