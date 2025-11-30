# GitHub Environments - Erklärung

## 📋 Übersicht

GitHub Environments ermöglichen es, verschiedene Deployment-Umgebungen zu definieren, mit eigenen Secrets, Variablen und Protection Rules.

---

## 🔍 Deine Environments

In deinem Repository findest du:

- **`Production`** (ohne Suffix)
- **`Production – hypnotify`** ✅ **Verwenden wir**
- **`Preview`** (ohne Suffix)
- **`Preview – hypnotify`**

---

## 📚 Bedeutung

### Production Environment

**Zweck**: Live-Deployments zu Production

**Features**:

- Separate Secrets für Production
- Protection Rules (optional):
  - Manuelle Bestätigung vor Deployment
  - Required Reviewers
  - Wait Timer
- Audit Trail: Wer hat wann deployed
- Rollback-Möglichkeiten

**Verwendung**: Für alle Production-Deployments

### Preview Environment

**Zweck**: Test-Deployments vor Production

**Features**:

- Separate Secrets für Testing
- Weniger restriktiv als Production
- Für Feature-Branches oder Pre-Production-Tests

**Verwendung**: Für Test-Deployments (optional)

---

## 🎯 Warum mehrere Environments?

### Mögliche Gründe:

1. **Verschiedene Projekte/Repos**
   - `hypnotify` (altes Projekt?)
   - `hypnotify-public` (aktuelles Projekt)

2. **Legacy-Konfigurationen**
   - Alte Environments wurden nicht gelöscht
   - Neue Environments wurden hinzugefügt

3. **Verschiedene Deployment-Targets**
   - Verschiedene Vercel-Projekte
   - Verschiedene Domains

---

## ✅ Empfehlung für hypnotify-public

### Production-Deployments

**Environment**: `Production – hypnotify`

**Warum**:

- Klar zugeordnet zu deinem Projekt
- Trennung von anderen Projekten
- Konsistent mit deinem Setup

**Workflow-Konfiguration**:

```yaml
environment:
  name: Production – hypnotify
```

### Preview-Deployments (optional)

**Environment**: `Preview – hypnotify`

**Verwendung**: Falls du Preview-Deployments für Feature-Branches möchtest

**Workflow-Konfiguration** (für Preview):

```yaml
environment:
  name: Preview – hypnotify
```

---

## 🔧 Environment Secrets

### Production Secrets

**Location**: `Production – hypnotify` Environment

**Secrets**:

- `VERCEL_DEPLOY_HOOK` - Vercel Deploy Hook URL

**Zugriff**: Nur für Production-Deployments

### Preview Secrets (optional)

**Location**: `Preview – hypnotify` Environment

**Secrets**: (falls benötigt)

- Separate Hook-URL für Preview-Deployments

**Zugriff**: Nur für Preview-Deployments

---

## 🛡️ Protection Rules (optional)

Du kannst Protection Rules für `Production – hypnotify` aktivieren:

1. **Required Reviewers**: Bestimmte Personen müssen Deployment bestätigen
2. **Wait Timer**: Wartezeit vor Deployment (z.B. 5 Minuten)
3. **Deployment Branches**: Nur bestimmte Branches erlauben

**Aktivierung**:

- GitHub Repository → Settings → Environments
- `Production – hypnotify` → Protection Rules
- Rules aktivieren

**Vorteil**: Zusätzliche Sicherheit für Production-Deployments

---

## 📊 Vergleich

| Environment              | Zweck           | Secrets               | Protection | Verwendung      |
| ------------------------ | --------------- | --------------------- | ---------- | --------------- |
| `Production`             | Legacy?         | -                     | -          | Nicht verwenden |
| `Production – hypnotify` | ✅ Production   | ✅ VERCEL_DEPLOY_HOOK | Optional   | **Verwenden**   |
| `Preview`                | Legacy?         | -                     | -          | Nicht verwenden |
| `Preview – hypnotify`    | Preview/Testing | Optional              | -          | Optional        |

---

## 🧹 Cleanup (optional)

Falls die Environments ohne Suffix nicht mehr benötigt werden:

1. Prüfe, ob sie in anderen Workflows verwendet werden
2. Falls nicht: GitHub Repository → Settings → Environments
3. Environment löschen

**Vorsicht**: Nur löschen, wenn sicher, dass sie nicht mehr benötigt werden!

---

## 📝 Zusammenfassung

**Für hypnotify-public**:

- ✅ **Production**: `Production – hypnotify`
- ✅ **Preview** (optional): `Preview – hypnotify`
- ❌ **Nicht verwenden**: `Production` und `Preview` ohne Suffix (vermutlich Legacy)

**Workflow-Konfiguration**:

- Alle Production-Workflows verwenden `Production – hypnotify`
- Preview-Workflows (falls vorhanden) verwenden `Preview – hypnotify`

---

**Diese Struktur ermöglicht klare Trennung zwischen Production und Preview! 🚀**
