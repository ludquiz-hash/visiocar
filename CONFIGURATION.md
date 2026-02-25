# VisioCar - Configuration Supabase Auth

## 🔧 Configuration Requise pour Magic Link

### 1. Supabase Dashboard - URL Configuration

Va sur : https://supabase.com/dashboard/project/_/auth/url-configuration

#### Pour le Développement Local (DEV)

| Paramètre | Valeur |
|-----------|--------|
| **Site URL** | `http://localhost:5173` |
| **Redirect URLs** | `http://localhost:5173/**` |
| | `http://127.0.0.1:5173/**` |
| | `http://localhost:3000/**` (backup) |

#### Pour la Production (PROD)

| Paramètre | Valeur |
|-----------|--------|
| **Site URL** | `https://voluble-biscotti-0d950f.netlify.app` |
| **Redirect URLs** | `https://voluble-biscotti-0d950f.netlify.app/**` |

### 2. Email Templates (Optionnel)

Dans Supabase : Authentication → Email Templates → Magic Link

Template recommandé :
```html
<h2>Connexion VisioCar</h2>
<p>Cliquez sur ce lien pour vous connecter :</p>
<p><a href="{{ .ConfirmationURL }}">Se connecter</a></p>
<p>Ce lien expire dans 1 heure.</p>
```

### 3. Variables d'Environnement Frontend

Crée un fichier `.env` dans `frontend/` :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://dpgzrymeqwwjpoxoiwaf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ATYFiiMT19IEPLdlxRMeug_3kqTsyQD

# API Backend (optionnel pour Magic Link pur)
VITE_API_URL=http://localhost:3001/api
```

### 4. Port de Développement

**IMPORTANT** : L'application utilise le port par défaut de Vite : **5173**

Si tu veux utiliser un autre port, modifie `vite.config.js` :

```javascript
export default defineConfig({
  server: {
    port: 3000, // Change ici si besoin
  },
})
```

**Mais surtout**, mets à jour la configuration Supabase avec le bon port !

### 5. Comment ça marche

1. **User entre son email** sur `/login`
2. **App appelle** `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })`
3. **Supabase envoie un email** avec un lien contenant un token
4. **Le lien pointe vers** : `http://localhost:5173/auth/callback#access_token=xyz...`
5. **La page `/auth/callback`** lit le token dans le hash URL et crée la session
6. **Redirection automatique** vers `/dashboard`

### 6. Debug

Ouvre la console du navigateur (F12) et regarde les logs :
- `[Auth]` - Logs de l'authentification
- `[AuthCallback]` - Logs du traitement du callback

Si le lien ne fonctionne pas :
1. Vérifie que l'URL dans l'email correspond bien à ton app running
2. Vérifie les logs dans la console
3. Vérifie que Supabase Auth → URL Configuration est correct

### 7. Checklist de Vérification

- [ ] Supabase Site URL = `http://localhost:5173` (DEV)
- [ ] Supabase Redirect URLs inclut `http://localhost:5173/**`
- [ ] Frontend tourne sur `http://localhost:5173`
- [ ] Variables d'env `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont set
- [ ] La route `/auth/callback` existe dans l'app React

## 🚨 Problèmes Courants

### "ERR_CONNECTION_REFUSED" quand je clique le lien

**Cause** : Le lien redirige vers `localhost:3000` mais l'app tourne sur `localhost:5173`

**Solution** : 
1. Change Supabase Site URL en `http://localhost:5173`
2. Ou change le port Vite en 3000 dans `vite.config.js`

### "Session non trouvée" sur le callback

**Cause** : Le token n'est pas correctement lu de l'URL

**Solution** : Vérifie que `AuthCallback.jsx` gère bien le hash `#access_token=...`

### Boucle de redirection login → callback → login

**Cause** : La session n'est pas persistée

**Solution** : Vérifie que `supabase.auth.getSession()` retourne bien la session après le callback