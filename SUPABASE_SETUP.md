## ✅ CONFIGURATION SUPABASE CHECKLIST

### 1. Email/Password Provider

Dans Supabase Dashboard → **Authentication** → **Providers** → **Email** :

| Paramètre | Valeur |
|-----------|--------|
| **Enable Email provider** | ✅ ON |
| **Confirm email** | OFF (pour l'instant, ou ON si tu veux validation) |
| **Secure email change** | ON |
| **Secure password reset** | ON |

### 2. Google OAuth Provider

Dans Supabase Dashboard → **Authentication** → **Providers** → **Google** :

| Paramètre | Valeur |
|-----------|--------|
| **Enable Google provider** | ✅ ON |
| **Client ID** | (voir ci-dessous) |
| **Client Secret** | (voir ci-dessous) |
| **Authorized redirect URI** | `https://dpgzrymeqwwjpoxoiwaf.supabase.co/auth/v1/callback` |

**Pour obtenir Client ID/Secret :**
1. Va sur https://console.cloud.google.com
2. Crée un projet ou sélectionne un existant
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
4. Type: **Web application**
5. **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://voluble-biscotti-0d950f.netlify.app`
6. **Authorized redirect URIs**:
   - `https://dpgzrymeqwwjpoxoiwaf.supabase.co/auth/v1/callback`
7. Copie le **Client ID** et **Client Secret** dans Supabase

### 3. Apple OAuth Provider (Optionnel)

Dans Supabase Dashboard → **Authentication** → **Providers** → **Apple** :

| Paramètre | Valeur |
|-----------|--------|
| **Enable Apple provider** | ✅ ON (si tu veux) |
| **Service ID** | (voir ci-dessous) |
| **Key ID** | (voir ci-dessous) |
| **Private Key** | (voir ci-dessous) |
| **Team ID** | (voir ci-dessous) |

**Configuration Apple complexe** - à faire seulement si nécessaire pour iOS/macOS.

### 4. URL Configuration (CRITIQUE)

Dans Supabase Dashboard → **Authentication** → **URL Configuration** :

**DEVELOPMENT:**
- **Site URL**: `http://localhost:5173`
- **Redirect URLs**:
  - `http://localhost:5173/**`
  - `http://127.0.0.1:5173/**`

**PRODUCTION:**
- **Site URL**: `https://voluble-biscotti-0d950f.netlify.app`
- **Redirect URLs**:
  - `https://voluble-biscotti-0d950f.netlify.app/**`

⚠️ **CLIQUE SUR "SAVE" APRÈS CHAQUE MODIFICATION !**

---

## 🔧 CONFIGURATION RAPIDE

Si tu veux juste Email/Password pour l'instant (recommandé) :

1. ✅ Activer Email provider
2. ✅ Configurer URLs (Site URL + Redirect URLs)
3. ✅ Sauvegarder

Google OAuth peut être ajouté après !