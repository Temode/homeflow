# Configuration Supabase pour HomeFlow

Ce guide détaille toutes les étapes nécessaires pour configurer Supabase pour l'application HomeFlow.

## Table des matières

1. [Création du projet](#1-création-du-projet)
2. [Configuration de l'authentification](#2-configuration-de-lauthentification)
3. [Exécution des migrations](#3-exécution-des-migrations)
4. [Configuration des buckets Storage](#4-configuration-des-buckets-storage)
5. [Activation de Realtime](#5-activation-de-realtime)
6. [Récupération des credentials](#6-récupération-des-credentials)
7. [Seed des données de démo](#7-seed-des-données-de-démo-optionnel)
8. [Vérification](#8-vérification)

---

## 1. Création du projet

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur **New Project**
3. Remplissez les informations:
   - **Name**: `homeflow` (ou le nom de votre choix)
   - **Database Password**: Choisissez un mot de passe fort (sauvegardez-le!)
   - **Region**: Choisissez la région la plus proche de vos utilisateurs (ex: `eu-central-1` pour l'Europe)
4. Cliquez sur **Create new project**
5. Attendez que le projet soit entièrement provisionné (~2 minutes)

---

## 2. Configuration de l'authentification

⚠️ **IMPORTANT** : Par défaut, Supabase nécessite une confirmation par email pour créer un compte. Pour le développement local, vous devez désactiver cette option.

1. Allez dans **Authentication** > **Providers** dans votre dashboard Supabase
2. Cliquez sur **Email** dans la liste des providers
3. Sous "Confirm email", **désactivez** l'option "Enable email confirmations"
4. Cliquez sur **Save**

Alternativement, vous pouvez configurer un service SMTP pour l'envoi d'emails :
1. Allez dans **Project Settings** > **Auth**
2. Configurez votre serveur SMTP dans la section "SMTP Settings"
3. Les utilisateurs recevront un email de confirmation à l'inscription

**Pour la production**, il est fortement recommandé de garder la confirmation par email activée pour des raisons de sécurité.

---

## 3. Exécution des migrations

### 3.1 Accéder au SQL Editor

1. Dans votre projet Supabase, allez dans **SQL Editor** (icône de terminal dans la sidebar)
2. Cliquez sur **New query**

### 3.2 Exécuter la migration initiale

1. Ouvrez le fichier `supabase/migrations/20260124_initial_schema.sql` dans votre éditeur de code
2. Copiez tout le contenu du fichier
3. Collez-le dans le SQL Editor de Supabase
4. Cliquez sur **Run** (ou `Ctrl+Enter`)

Vous devriez voir un message de succès: `Success. No rows returned`

### 3.3 Vérifier les tables créées

1. Allez dans **Table Editor** (icône de tableau dans la sidebar)
2. Vous devriez voir ces tables:
   - `profiles`
   - `properties`
   - `favorites`
   - `conversations`
   - `messages`
   - `verifications`
   - `reviews`

---

## 4. Configuration des buckets Storage

### 4.1 Créer les buckets

1. Allez dans **Storage** (icône de dossier dans la sidebar)
2. Créez les 3 buckets suivants:

#### Bucket `avatars`
- Nom: `avatars`
- Public: ✅ **OUI**
- File size limit: 2 MB
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`

#### Bucket `property-images`
- Nom: `property-images`
- Public: ✅ **OUI**
- File size limit: 5 MB
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`

#### Bucket `verification-documents`
- Nom: `verification-documents`
- Public: ❌ **NON** (privé)
- File size limit: 5 MB
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp, application/pdf`

### 4.2 Ajouter les policies RLS

Pour chaque bucket, vous devez ajouter des policies pour permettre les uploads.

#### Pour `avatars`:

Allez dans **Storage** > `avatars` > **Policies** > **New Policy**

**Policy 1: Upload avatars**
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 2: View avatars**
```sql
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**Policy 3: Update avatars**
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text);
```

**Policy 4: Delete avatars**
```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text);
```

#### Pour `property-images`:

**Policy 1: Upload property images**
```sql
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');
```

**Policy 2: View property images**
```sql
CREATE POLICY "Property images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');
```

**Policy 3: Update property images**
```sql
CREATE POLICY "Users can update their own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images');
```

**Policy 4: Delete property images**
```sql
CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');
```

#### Pour `verification-documents`:

**Policy 1: Upload verification documents**
```sql
CREATE POLICY "Users can upload their verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 2: View own verification documents**
```sql
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 4. Activation de Realtime

Pour que la messagerie en temps réel fonctionne, vous devez activer Realtime sur la table `messages`.

1. Allez dans **Database** > **Replication**
2. Cherchez la table `messages` dans la liste
3. Activez **Realtime** pour cette table (toggle sur ON)

---

## 5. Récupération des credentials

1. Allez dans **Settings** > **API**
2. Vous verrez deux informations importantes:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Une longue clé commençant par `eyJhbGci...`

3. Copiez ces valeurs dans votre fichier `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

⚠️ **Important**: Ne JAMAIS committer le fichier `.env.local` dans git! Il est déjà dans `.gitignore`.

---

## 6. Seed des données de démo (optionnel)

Pour tester l'application avec des données réalistes:

1. Allez dans **SQL Editor** > **New query**
2. Ouvrez le fichier `supabase/seed.sql`
3. Copiez tout le contenu
4. Collez-le dans le SQL Editor
5. Cliquez sur **Run**

Cela va créer:
- 3 démarcheurs (2 vérifiés, 1 en attente)
- 1 locataire de test
- 6 propriétés à Conakry
- 5 avis pour les agents
- Quelques conversations et messages de test

**Comptes de test créés:**

Locataire:
- Email: `locataire@test.com`
- Mot de passe: `Test123456!`

Agent vérifié:
- Email: `mamadou.diallo@homeflow.gn`
- Mot de passe: `Test123456!`

Agent non vérifié:
- Email: `ibrahima.sow@homeflow.gn`
- Mot de passe: `Test123456!`

---

## 7. Vérification

### 7.1 Vérifier les tables

1. Allez dans **Table Editor**
2. Cliquez sur chaque table pour vérifier qu'elle existe
3. Si vous avez exécuté le seed, vérifiez que les données sont présentes

### 7.2 Vérifier RLS

1. Allez dans **Authentication** > **Policies**
2. Vérifiez que toutes les tables ont des policies actives
3. Chaque table devrait avoir au moins 4 policies (SELECT, INSERT, UPDATE, DELETE)

### 7.3 Vérifier Storage

1. Allez dans **Storage**
2. Vérifiez que les 3 buckets existent
3. Vérifiez que les policies sont bien configurées

### 7.4 Vérifier Realtime

1. Allez dans **Database** > **Replication**
2. Vérifiez que `messages` est bien activé (toggle ON)

### 7.5 Tester l'application

1. Lancez l'application: `npm run dev`
2. Essayez de créer un compte
3. Essayez de vous connecter avec un compte de test (si seed exécuté)
4. Vérifiez que les propriétés s'affichent
5. Testez l'upload d'une photo de profil
6. Testez la messagerie

---

## Dépannage

### Erreur: "relation does not exist"

➡️ Les migrations n'ont pas été exécutées correctement. Retournez à l'étape 2.

### Erreur: "new row violates row-level security policy"

➡️ Les policies RLS ne sont pas correctement configurées. Vérifiez que toutes les policies ont été créées.

### Images ne s'uploadent pas

➡️ Vérifiez que les buckets Storage existent et que les policies sont actives.

### Messages temps réel ne fonctionnent pas

➡️ Vérifiez que Realtime est activé sur la table `messages`.

### Impossible de se connecter

➡️ Vérifiez que les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont correctes dans `.env.local`.

---

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

## Support

Si vous rencontrez des problèmes non résolus par ce guide:
1. Consultez la [documentation Supabase](https://supabase.com/docs)
2. Vérifiez les [issues GitHub du projet](https://github.com/votre-repo/issues)
3. Contactez le support: support@homeflow.gn
