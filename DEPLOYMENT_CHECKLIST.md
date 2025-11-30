# Deployment Checklist für Hypnotify

## ✅ 1. Vercel Deployment für main-Branch

### Aktuelle Konfiguration

- ✅ `vercel.json` ist korrekt konfiguriert:
  - `"main": true` in `deploymentEnabled` → **Automatisches Deployment aktiviert**
  - Build Command: `npx expo export --platform web`
  - Output Directory: `dist`
  - Ignore Command: Überspringt nur Dokumentations-Änderungen

### Verifizierung

1. **Vercel Dashboard prüfen:**
   - Gehe zu [vercel.com](https://vercel.com)
   - Prüfe, ob das Repository verbunden ist
   - Prüfe, ob `main` Branch als Production Branch konfiguriert ist

- Prüfe Environment Variables:
  - `EXPO_PUBLIC_SUPABASE_FUNCTION_URL`
  - `EXPO_PUBLIC_SUPABASE_API_KEY`
  - `EXPO_PUBLIC_LEGAL_OPERATOR` (für Impressum)
  - `EXPO_PUBLIC_LEGAL_ADDRESS` (für Impressum)
  - `EXPO_PUBLIC_LEGAL_EMAIL` (für Impressum)

2. **Test nach Merge:**
   - Merge `feature/demo-preparation` → `main`
   - Vercel sollte automatisch deployen
   - Prüfe Deployment-Logs im Vercel Dashboard
   - Teste die Web-App nach Deployment

### Falls Vercel nicht automatisch deployed:

```bash
# Manuelles Deployment via CLI
npm install -g vercel
vercel --prod
```

---

## 📱 2. Android APK für lokale Installation

### Voraussetzungen

- ✅ EAS CLI installiert: `npm install -g eas-cli`
- ✅ Expo Account: `eas login`
- ✅ Projekt konfiguriert: `eas.json` vorhanden
- ✅ Legal-Informationen konfiguriert (siehe unten)

### Build-Befehle

#### Preview Build (für lokale Installation)

```bash
# APK für lokale Installation
eas build --platform android --profile preview
```

#### Production Build (für Play Store)

```bash
# AAB für Play Store Submission
eas build --platform android --profile production
```

### Legal-Informationen für EAS Build konfigurieren

Vor dem Build müssen die Legal-Informationen als EAS Secrets gesetzt werden:

```bash
# Legal-Informationen als Environment Variables setzen
# Für alle Environments (production, preview, development):
npx eas-cli env:create production --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Ihr Name" --scope project --visibility plaintext
npx eas-cli env:create preview --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Ihr Name" --scope project --visibility plaintext
npx eas-cli env:create development --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Ihr Name" --scope project --visibility plaintext

npx eas-cli env:create production --name EXPO_PUBLIC_LEGAL_ADDRESS --value "Ihre Stadt / Ihr Land" --scope project --visibility plaintext
npx eas-cli env:create preview --name EXPO_PUBLIC_LEGAL_ADDRESS --value "Ihre Stadt / Ihr Land" --scope project --visibility plaintext
npx eas-cli env:create development --name EXPO_PUBLIC_LEGAL_ADDRESS --value "Ihre Stadt / Ihr Land" --scope project --visibility plaintext

npx eas-cli env:create production --name EXPO_PUBLIC_LEGAL_EMAIL --value "ihre-email@example.com" --scope project --visibility sensitive
npx eas-cli env:create preview --name EXPO_PUBLIC_LEGAL_EMAIL --value "ihre-email@example.com" --scope project --visibility sensitive
npx eas-cli env:create development --name EXPO_PUBLIC_LEGAL_EMAIL --value "ihre-email@example.com" --scope project --visibility sensitive
```

**Oder interaktiv (wird nach Environment gefragt - wähle alle aus):**

```bash
npx eas-cli env:create --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Ihr Name" --scope project --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_LEGAL_ADDRESS --value "Ihre Stadt / Ihr Land" --scope project --visibility plaintext
npx eas-cli env:create --name EXPO_PUBLIC_LEGAL_EMAIL --value "ihre-email@example.com" --scope project --visibility sensitive
```

**Hinweis**:

- Falls EAS CLI global installiert ist (`npm install -g eas-cli`), kann `npx eas-cli` durch `eas` ersetzt werden.
- `--visibility plaintext` für öffentliche Daten (Name, Adresse)
- `--visibility sensitive` für E-Mail (empfohlen)
- Verfügbare Werte: `plaintext`, `sensitive`, `secret`

**Oder** in `eas.json` unter dem jeweiligen Profile:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_LEGAL_OPERATOR": "Ihr Name",
        "EXPO_PUBLIC_LEGAL_ADDRESS": "Ihre Stadt / Ihr Land",
        "EXPO_PUBLIC_LEGAL_EMAIL": "ihre-email@example.com"
      }
    }
  }
}
```

**Hinweis**: Für öffentliche Repos: Verwende EAS Secrets, nicht `eas.json` (um persönliche Daten nicht zu committen).

### Build-Prozess

1. **Build starten:**

   ```bash
   eas build --platform android --profile preview
   ```

2. **Build-Status prüfen:**
   - Build läuft auf EAS Servern
   - Status wird in der Konsole angezeigt
   - Oder prüfe auf: https://expo.dev/accounts/[your-account]/projects/hypnotify-app/builds

3. **APK herunterladen:**
   - Nach erfolgreichem Build wird Download-Link angezeigt
   - Oder: `eas build:list` zeigt alle Builds
   - Download-Link in der Konsole oder auf expo.dev

4. **Installation auf Android:**
   - APK auf Android-Gerät übertragen
   - "Unbekannte Quellen" in Android-Einstellungen aktivieren
   - APK installieren und testen

### Test-Checklist für Android

- [ ] App startet ohne Fehler
- [ ] TTS funktioniert (Stimmenauswahl)
- [ ] Stereo Meditation funktioniert
- [ ] Background Music funktioniert
- [ ] Settings werden gespeichert
- [ ] Navigation funktioniert
- [ ] Alle Sprachen funktionieren (DE, EN, ZH)
- [ ] Legal-Informationen korrekt angezeigt (Settings → Legal Information)

---

## 🍎 3. iOS Testing mit Expo Go

### Voraussetzungen

- ✅ iPhone mit iOS 11.0+
- ✅ Expo Go App installiert (App Store)
- ✅ Expo Account in Expo Go eingeloggt

### Testing-Prozess

#### 1. Development Server starten

```bash
# Von feature/demo-preparation Branch
npx expo start --lan --clear
# Oder mit Tunnel (falls LAN nicht funktioniert)
npx expo start --tunnel --clear
```

#### 2. Mit Expo Go verbinden

- QR-Code mit Expo Go App scannen
- Oder URL manuell in Expo Go eingeben
- App sollte laden (nach Login in Expo Go)

#### 3. Test-Checklist für iOS

- [ ] App lädt in Expo Go
- [ ] TTS funktioniert (Stimmenauswahl)
- [ ] Stereo Meditation funktioniert
- [ ] Background Music funktioniert
- [ ] Settings werden gespeichert
- [ ] Navigation funktioniert
- [ ] Alle Sprachen funktionieren (DE, EN, ZH)
- [ ] Keine Crashes oder Fehler

### Bekannte iOS Expo Go Einschränkungen

- ⚠️ Manche native Features funktionieren nicht in Expo Go
- ⚠️ Für vollständige Tests: Development Build erforderlich
- ✅ Für grundlegende Funktionalität: Expo Go ausreichend

---

## 🚀 4. App Store Deployment Vorbereitung

### Voraussetzungen

#### iOS App Store

- ✅ Apple Developer Account ($99/Jahr)
- ✅ App Store Connect Account
- ✅ App Store Connect App erstellt
- ✅ App Icons und Screenshots vorbereitet
- ✅ Privacy Policy URL
- ✅ App Description (DE, EN, ZH)

#### Google Play Store

- ✅ Google Play Developer Account ($25 einmalig)
- ✅ Google Play Console Account
- ✅ App erstellt in Play Console
- ✅ App Icons und Screenshots vorbereitet
- ✅ Privacy Policy URL
- ✅ App Description (DE, EN, ZH)

### Build-Konfiguration prüfen

#### `app.config.js` prüfen:

- ✅ `name`: "hypnotify-app"
- ✅ `version`: "1.0.0"
- ✅ `ios.bundleIdentifier`: "de.hypnohh.hypnotify"
- ✅ `android.package`: "de.hypnohh.hypnotify"
- ✅ Icons vorhanden: `assets/icon.png`, `assets/adaptive-icon.png`
- ✅ Splash Screen: `assets/splash-icon.png`

#### `eas.json` prüfen:

- ✅ Production Profile konfiguriert
- ✅ Android: `buildType: "apk"` (für lokale Tests) oder `"aab"` (für Play Store)
- ✅ iOS: Standard-Konfiguration
- ✅ Legal-Informationen: EAS Environment Variables gesetzt (für öffentliche Repos) oder in `eas.json` (nur für private Repos)

### Build-Prozess für App Stores

#### iOS App Store

```bash
# 1. Production Build erstellen
eas build --platform ios --profile production

