VISIOCAR BACKEND - PACKAGE DE DEPLOIEMENT

=== INSTRUCTIONS RAPIDES ===

1. Allez sur https://dashboard.render.com

2. Cliquez sur "New +" → "Web Service"

3. Selectionnez "Deploy from a Git repository" OU uploadez ce dossier

4. Configurez :
   - Name: visiocar-api
   - Build Command: cd backend && npm install
   - Start Command: cd backend && npm start
   - Plan: Free

5. Variables d'environnement (obligatoires) :
   NODE_ENV=production
   FRONTEND_URL=https://voluble-biscotti-0d950f.netlify.app
   SUPABASE_URL=https://dpgzrymeqwwjpoxoiwaf.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_ATYFiiMT19IEPLdlxRMeug_3kqTsyQD
   SUPABASE_SERVICE_ROLE_KEY=sb_publishable_ATYFiiMT19IEPLdlxRMeug_3kqTsyQD
   JWT_SECRET=visiocar-super-secret-key-2024-change-this

6. Cliquez "Create Web Service"

L'API sera disponible en 2-3 minutes !
