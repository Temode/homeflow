# Guide de déploiement HomeFlow

Ce guide vous aide à déployer HomeFlow en production sur différentes plateformes.

## Prérequis

Avant de déployer, assurez-vous que:

- [x] Votre projet Supabase est configuré (voir [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- [x] Les migrations SQL ont été exécutées
- [x] Les buckets Storage sont créés avec leurs policies
- [x] Le build local fonctionne (`npm run build`)
- [x] Vous avez testé l'application localement

## Option 1: Déploiement sur Vercel (Recommandé)

Vercel est la plateforme la plus simple pour déployer une application Vite/React.

### Étapes

1. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Inscrivez-vous avec GitHub, GitLab ou Email

2. **Importer votre projet**
   - Cliquez sur **Add New Project**
   - Importez votre repository Git (GitHub, GitLab, Bitbucket)
   - Vercel détectera automatiquement Vite

3. **Configurer les variables d'environnement**
   - Dans **Environment Variables**, ajoutez:
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Ajoutez-les pour **Production**, **Preview**, et **Development**

4. **Déployer**
   - Cliquez sur **Deploy**
   - Attendez ~2 minutes
   - Votre app sera disponible sur `https://your-project.vercel.app`

5. **Configurer le domaine personnalisé (optionnel)**
   - Allez dans **Settings** > **Domains**
   - Ajoutez votre domaine (ex: `homeflow.gn`)
   - Suivez les instructions pour configurer les DNS

### Redéploiement automatique

Chaque fois que vous poussez sur votre branche principale, Vercel redéploiera automatiquement.

## Option 2: Déploiement sur Netlify

### Étapes

1. **Créer un compte Netlify**
   - Allez sur [netlify.com](https://netlify.com)
   - Inscrivez-vous

2. **Importer votre projet**
   - Cliquez sur **Add new site** > **Import an existing project**
   - Connectez votre repository Git

3. **Configurer le build**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (laissez vide)

4. **Variables d'environnement**
   - Allez dans **Site settings** > **Environment variables**
   - Ajoutez:
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

5. **Déployer**
   - Cliquez sur **Deploy site**
   - Votre app sera sur `https://random-name.netlify.app`

6. **Domaine personnalisé**
   - **Site settings** > **Domain management**
   - Ajoutez votre domaine

## Option 3: Déploiement manuel (VPS/Serveur)

Si vous avez votre propre serveur (VPS, DigitalOcean, AWS EC2, etc.):

### Sur le serveur

1. **Installer Node.js et nginx**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm nginx
```

2. **Cloner et builder le projet**
```bash
git clone <your-repo-url>
cd homeflow
npm install
npm run build
```

3. **Configurer nginx**
```nginx
# /etc/nginx/sites-available/homeflow
server {
    listen 80;
    server_name homeflow.gn www.homeflow.gn;
    
    root /var/www/homeflow/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. **Activer le site**
```bash
sudo ln -s /etc/nginx/sites-available/homeflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. **SSL avec Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d homeflow.gn -d www.homeflow.gn
```

6. **Variables d'environnement**

Créez un fichier `.env.production` ou utilisez un script de build:
```bash
#!/bin/bash
export VITE_SUPABASE_URL=https://xxxxx.supabase.co
export VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
npm run build
```

## Vérifications post-déploiement

Après le déploiement, vérifiez:

- [ ] L'application se charge sans erreur
- [ ] L'inscription/connexion fonctionne
- [ ] Les propriétés s'affichent
- [ ] Les images se chargent correctement
- [ ] La messagerie fonctionne en temps réel
- [ ] Les favoris fonctionnent
- [ ] Upload de photos fonctionne
- [ ] Les routes protégées redirigent vers login
- [ ] Pas d'erreurs dans la console browser
- [ ] Performance acceptable (< 3s de chargement)

## Configuration du domaine

### Registrar DNS

Si vous avez acheté un domaine (ex: chez Namecheap, GoDaddy, etc.):

**Pour Vercel:**
- Type A: `@` → `76.76.21.21`
- Type CNAME: `www` → `cname.vercel-dns.com`

**Pour Netlify:**
- Type A: `@` → Netlify IP
- Type CNAME: `www` → `<your-site>.netlify.app`

## Monitoring et analytics

### Google Analytics (optionnel)

1. Créez un compte Google Analytics
2. Obtenez votre Measurement ID (G-XXXXXXXXXX)
3. Ajoutez dans `index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Supabase Analytics

Supabase fournit des analytics intégrés:
- **Database** > **Logs**: Logs SQL
- **Auth** > **Users**: Stats utilisateurs
- **Storage** > **Usage**: Stats de stockage

## Performance tips

1. **Activer la compression** (Vercel/Netlify le font automatiquement)
2. **CDN**: Les deux plateformes utilisent des CDN globaux
3. **Cache headers**: Déjà configurés dans Vite
4. **Image optimization**: Utilisez des formats WebP quand possible

## Rollback en cas de problème

### Vercel
- Allez dans **Deployments**
- Trouvez un déploiement précédent qui fonctionne
- Cliquez sur les 3 points > **Promote to Production**

### Netlify
- **Deploys** > Sélectionnez un ancien deploy
- **Publish deploy**

## Support

En cas de problème:
- Consultez les logs de la plateforme
- Vérifiez les variables d'environnement
- Testez en local d'abord
- Contactez le support de votre hébergeur

---

Bon déploiement ! 🚀