# 2. Build zu App Store Connect submiten
eas submit --platform ios --profile production
```

**Oder manuell:**

1. Build auf expo.dev herunterladen
2. Mit Transporter App zu App Store Connect hochladen
3. In App Store Connect: TestFlight für Beta-Testing
4. App Store Review einreichen

#### Google Play Store

```bash
# 1. Production Build (AAB) erstellen
eas build --platform android --profile production

# 2. Build zu Play Store submiten
eas submit --platform android --profile production
```

**Oder manuell:**

1. AAB auf expo.dev herunterladen
2. In Play Console: Release → Production → Create Release
3. AAB hochladen
4. Release Notes hinzufügen
5. Review einreichen

### App Store Assets vorbereiten

#### Benötigte Assets:

- [ ] App Icon (1024x1024 für iOS, 512x512 für Android)
- [ ] Screenshots (verschiedene Gerätegrößen)
- [ ] Feature Graphic (Android: 1024x500)
- [ ] App Description (DE, EN, ZH)
- [ ] Keywords/Tags
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)

### Pre-Submission Checklist

#### Code

- [ ] Alle Features getestet
- [ ] Keine Console-Logs in Production
- [ ] Error Handling robust
- [ ] Performance optimiert
- [ ] Keine bekannten Bugs

#### App Store Connect / Play Console

- [ ] App erstellt
- [ ] Bundle ID / Package Name korrekt
- [ ] Version korrekt
- [ ] Build hochgeladen
- [ ] Screenshots hochgeladen
- [ ] Beschreibungen ausgefüllt
- [ ] Privacy Policy verlinkt
- [ ] Support-Informationen ausgefüllt
- [ ] Age Rating ausgefüllt
- [ ] Pricing & Distribution konfiguriert

#### Legal Information (Impressum)

- [ ] Legal-Informationen konfiguriert:
  - [ ] Vercel: Environment Variables gesetzt (`EXPO_PUBLIC_LEGAL_*`)
  - [ ] EAS Build: Environment Variables gesetzt (`npx eas-cli env:create`) oder in `eas.json` konfiguriert
  - [ ] Lokal: `src/config/legal.config.ts` erstellt (nicht committed)
- [ ] Impressum in App erreichbar (Settings → Legal Information)
- [ ] Alle Angaben korrekt (Name, Adresse, E-Mail)
- [ ] Disclaimer und Warnungen vorhanden

#### Testing

- [ ] iOS: TestFlight Beta-Testing durchgeführt
- [ ] Android: Internal Testing durchgeführt
- [ ] Alle Features auf physischen Geräten getestet
- [ ] Keine Crashes in TestFlight/Internal Testing

---

## 📋 Deployment-Reihenfolge

### Schritt 1: Vercel Deployment verifizieren

1. Merge `feature/demo-preparation` → `main`
2. Prüfe Vercel Dashboard für automatisches Deployment
3. Teste Web-App nach Deployment

### Schritt 2: iOS Expo Go Testing

1. `npx expo start --lan --clear` (oder `--tunnel` falls LAN nicht funktioniert)
2. Mit Expo Go verbinden
3. Vollständige Tests durchführen
4. **Wichtig**: Nur wenn iOS Tests erfolgreich sind, weiter zu Schritt 3

### Schritt 3: Android APK Build

1. `eas build --platform android --profile preview`
2. APK herunterladen
3. Auf Android-Gerät installieren
4. Vollständige Tests durchführen

### Schritt 4: Wenn alles läuft → App Store Deployment

1. App Store Assets vorbereiten
2. Production Builds erstellen
3. Zu App Stores submiten
4. Review-Prozess durchlaufen

---

## 🔍 Troubleshooting

### Vercel Deployment

- **Problem**: Deployment wird nicht getriggert
  - **Lösung**: Prüfe Vercel Dashboard → Settings → Git → Connected Repository
  - **Lösung**: Prüfe, ob `main` Branch als Production Branch konfiguriert ist

### Android Build

- **Problem**: Build schlägt fehl
  - **Lösung**: `eas build:configure` ausführen
  - **Lösung**: Prüfe `eas.json` Konfiguration
  - **Lösung**: Prüfe Expo Account Login: `eas whoami`

- **Problem**: Legal-Informationen fehlen oder zeigen Platzhalter
  - **Lösung**: Prüfe EAS Environment Variables: `npx eas-cli env:list`
  - **Lösung**: Falls Variable als "secret" existiert: `npx eas-cli env:delete production --variable-name EXPO_PUBLIC_LEGAL_OPERATOR` (für alle Environments: production, preview, development)
  - **Lösung**: Dann neu erstellen: `npx eas-cli env:create production --name EXPO_PUBLIC_LEGAL_OPERATOR --value "Ihr Name" --scope project --visibility plaintext` (für alle Environments wiederholen)
  - **Lösung**: Für private Repos: Prüfe `eas.json` → `env` Section im jeweiligen Profile

### iOS Expo Go

- **Problem**: App lädt nicht
  - **Lösung**: In Expo Go einloggen
  - **Lösung**: `--tunnel` statt `--lan` verwenden
  - **Lösung**: Prüfe Netzwerk-Verbindung

### App Store Submission

- **Problem**: Build wird abgelehnt
  - **Lösung**: Prüfe App Store Connect für Details
  - **Lösung**: Prüfe Guidelines-Konformität
  - **Lösung**: Prüfe Privacy Policy und Required Permissions

---

## 📝 Notizen

- **Vercel**: Automatisches Deployment sollte funktionieren, da `vercel.json` korrekt konfiguriert ist
- **Android**: Preview Build für lokale Tests, Production Build für Play Store
- **iOS**: Expo Go für initiales Testing, Development Build für vollständige Tests
- **App Stores**: Submission erst nach erfolgreichen Tests auf allen Plattformen
- **Legal Information**:
  - Für Vercel: Environment Variables in Dashboard setzen
  - Für EAS Build: Environment Variables via `npx eas-cli env:create` oder in `eas.json`
  - Für lokale Entwicklung: `src/config/legal.config.ts` erstellen (Template vorhanden)
  - **Wichtig**: `legal.config.ts` ist in `.gitignore` und wird nicht committed
