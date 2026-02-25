# VISIOCAR — RAPPORT DE DIFFÉRENCES (Old vs New)

## 🎯 OBJECTIF
Réplication stricte 1:1 de l'interface utilisateur et du flux fonctionnel.

---

## 📊 DIFFÉRENCES IDENTIFIÉES

### 1. STRUCTURE DE NAVIGATION

| Aspect | ANCIEN (Base44) | NOUVEAU (Supabase) | DIFF |
|--------|-----------------|-------------------|------|
| **Sidebar items** | 7 items ordonnés | Structure différente | ❌ |
| **Sidebar order** | Dashboard→Dossiers→Nouveau→Équipe→Abonnement→Garage→Paramètres | À vérifier | ❌ |
| **Logo** | VisiWebCar + "Expert Vision" | VisioCar | ❌ |
| **Mobile nav** | Bottom bar 5 items | À vérifier | ❌ |

**Items Sidebar Ancien:**
1. Tableau de bord (LayoutDashboard)
2. Dossiers (FileText)
3. Nouveau dossier (Plus) - HIGHLIGHT
4. Équipe (Users)
5. Abonnement (CreditCard)
6. Mon garage (Building2)
7. Paramètres (Settings)

---

### 2. DASHBOARD

| Aspect | ANCIEN | NOUVEAU | DIFF |
|--------|--------|---------|------|
| **Header** | "Bonjour [prénom]" + bouton Nouveau | À vérifier | ❌ |
| **Stats cards** | 4 cartes: Dossiers en cours / Ce mois / Temps gagné / Terminés | À vérifier | ❌ |
| **Couleurs stats** | blue / purple / green / orange | À vérifier | ❌ |
| **Carte dossiers récents** | Liste avec: icône véhicule + marque/modèle + référence + client + date + statut | À vérifier | ❌ |
| **Quick actions** | 2 cartes: Analyse rapide / Statistiques | À vérifier | ❌ |
| **Trial banner** | Conditionnel si non abonné | À vérifier | ❌ |

---

### 3. NOUVEAU DOSSIER (ClaimWizard)

| Aspect | ANCIEN | NOUVEAU | DIFF |
|--------|--------|---------|------|
| **Nombre d'étapes** | 5 étapes | À vérifier | ❌ |
| **Noms étapes** | 1. Identification / 2. Photos / 3. Analyse assistée / 4. Rédaction / 5. Finalisation | À vérifier | ❌ |
| **Step 1 fields** | Client + Véhicule + Assurance | À vérifier | ❌ |
| **Step 2** | Upload photos avec preview | À vérifier | ❌ |
| **Step 3** | Saisie guidée des dégâts | À vérifier | ❌ |
| **Step 4** | Ajustements rédaction | À vérifier | ❌ |
| **Step 5** | Génération PDF | À vérifier | ❌ |

**ÉTAPES EXACTES (à répliquer):**
```javascript
const WIZARD_STEPS = [
  { id: 'identification', title: 'Identification', description: 'Client & véhicule' },
  { id: 'photos', title: 'Photos', description: 'Images du sinistre' },
  { id: 'analysis', title: 'Analyse assistée', description: 'Saisie guidée des dégâts' },
  { id: 'redaction', title: 'Rédaction', description: 'Ajustements' },
  { id: 'pdf', title: 'Finalisation', description: 'Rapport PDF' },
];
```

---

### 4. LAYOUT ET UI

| Aspect | ANCIEN | NOUVEAU | DIFF |
|--------|--------|---------|------|
| **Couleur principale** | #007AFF (bleu Apple) | À vérifier | ❌ |
| **Background** | #0B0E14 (très sombre) | À vérifier | ❌ |
| **Surface** | #151921 | À vérifier | ❌ |
| **GlassCard** | Effet verre dépoli | À vérifier | ❌ |
| **GlassButton** | Bouton avec icône | À vérifier | ❌ |
| **StatCard** | Carte avec valeur + icône + couleur | À vérifier | ❌ |
| **StatusBadge** | Badge de statut coloré | À vérifier | ❌ |

---

### 5. DONNÉES ET MODÈLES

| Aspect | ANCIEN | NOUVEAU | DIFF |
|--------|--------|---------|------|
| **Backend** | Base44 | Supabase | ⚠️ |
| **Auth** | Base44 Auth | Supabase Auth | ⚠️ |
| **Entities** | Claim, Garage, GarageMember, UsageCounter | À vérifier | ❌ |
| **Query system** | TanStack Query + Base44 | TanStack Query + Supabase | ⚠️ |

---

## ✅ PLAN DE RÉPLICATION

### PHASE 1: Layout et Navigation
- [ ] Répliquer Sidebar exacte (7 items, même ordre, même icônes)
- [ ] Répliquer mobile bottom navigation
- [ ] Répliquer Layout avec theme toggle
- [ ] Répliquer TrialBanner conditionnel

### PHASE 2: Dashboard
- [ ] Répliquer header avec greeting + bouton
- [ ] Répliquer 4 StatCards (même ordre, mêmes couleurs)
- [ ] Répliquer carte "Dossiers récents" (même structure)
- [ ] Répliquer Quick Actions (2 cartes)

### PHASE 3: Nouveau Dossier
- [ ] Créer ClaimWizard avec 5 étapes exactes
- [ ] Répliquer StepIndicator
- [ ] Répliquer StepIdentification (Client/Véhicule/Assurance)
- [ ] Répliquer StepPhotos (upload)
- [ ] Répliquer StepAnalysis (dégâts)
- [ ] Répliquer StepRedaction
- [ ] Répliquer StepPDF

### PHASE 4: Composants UI
- [ ] Répliquer GlassCard
- [ ] Répliquer GlassButton
- [ ] Répliquer StatCard
- [ ] Répliquer StatusBadge
- [ ] Répliquer EmptyState

### PHASE 5: Données
- [ ] Adapter queries Supabase pour matcher structure Base44
- [ ] Gérer RLS correctement
- [ ] Connecter toutes les fonctionnalités CRUD

---

## 🎨 SPÉCIFICATIONS VISUELLES EXACTES

### Couleurs
```css
--color-background: #0B0E14;
--color-surface: #151921;
--color-primary: #007AFF;
--color-success: #34C759;
--color-warning: #FF9F0A;
--color-danger: #FF3B30;
--color-text-primary: #ffffff;
--color-text-secondary: rgba(255, 255, 255, 0.6);
```

### Sidebar Structure
```javascript
const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: 'Dashboard' },
  { id: 'claims', label: 'Dossiers', icon: FileText, path: 'Claims' },
  { id: 'new-claim', label: 'Nouveau dossier', icon: Plus, path: 'ClaimWizard', highlight: true },
  { id: 'team', label: 'Équipe', icon: Users, path: 'Team' },
  { id: 'billing', label: 'Abonnement', icon: CreditCard, path: 'Billing' },
  { id: 'garage', label: 'Mon garage', icon: Building2, path: 'GarageSettings' },
  { id: 'settings', label: 'Paramètres', icon: Settings, path: 'Settings' },
];
```

### Wizard Steps
```javascript
const WIZARD_STEPS = [
  { id: 'identification', title: 'Identification', description: 'Client & véhicule' },
  { id: 'photos', title: 'Photos', description: 'Images du sinistre' },
  { id: 'analysis', title: 'Analyse assistée', description: 'Saisie guidée des dégâts' },
  { id: 'redaction', title: 'Rédaction', description: 'Ajustements' },
  { id: 'pdf', title: 'Finalisation', description: 'Rapport PDF' },
];
```