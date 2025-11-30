# Legal Information Configuration Setup

## 📋 Übersicht

Diese Datei enthält die konkreten Werte und Commands, um die Legal-Informationen für Vercel und EAS Build zu konfigurieren.

---

## 🌐 Vercel Environment Variables

Im Vercel Dashboard → Settings → Environment Variables folgende Variablen anlegen:

### Production Environment

| Variable Name                | Value                   |
| ---------------------------- | ----------------------- |
| `EXPO_PUBLIC_LEGAL_OPERATOR` | `Bernd Früchtnicht`     |
| `EXPO_PUBLIC_LEGAL_ADDRESS`  | `Hamburg / Deutschland` |
| `EXPO_PUBLIC_LEGAL_EMAIL`    | `info@hypnohh.online`   |

### Vorgehen in Vercel:

1. Gehe zu [vercel.com](https://vercel.com) → Dein Projekt
2. Settings → Environment Variables
3. Für jedes Variable:
   - **Name**: `EXPO_PUBLIC_LEGAL_OPERATOR` (usw.)
   - **Value**: `Bernd Früchtnicht` (usw.)
   - **Environment**: `Production` (und optional `Preview`, `Development`)
   - **Add** klicken

4. Nach dem Setzen: **Redeploy** triggern (oder warte auf nächsten Push zu `main`)

---

## 📱 EAS Build Environment Variables

Für EAS Builds die Environment Variables mit folgenden Commands setzen:

### Commands zum Ausführen:

**Falls Variablen bereits existieren (z.B. als "secret"), zuerst löschen:**

```bash
# Alte Variablen löschen (falls vorhanden)
# Für jedes Environment (production, preview, development) einzeln löschen:
npx eas-cli env:delete production --variable-name EXPO_PUBLIC_LEGAL_OPERATOR
npx eas-cli env:delete preview --variable-name EXPO_PUBLIC_LEGAL_OPERATOR
npx eas-cli env:delete development --variable-name EXPO_PUBLIC_LEGAL_OPERATOR

npx eas-cli env:delete production --variable-name EXPO_PUBLIC_LEGAL_ADDRESS
npx eas-cli env:delete preview --variable-name EXPO_PUBLIC_LEGAL_ADDRESS
npx eas-cli env:delete development --variable-name EXPO_PUBLIC_LEGAL_ADDRESS

npx eas-cli env:delete production --variable-name EXPO_PUBLIC_LEGAL_EMAIL
npx eas-cli env:delete preview --variable-name EXPO_PUBLIC_LEGAL_EMAIL
npx eas-cli env:delete development --variable-name EXPO_PUBLIC_LEGAL_EMAIL
```

**Oder interaktiv (wird nach Environment gefragt):**

```bash
npx eas-cli env:delete --variable-name EXPO_PUBLIC_LEGAL_OPERATOR
npx eas-cli env:delete --variable-name EXPO_PUBLIC_LEGAL_ADDRESS
npx eas-cli env:delete --variable-name EXPO_PUBLIC_LEGAL_EMAIL
```

**Dann neu erstellen (für alle Environments):**

```bash
# Operator (Name) - für alle Environments
npx eas-cli env:create production --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Bernd Früchtnicht" --scope project --visibility plaintext
npx eas-cli env:create preview --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Bernd Früchtnicht" --scope project --visibility plaintext
npx eas-cli env:create development --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Bernd Früchtnicht" --scope project --visibility plaintext

# Address - für alle Environments
npx eas-cli env:create production --name EXPO_PUBLIC_LEGAL_ADDRESS --value "Hamburg / Deutschland" --scope project --visibility plaintext
npx eas-cli env:create preview --name EXPO_PUBLIC_LEGAL_ADDRESS --value "Hamburg / Deutschland" --scope project --visibility plaintext
npx eas-cli env:create development --name EXPO_PUBLIC_LEGAL_ADDRESS --value "Hamburg / Deutschland" --scope project --visibility plaintext

# Email - für alle Environments
npx eas-cli env:create production --name EXPO_PUBLIC_LEGAL_EMAIL --value "info@hypnohh.online" --scope project --visibility sensitive
npx eas-cli env:create preview --name EXPO_PUBLIC_LEGAL_EMAIL --value "info@hypnohh.online" --scope project --visibility sensitive
npx eas-cli env:create development --name EXPO_PUBLIC_LEGAL_EMAIL --value "info@hypnohh.online" --scope project --visibility sensitive
```

**Oder interaktiv (wird nach Environment gefragt - wähle alle aus):**

```bash
npx eas-cli env:create --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Bernd Früchtnicht" --scope project --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_LEGAL_ADDRESS --value "Hamburg / Deutschland" --scope project --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_LEGAL_EMAIL --value "info@hypnohh.online" --scope project --visibility sensitive
```

**Hinweis**:

- Falls EAS CLI global installiert ist, kann `npx eas-cli` durch `eas` ersetzt werden.
- `--visibility plaintext` für öffentliche Daten (Name, Adresse)
- `--visibility sensitive` für E-Mail (empfohlen)
- Verfügbare Werte: `plaintext`, `sensitive`, `secret`

### Prüfen ob Environment Variables gesetzt sind:

```bash
npx eas-cli env:list
```

### Environment Variables löschen (falls nötig):

**Für alle Environments einzeln:**

```bash
npx eas-cli env:delete production --variable-name EXPO_PUBLIC_LEGAL_OPERATOR
npx eas-cli env:delete preview --variable-name EXPO_PUBLIC_LEGAL_OPERATOR
npx eas-cli env:delete development --variable-name EXPO_PUBLIC_LEGAL_OPERATOR
```

**Oder interaktiv (wird nach Environment gefragt):**

```bash
npx eas-cli env:delete --variable-name EXPO_PUBLIC_LEGAL_OPERATOR
npx eas-cli env:delete --variable-name EXPO_PUBLIC_LEGAL_ADDRESS
npx eas-cli env:delete --variable-name EXPO_PUBLIC_LEGAL_EMAIL
```

**Wichtig**: Wenn eine Variable bereits als "secret" existiert, muss sie erst gelöscht werden, bevor sie mit anderer Visibility neu erstellt werden kann.

---

## ✅ Verifizierung

Nach dem Setzen der Variablen/Secrets:

### Vercel:

1. Neues Deployment triggern (Redeploy oder Push zu `main`)
2. In der App: Settings → Legal Information
3. Prüfen, ob alle Werte korrekt angezeigt werden

### EAS Build:

1. Build starten: `npx eas-cli build --platform android --profile production`
2. Nach Build: App installieren und testen
3. In der App: Settings → Legal Information
4. Prüfen, ob alle Werte korrekt angezeigt werden

---

## 📝 Notizen

- **Vercel**: Environment Variables werden zur Build-Zeit eingebettet
- **EAS**: Environment Variables werden zur Build-Zeit eingebettet
- **Lokale Entwicklung**: Verwendet `src/config/legal.config.ts` (falls vorhanden)
- **Fallback**: Wenn nichts gesetzt ist, werden Platzhalter-Werte verwendet

---

## 🔄 Für andere Entwickler / Forks

Wenn jemand das Repo forkt oder verwendet:

1. **Lokale Entwicklung**:
   - `src/config/legal.config.template.ts` → `legal.config.ts` kopieren
   - Eigene Werte eintragen

2. **Vercel Deployment**:
   - Eigene Environment Variables im Vercel Dashboard setzen

3. **EAS Build**:
   - Eigene EAS Environment Variables setzen mit den Commands oben (eigene Werte)

**Wichtig**: Niemals persönliche Daten committen!
