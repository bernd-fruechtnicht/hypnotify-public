# Deployment Strategy

## 📋 Übersicht

Diese Dokumentation beschreibt die Deployment-Strategie für Hypnotify, die auf **Trunk-Based Development** mit **expliziter Deployment-Steuerung** basiert.

---

## 🌳 Branch-Strategie

### Trunk-Based Development

- **`main`** - Single Source of Truth, konsolidierter Stand aller Änderungen
- **Feature Branches** - Kurzlebig, werden zu `main` gemerged
- **Keine Environment-Branches** - Alle Deployments erfolgen von `main`

### Vorteile

- ✅ Keine Branch-Divergenz
- ✅ Einfach zu verstehen
- ✅ Weniger Merge-Konflikte
- ✅ Best Practice (Google, Microsoft, Meta)
- ✅ Schnellere Integration

---

## 🚀 Deployment-Steuerung

### Commit-Message-basierte Steuerung

Deployments werden **explizit** via Commit-Messages auf `main` getriggert:

```bash
# Web Deployment (Vercel)
git commit --allow-empty -m "chore: [deploy web]"
git push origin main

# iOS Build (EAS)
git commit --allow-empty -m "chore: [deploy ios]"
git push origin main

# Android Build (EAS)
git commit --allow-empty -m "chore: [deploy android]"
git push origin main

# Alle Environments
git commit --allow-empty -m "chore: [deploy]"
git push origin main
```

### Workflow

1. **Feature entwickeln** → Feature Branch
2. **PR erstellen** → Review
3. **Merge zu `main`** → CI läuft, aber **kein Deployment**
4. **Deployment triggern** → Commit mit `[deploy ...]` Message
5. **Deployment läuft** → Automatisch via GitHub Actions

---

## 🔧 GitHub Actions Workflows

### Reusable Workflows

Um Duplikation zu vermeiden, werden wiederverwendbare Workflows verwendet:

#### 1. Quality Checks (Reusable)

`.github/workflows/reusable-quality-checks.yml`

- Type checking
- Linting
- Format checking
- Build check (optional)

#### 2. EAS Build (Reusable)

`.github/workflows/reusable-eas-build.yml`

- Setup EAS
- Build iOS oder Android
- Wiederverwendbar für beide Platforms

### Deployment Workflows

#### Web Deployment

`.github/workflows/deploy-web.yml`

- Trigger: `[deploy web]` auf `main`
- Action: Vercel Deploy Hook
- Vercel Git Integration: **Deaktiviert**

#### iOS Deployment

`.github/workflows/deploy-ios.yml`

- Trigger: `[deploy ios]` auf `main`
- Action: EAS Build iOS
- Lokale Builds: Weiterhin möglich

#### Android Deployment

`.github/workflows/deploy-android.yml`

- Trigger: `[deploy android]` auf `main`
- Action: EAS Build Android
- Lokale Builds: Weiterhin möglich

---

## 📝 Deployment-Beispiele

### Beispiel 1: Web Feature deployen

```bash
# 1. Feature entwickeln
git checkout main
git checkout -b feature/new-web-feature
# ... Änderungen ...
git commit -m "feat: add new web feature"
git push origin feature/new-web-feature

# 2. PR erstellen und mergen
# → CI läuft, aber kein Deployment

# 3. Deployment triggern
git checkout main
git pull origin main
git commit --allow-empty -m "chore: [deploy web]"
git push origin main
# → Vercel deployed automatisch
```

### Beispiel 2: iOS Update deployen

```bash
# 1. Feature ist bereits in main
git checkout main
git pull origin main

# 2. iOS Build triggern
git commit --allow-empty -m "chore: [deploy ios]"
git push origin main
# → EAS Build iOS gestartet

# 3. Nach Build: Submit zu App Store Connect
npx eas-cli submit --platform ios --profile production
```

### Beispiel 3: Cross-Platform Feature

```bash
# 1. Feature entwickeln und zu main mergen
# ... (wie oben) ...

# 2. Alle Environments deployen
git commit --allow-empty -m "chore: [deploy]"
git push origin main
# → Web, iOS, Android deployed
```

### Beispiel 4: Manuelles Deployment (Testing)

```bash
# GitHub Actions → "Deploy Web" → "Run workflow"
# → Branch wählen (z.B. Feature-Branch)
# → Force deploy aktivieren
# → Deployment läuft
```

---

## ⚙️ Konfiguration

### Vercel

`vercel.json`:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": false, // Deaktiviert - Deployment nur via Hook
      "preview": false
    }
  }
}
```

**Vercel Deploy Hook**:

- Vercel Dashboard → Project Settings → Deploy Hooks
- Hook URL als GitHub Secret: `VERCEL_DEPLOY_HOOK`

### EAS Build

**Secrets in GitHub**:

- `EXPO_TOKEN` - EAS Authentication Token

**Lokale Builds**:

- Immer möglich via `npx eas-cli build`

---

## 🔄 Workflow-Patterns

### Pattern 1: Standard Feature Flow

```
feature/new-feature
    ↓ (PR + Review)
main
    ↓ (Merge - kein Deployment)
[Warten bis bereit]
    ↓ (Commit mit [deploy ...])
Deployment
```

### Pattern 2: Schnelles Deployment

```
feature/web-feature
    ↓ (PR + Review)
main
    ↓ (Sofort deployen)
git commit --allow-empty -m "chore: [deploy web]"
    ↓
Vercel Deployment
```

### Pattern 3: Multi-Environment Release

```
feature/cross-platform
    ↓ (PR + Review)
main
    ↓ (Alle deployen)
git commit --allow-empty -m "chore: [deploy]"
    ↓
Web + iOS + Android deployed
```

---

## 📊 Vorteile dieser Strategie

### ✅ Kontrollierte Deployments

- Keine automatischen Deployments
- Explizite Entscheidung für jedes Deployment
- Bessere Kontrolle über Build-Minuten

### ✅ Einfachheit

- Ein Branch (`main`)
- Klare Commit-Message-Steuerung
- Keine Branch-Divergenz

### ✅ Flexibilität

- Manuelle Deployments via GitHub Actions
- Lokale Builds immer möglich
- Testing auf Feature-Branches möglich

### ✅ Wartbarkeit

- Reusable Workflows reduzieren Duplikation
- Einheitliches Pattern für alle Environments
- Einfach erweiterbar (Windows, macOS)

---

## 🛠️ Technische Details

### Reusable Workflows

**Quality Checks**:

- Inputs: `skip_format_check`, `skip_build_check`
- Wiederverwendbar für alle Deployment-Workflows

**EAS Build**:

- Inputs: `platform` (ios/android), `profile` (production/preview)
- Secrets: `EXPO_TOKEN`
- Wiederverwendbar für iOS und Android

### Deployment-Trigger

**Automatisch**:

- Nur auf `main` Branch
- Commit-Message enthält `[deploy ...]`

**Manuell**:

- GitHub Actions `workflow_dispatch`
- Von jedem Branch möglich
- Für Testing und Hotfixes

---

## 📚 Weitere Ressourcen

- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Vercel Deploy Hooks](https://vercel.com/docs/deployments/deployment-methods#deploy-hooks)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

**Diese Strategie ermöglicht kontrollierte, flexible Deployments mit minimaler Komplexität! 🚀**
