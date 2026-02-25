# VisioCar - Standalone Version

Application d'expertise automobile intelligente, version standalone indépendante de Base44.

## 🏗️ Architecture

- **Backend**: Node.js + Express + Supabase (PostgreSQL)
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: Supabase Auth (OTP Email)
- **Storage**: Supabase Storage
- **Paiements**: Stripe
- **PDF**: Puppeteer + Handlebars

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 14+ (ou compte Supabase)
- Compte Stripe (pour les paiements)
- Compte Supabase (pour l'authentification et la base de données)

## 🚀 Installation Rapide

### 1. Cloner et configurer

```bash
git clone <repository>
cd visiocar-standalone
```

### 2. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Dans le SQL Editor, exécutez le contenu de `database/schema.sql`
3. Notez les credentials (URL et anon key)

### 3. Configuration Backend

```bash
cd backend
cp .env.example .env
```

Éditez `.env` avec vos variables:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

JWT_SECRET=your-secret-key-min-32-chars

# Optionnel: Stripe pour les paiements
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_BUSINESS_PRICE_ID=price_...
```

```bash
npm install
npm run dev
```

### 4. Configuration Frontend

```bash
cd ../frontend
cp .env.example .env
```

Éditez `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

```bash
npm install
npm run dev
```

## 🐳 Docker Compose (Recommandé)

```bash
# Créer le fichier .env à la racine avec:
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_SUPABASE_ANON_KEY=

# Lancer tous les services
docker-compose up -d

# Arrêter
docker-compose down
```

## 📊 Schéma de Base de Données

### Tables Principales

- **profiles**: Données utilisateurs étendues
- **garages**: Informations des garages
- **garage_members**: Membres et permissions
- **claims**: Dossiers sinistres
- **claim_history**: Historique des actions
- **usage_counters**: Compteurs pour billing

### Storage Buckets

- **claim-photos**: Photos des sinistres
- **garage-logos**: Logos des garages

## 🔐 Authentification

L'authentification utilise Supabase Auth avec OTP (One-Time Password) par email:

1. L'utilisateur entre son email
2. Un code à 6 chiffres est envoyé par email
3. L'utilisateur saisit le code pour se connecter
4. Pas de mot de passe à mémoriser

## 💳 Configuration Stripe

1. Créez un compte sur [Stripe](https://stripe.com)
2. Créez deux produits dans le Dashboard:
   - **Starter** (15 dossiers/mois)
   - **Business** (illimité)
3. Récupérez les Price IDs
4. Configurez le webhook endpoint: `POST /api/stripe/webhook`

### Webhook Events à écouter

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## 📝 Variables d'Environnement

### Backend

| Variable | Description | Requis |
|----------|-------------|--------|
| `NODE_ENV` | environment (development/production) | ✅ |
| `PORT` | Port du serveur | ✅ |
| `SUPABASE_URL` | URL Supabase | ✅ |
| `SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role Supabase | ✅ |
| `JWT_SECRET` | Secret pour JWT | ✅ |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | ❌ |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | ❌ |

### Frontend

| Variable | Description | Requis |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | URL Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ |
| `VITE_API_URL` | URL de l'API backend | ✅ |

## 🚀 Déploiement Production

### Backend

```bash
cd backend
npm ci --production
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Déployer le contenu de `dist/` sur votre hébergeur
```

### Plateformes Recommandées

- **Backend**: Railway, Render, Fly.io, DigitalOcean
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Base de données**: Supabase (inclus), ou Neon

## 🔧 Fonctionnalités

### Implémentées

- ✅ Authentification OTP par email
- ✅ CRUD dossiers sinistres
- ✅ Upload photos (Supabase Storage)
- ✅ Génération PDF des rapports
- ✅ Gestion des garages
- ✅ Gestion d'équipe (membres, rôles)
- ✅ Système de plans (Starter/Business)
- ✅ Intégration Stripe
- ✅ Webhooks Stripe
- ✅ Tableau de bord avec stats
- ✅ Historique des actions

### Permissions

| Rôle | Permissions |
|------|-------------|
| **Owner** | Tout (facturation, suppression garage, gestion membres) |
| **Admin** | Gestion dossiers, inviter membres, paramètres |
| **Staff** | Créer/voir/modifier ses dossiers |

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run lint
```

## 🐛 Dépannage

### Erreur CORS
Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL du frontend.

### Erreur Auth
Vérifiez que les clés Supabase sont correctes et que les tables sont créées.

### PDF ne génère pas
Vérifiez que Puppeteer est installé correctement:
```bash
npm install -g puppeteer
```

## 📄 Licence

Propriétaire - Tous droits réservés

## 🤝 Support

Pour toute question ou problème:
- Email: support@visiocar.com
- Documentation: [docs.visiocar.com](https://docs.visiocar.com)