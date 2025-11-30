# Vercel Deploy Hook Setup

## 📋 Übersicht

Für das Web-Deployment wird ein Vercel Deploy Hook benötigt. Dieser Hook wird von GitHub Actions aufgerufen, um Vercel-Deployments zu triggern.

---

## 🔧 Schritt 1: Vercel Deploy Hook erstellen

1. Gehe zu [Vercel Dashboard](https://vercel.com/dashboard)
2. Wähle dein Projekt aus
3. **Settings** → **Deploy Hooks**
4. Klicke auf **"Create Hook"**
5. Fülle aus:
   - **Name**: `Production Deploy` (oder beliebig)
   - **Git Branch**: `main` (optional, kann leer bleiben)
   - **Build Command**: (leer lassen, wird von `vercel.json` übernommen)
6. Klicke auf **"Create Hook"**
7. **Kopiere die Hook URL** (z.B. `https://api.vercel.com/v1/integrations/deploy/...`)

---

## 🔐 Schritt 2: GitHub Secret hinzufügen

### Option A: Repository Secret (Einfacher)

1. Gehe zu deinem GitHub Repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Klicke auf **"New repository secret"**
4. Fülle aus:
   - **Name**: `VERCEL_DEPLOY_HOOK`
   - **Secret**: Die Hook-URL von Schritt 1
5. Klicke auf **"Add secret"**

### Option B: Environment Secret (Mit Environment-Protection) - **Empfohlen**

1. Gehe zu deinem GitHub Repository
2. **Settings** → **Environments**
3. Wähle **"Production – hypnotify"** (für Production-Deployments)
4. Klicke auf **"Add secret"**
5. Fülle aus:
   - **Name**: `VERCEL_DEPLOY_HOOK`
   - **Secret**: Die Hook-URL von Schritt 1
6. Klicke auf **"Add secret"**

**Hinweis**:

- Der Workflow verwendet `Production – hypnotify` (bereits konfiguriert)
- Für Preview-Deployments könntest du `Preview – hypnotify` verwenden (falls benötigt)
- Environment Secrets ermöglichen Protection Rules (z.B. manuelle Bestätigung vor Deployment)

---

## ✅ Schritt 3: Verifizierung

Nach dem Setzen des Secrets kannst du testen:

```bash
# Test-Deployment triggern
git commit --allow-empty -m "chore: [deploy web]"
git push origin main
```

Oder manuell via GitHub Actions:

- **Actions** → **Deploy Web** → **Run workflow** → **Force deploy** aktivieren

---

## 🔍 Troubleshooting

### Problem: Workflow schlägt fehl mit "VERCEL_DEPLOY_HOOK not set"

**Lösung**:

- Prüfe, ob der Secret in GitHub gesetzt ist
- Prüfe den Secret-Namen (muss genau `VERCEL_DEPLOY_HOOK` sein)
- Prüfe, ob der Secret für alle Environments verfügbar ist

### Problem: Hook funktioniert nicht

**Lösung**:

- Prüfe die Hook-URL in Vercel
- Prüfe, ob der Hook noch aktiv ist
- Prüfe Vercel Dashboard → Deployments für Fehler

### Problem: Deployment wird nicht getriggert

**Lösung**:

- Prüfe, ob Commit-Message `[deploy web]` enthält
- Prüfe, ob auf `main` Branch gepusht wurde
- Prüfe GitHub Actions Logs für Details

---

## 📝 Notizen

- Der Hook ist **nicht** für Preview-Deployments (diese werden automatisch für Feature-Branches erstellt, falls aktiviert)
- Der Hook ist **nur** für Production-Deployments
- Lokale Deployments funktionieren weiterhin via `vercel deploy --prod`

---

**Nach dem Setup ist das Web-Deployment vollständig automatisiert! 🚀**
