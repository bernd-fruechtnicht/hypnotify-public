# iOS App Store Veröffentlichung - Schritt-für-Schritt Anleitung

## 📋 Übersicht

Diese Anleitung führt dich durch den kompletten Prozess der iOS App Store Veröffentlichung für Hypnotify.

**✅ Wichtig für Windows-Nutzer**: Mit EAS Build kannst du **alles von Windows aus** machen! iOS-Builds werden in der Cloud erstellt, kein macOS/Xcode erforderlich.

---

## 💻 Windows-Kompatibilität

### ✅ Was auf Windows funktioniert:

- ✅ **EAS Build**: iOS-Builds werden in der Cloud erstellt (kein macOS nötig)
- ✅ **EAS Submit**: Automatisches Upload zu App Store Connect
- ✅ **App Store Connect**: Web-Interface (funktioniert auf jedem OS)
- ✅ **Alle Konfigurationen**: `app.config.js`, `eas.json`, Environment Variables
- ✅ **Build-Management**: Über expo.dev Web-Interface oder EAS CLI

### ❌ Was NICHT auf Windows funktioniert:

- ❌ **Transporter App**: Nur für macOS verfügbar (aber nicht nötig, da EAS Submit das automatisch macht)
- ❌ **Xcode**: Nur für macOS verfügbar (aber nicht nötig mit EAS Build)

### 🎯 Empfehlung für Windows:

**Verwende EAS Build + EAS Submit** - das ist der einfachste Weg und funktioniert komplett von Windows aus:

```bash
# Build in der Cloud (funktioniert von Windows)
npx eas-cli build --platform ios --profile production

# Automatisches Upload (funktioniert von Windows)
npx eas-cli submit --platform ios --profile production
```

**Kein macOS, kein Xcode, kein Transporter nötig!** 🎉

---

## ✅ Voraussetzungen

### 1. Apple Developer Account

- **Kosten**: $99/Jahr (jährliche Abo)
- **Registrierung**: [developer.apple.com](https://developer.apple.com)
- **Benötigt für**: App Store Veröffentlichung, TestFlight, Code Signing

### 2. App Store Connect Account

- **Zugriff**: Über Apple Developer Account
- **URL**: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- **Benötigt für**: App-Management, Build-Upload, Review-Einreichung

### 3. Technische Voraussetzungen

- ✅ Expo/EAS Account (kostenlos)
- ✅ EAS CLI installiert: `npm install -g eas-cli` oder `npx eas-cli`
- ✅ Apple Developer Account mit aktiver Mitgliedschaft
- ✅ App Store Connect App erstellt (siehe Schritt 2)
- ✅ **Windows, macOS oder Linux** - EAS Build funktioniert auf allen Plattformen!

---

## 🚀 Schritt 1: Projekt-Konfiguration prüfen

### 1.1 `app.config.js` prüfen

Stelle sicher, dass folgende iOS-Konfiguration korrekt ist:

```javascript
ios: {
  supportsTablet: true,
  bundleIdentifier: 'de.hypnohh.hypnotify', // Für Production
  // bundleIdentifier: 'de.hypnohh.hypnotify.dev', // Für Development
}
```

**Wichtig**:

- Bundle Identifier muss eindeutig sein
- Format: `de.hypnohh.hypnotify` (reverse domain notation)
- Muss in App Store Connect registriert sein

### 1.2 `eas.json` prüfen

Stelle sicher, dass das Production-Profil korrekt konfiguriert ist:

```json
{
  "build": {
    "production": {
      "env": {
        "APP_VARIANT": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 1.3 App-Version prüfen

In `app.config.js`:

- `version`: "1.0.0" (oder höher)
- iOS verwendet automatisch `CFBundleVersion` basierend auf Build-Nummer

### 1.4 Assets prüfen

Stelle sicher, dass folgende Assets vorhanden sind:

- ✅ `assets/icon.png` (1024x1024 px, PNG, ohne Transparenz)
- ✅ `assets/splash-icon.png` (für Splash Screen)
- ✅ Alle Assets sind korrekt dimensioniert

---

## 📱 Schritt 2: App Store Connect Setup

### 2.1 App in App Store Connect erstellen

1. Gehe zu [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps** → **+** (neue App)
3. Fülle aus:
   - **Platform**: iOS
   - **Name**: Hypnotify (oder dein App-Name)
   - **Primary Language**: Deutsch (oder Englisch)
   - **Bundle ID**: `de.hypnohh.hypnotify` (muss bereits in Apple Developer registriert sein)
   - **SKU**: Eindeutige ID (z.B. `hypnotify-ios-001`)
   - **User Access**: Full Access (oder Limited Access)

### 2.2 Bundle ID registrieren (falls noch nicht geschehen)

1. Gehe zu [developer.apple.com/account/resources/identifiers/list](https://developer.apple.com/account/resources/identifiers/list)
2. **+** (neue Identifier)
3. **App IDs** → **Continue**
4. **App** → **Continue**
5. **Description**: Hypnotify App
6. **Bundle ID**: `de.hypnohh.hypnotify` (Explicit)
7. **Capabilities**: Auswählen (z.B. Push Notifications, wenn benötigt)
8. **Continue** → **Register**

### 2.3 App-Informationen ausfüllen

In App Store Connect → **App Information**:

- **Name**: Hypnotify
- **Subtitle**: (optional)
- **Category**:
  - Primary: Health & Fitness (oder passend)
  - Secondary: (optional)
- **Privacy Policy URL**: (erforderlich, z.B. deine Vercel-URL + `/legal`)
- **Support URL**: (erforderlich, z.B. deine Website)
- **Marketing URL**: (optional)

---

## 🔐 Schritt 3: EAS Credentials konfigurieren

### 3.1 EAS Account Login

```bash
npx eas-cli login
```

### 3.2 EAS Build konfigurieren

```bash
npx eas-cli build:configure
```

Dies erstellt/aktualisiert die `eas.json` Konfiguration.

### 3.3 Apple Credentials einrichten

EAS kann automatisch Credentials verwalten. Beim ersten iOS Build wirst du gefragt:

- **Apple ID**: Deine Apple Developer E-Mail
- **App-Specific Password**: Falls 2FA aktiviert ist
- **Team ID**: Wird automatisch erkannt

**Oder manuell**:

```bash
npx eas-cli credentials
```

Wähle:

- **Platform**: iOS
- **Project**: hypnotify-app
- **Action**: Setup credentials

---

## 🏗️ Schritt 4: Production Build erstellen

### 4.1 Environment Variables prüfen

Stelle sicher, dass alle benötigten Environment Variables gesetzt sind:

```bash
# Prüfe gesetzte Variablen
npx eas-cli env:list
```

**Benötigte Variablen für Production**:

- `EXPO_PUBLIC_SUPABASE_FUNCTION_URL`
- `EXPO_PUBLIC_SUPABASE_API_KEY`
- `EXPO_PUBLIC_LEGAL_OPERATOR`
- `EXPO_PUBLIC_LEGAL_ADDRESS`
- `EXPO_PUBLIC_LEGAL_EMAIL`

Falls nicht gesetzt, siehe `LEGAL_CONFIG_SETUP.md` für Anleitung.

### 4.2 iOS Production Build starten

```bash
npx eas-cli build --platform ios --profile production
```

**Was passiert**:

1. EAS Build Server erstellt den Build
2. Code Signing wird automatisch durchgeführt
3. Build wird auf expo.dev hochgeladen
4. Du erhältst eine Download-URL

**Build-Zeit**: Ca. 10-20 Minuten

### 4.3 Build-Status prüfen

```bash
npx eas-cli build:list
```

Oder im Browser: [expo.dev/accounts/[dein-account]/builds](https://expo.dev)

---

## 📤 Schritt 5: Build zu App Store Connect submiten

### 5.1 Automatisches Submit (empfohlen)

```bash
npx eas-cli submit --platform ios --profile production
```

**Was passiert**:

1. EAS lädt den Build zu App Store Connect hoch
2. Build erscheint in App Store Connect → **TestFlight** → **iOS Builds**
3. Processing dauert ca. 10-30 Minuten

### 5.2 Manuelles Submit (Alternative - nur macOS)

**Hinweis für Windows-Nutzer**: Falls automatisches Submit nicht funktioniert, kontaktiere Expo Support oder verwende einen macOS-Rechner für manuelles Upload.

Falls automatisches Submit nicht funktioniert (nur auf macOS möglich):

1. **Build herunterladen**:
   - Gehe zu [expo.dev](https://expo.dev) → Builds
   - Lade `.ipa` Datei herunter

2. **Transporter App verwenden** (nur macOS):
   - Installiere [Transporter](https://apps.apple.com/app/transporter/id1450874784) (macOS)
   - Öffne Transporter
   - **Deliver Your App** → `.ipa` Datei auswählen
   - **Deliver** klicken

3. **Oder Xcode verwenden** (nur macOS):
   - Xcode → **Window** → **Organizer**
   - **Archives** → Build auswählen
   - **Distribute App** → **App Store Connect** → **Upload**

**Alternative für Windows**: Falls `eas submit` nicht funktioniert, prüfe:

- EAS CLI Version: `npx eas-cli --version` (sollte >= 5.9.1 sein)
- Apple Credentials: `npx eas-cli credentials`
- Expo Support kontaktieren

---

## 🧪 Schritt 6: TestFlight Setup (Beta-Testing)

### 6.1 Build in App Store Connect verarbeiten

1. Gehe zu App Store Connect → **TestFlight**
2. Warte, bis Build verarbeitet ist (Status: "Processing" → "Ready to Submit")
3. Falls Fehler: Prüfe E-Mail oder App Store Connect für Details

### 6.2 TestFlight Internal Testing

1. **TestFlight** → **Internal Testing**
2. **+** (neue Gruppe) oder bestehende Gruppe verwenden
3. Build auswählen
4. **Add Testers** (bis zu 100 interne Tester)
5. Tester erhalten E-Mail-Einladung

### 6.3 TestFlight External Testing (optional)

1. **TestFlight** → **External Testing**
2. **+** (neue Gruppe)
3. Build auswählen
4. **App Store Review Information** ausfüllen:
   - **What to Test**: Beschreibung der Features
   - **Contact Information**: Deine E-Mail
5. **Submit for Review** (Apple prüft auch TestFlight Builds)

**Wichtig**: External Testing erfordert Apple Review (1-2 Tage)

---

## 📝 Schritt 7: App Store Listing vorbereiten

### 7.1 App Store Screenshots

**Benötigte Screenshots** (für verschiedene Geräte):

- **iPhone 6.7" (iPhone 14 Pro Max)**:
  - 1290 x 2796 px (Portrait)
  - Mindestens 1 Screenshot erforderlich

- **iPhone 6.5" (iPhone 11 Pro Max)**:
  - 1242 x 2688 px (Portrait)

- **iPhone 5.5" (iPhone 8 Plus)**:
  - 1242 x 2208 px (Portrait)

- **iPad Pro 12.9"**:
  - 2048 x 2732 px (Portrait)

**Tools zum Erstellen**:

- [App Store Screenshot Generator](https://www.appstorescreenshot.com/)
- [Fastlane Frameit](https://docs.fastlane.tools/actions/frameit/)
- Manuell: Screenshots auf echten Geräten machen

### 7.2 App Description

**Benötigte Texte** (in verschiedenen Sprachen):

- **Name**: Hypnotify (max. 30 Zeichen)
- **Subtitle**: (optional, max. 30 Zeichen)
- **Description**:
  - Max. 4000 Zeichen
  - Beschreibe Features, Nutzen, Zielgruppe
  - Verwende Keywords natürlich
- **Keywords**:
  - Max. 100 Zeichen
  - Komma-getrennt
  - Beispiel: "meditation,hypnosis,relaxation,wellness"

**Sprachen**:

- Deutsch (Primary)
- Englisch (empfohlen)
- Chinesisch (optional, falls vorhanden)

### 7.3 App Store Listing ausfüllen

In App Store Connect → **App Store** → **1.0 Prepare for Submission**:

1. **Screenshots**: Hochladen (alle erforderlichen Größen)
2. **Description**: Ausfüllen
3. **Keywords**: Eingeben
4. **Support URL**: Eintragen
5. **Marketing URL**: (optional)
6. **Privacy Policy URL**: **ERFORDERLICH** (z.B. `https://deine-app.vercel.app/legal`)

### 7.4 App Review Information

- **Contact Information**: Deine E-Mail
- **Phone**: (optional)
- **Demo Account**: (falls Login erforderlich)
- **Notes**: Zusätzliche Informationen für Reviewer

### 7.5 Version Information

- **Version**: 1.0.0 (muss mit `app.config.js` übereinstimmen)
- **Copyright**: © 2024 [Dein Name]
- **What's New**: Release Notes (für Updates)

---

## 🔍 Schritt 8: App Review einreichen

### 8.1 Pre-Submission Checklist

- [ ] Build erfolgreich hochgeladen
- [ ] TestFlight Testing durchgeführt (empfohlen)
- [ ] Alle Screenshots hochgeladen
- [ ] App Description ausgefüllt
- [ ] Privacy Policy URL gesetzt
- [ ] Support URL gesetzt
- [ ] Age Rating ausgefüllt
- [ ] Pricing & Distribution konfiguriert
- [ ] Export Compliance beantwortet
- [ ] Content Rights bestätigt

### 8.2 Age Rating

1. **App Store Connect** → **App Information** → **Age Rating**
2. Fragebogen ausfüllen:
   - **Medical/Treatment Information**: Nein (falls keine medizinischen Ratschläge)
   - **Unrestricted Web Access**: Nein (falls keine Browser-Funktion)
   - **Gambling**: Nein
   - etc.
3. Rating wird automatisch berechnet (meist 4+ oder 12+)

### 8.3 Pricing & Distribution

1. **App Store Connect** → **Pricing and Availability**
2. **Price**: Free (oder Preis wählen)
3. **Availability**: Alle Länder (oder spezifische)
4. **Discounts**: (optional)

### 8.4 Submit for Review

1. **App Store Connect** → **App Store** → **1.0 Prepare for Submission**
2. **Build** auswählen (der Build, den du hochgeladen hast)
3. **Export Compliance**: Beantworten (meist "No" für Standard-Apps)
4. **Content Rights**: Bestätigen
5. **Advertising Identifier**: (falls verwendet)
6. **Submit for Review** klicken

---

## ⏱️ Schritt 9: Review-Prozess

### 9.1 Review-Zeit

- **Durchschnitt**: 24-48 Stunden
- **Kann länger dauern**: Bei komplexen Apps oder Feiertagen
- **Status prüfen**: App Store Connect → **App Store** → **App Review**

### 9.2 Mögliche Status

- **Waiting for Review**: In Warteschlange
- **In Review**: Wird gerade geprüft
- **Pending Developer Release**: Genehmigt, wartet auf manuelles Release
- **Ready for Sale**: Verfügbar im App Store
- **Rejected**: Abgelehnt (Details in E-Mail/App Store Connect)

### 9.3 Bei Ablehnung

1. **E-Mail lesen**: Apple sendet detaillierte Ablehnungsgründe
2. **App Store Connect prüfen**: **Resolution Center** für Details
3. **Probleme beheben**: Code/Assets anpassen
4. **Neuen Build hochladen**: Falls Code-Änderungen nötig
5. **Erneut einreichen**: Mit Erklärung der Änderungen

---

## 🎉 Schritt 10: App veröffentlichen

### 10.1 Automatisches Release

Falls **"Pending Developer Release"**:

1. **App Store Connect** → **App Store** → **1.0**
2. **Release this version** klicken
3. App erscheint innerhalb weniger Stunden im App Store

### 10.2 Manuelles Release

Du kannst auch einen Release-Zeitpunkt festlegen:

1. **App Store Connect** → **App Store** → **1.0**
2. **Schedule Release** wählen
3. Datum/Zeit auswählen
4. App wird automatisch zum gewählten Zeitpunkt veröffentlicht

---

## 🔄 Schritt 11: Updates veröffentlichen

### 11.1 Version erhöhen

In `app.config.js`:

```javascript
version: '1.0.1'; // Minor Update
// oder
version: '1.1.0'; // Feature Update
// oder
version: '2.0.0'; // Major Update
```

### 11.2 Neuen Build erstellen

```bash
npx eas-cli build --platform ios --profile production
```

### 11.3 Submit Update

```bash
npx eas-cli submit --platform ios --profile production
```

### 11.4 App Store Connect

1. **App Store Connect** → **App Store** → **1.0.1 Prepare for Submission**
2. Neuen Build auswählen
3. **What's New in This Version**: Release Notes eingeben
4. **Submit for Review**

---

## 📋 Checkliste: iOS App Store Veröffentlichung

### Vor dem Build

- [ ] Apple Developer Account aktiv ($99/Jahr)
- [ ] App Store Connect App erstellt
- [ ] Bundle ID registriert (`de.hypnohh.hypnotify`)
- [ ] `app.config.js` iOS-Konfiguration korrekt
- [ ] `eas.json` Production-Profil konfiguriert
- [ ] App-Version in `app.config.js` gesetzt
- [ ] App Icon vorhanden (1024x1024 px)
- [ ] Splash Screen vorhanden
- [ ] EAS Environment Variables gesetzt (Legal-Info, API Keys)

### Build & Submit

- [ ] EAS Build erfolgreich: `npx eas-cli build --platform ios --profile production`
- [ ] Build zu App Store Connect hochgeladen
- [ ] Build in App Store Connect verarbeitet (Status: "Ready to Submit")

### App Store Listing

- [ ] Screenshots hochgeladen (alle erforderlichen Größen)
- [ ] App Description ausgefüllt (DE, EN, optional ZH)
- [ ] Keywords eingetragen
- [ ] Privacy Policy URL gesetzt
- [ ] Support URL gesetzt
- [ ] Age Rating ausgefüllt
- [ ] Pricing & Distribution konfiguriert

### Pre-Submission

- [ ] TestFlight Testing durchgeführt (empfohlen)
- [ ] Alle Features getestet
- [ ] Keine Console-Logs in Production
- [ ] Legal Information korrekt (Impressum in App)
- [ ] Export Compliance beantwortet
- [ ] Content Rights bestätigt

### Submission

- [ ] Build in App Store Connect ausgewählt
- [ ] **Submit for Review** geklickt
- [ ] Review-Status überwacht

### Nach Genehmigung

- [ ] App veröffentlicht (automatisch oder manuell)
- [ ] App Store Listing geprüft
- [ ] Download-Link getestet
- [ ] Monitoring eingerichtet (Crash Reports, Reviews)

---

## 🔧 Troubleshooting

### Build-Fehler

**Problem**: Build schlägt fehl

- **Lösung**: Prüfe EAS Build Logs auf expo.dev
- **Lösung**: Prüfe Apple Credentials: `npx eas-cli credentials`
- **Lösung**: Prüfe Bundle ID in Apple Developer Portal

**Problem**: Code Signing Fehler

- **Lösung**: Prüfe Apple Developer Account Status
- **Lösung**: Prüfe Team ID: `npx eas-cli credentials`
- **Lösung**: Erstelle neue Provisioning Profile in EAS

### Submit-Fehler

**Problem**: Submit schlägt fehl

- **Lösung**: Prüfe, ob Build erfolgreich war
- **Lösung**: Prüfe App Store Connect → TestFlight → Builds
- **Lösung (Windows)**: Prüfe EAS CLI Version und Credentials, kontaktiere Expo Support falls nötig
- **Lösung (macOS)**: Verwende manuelles Submit (Transporter App)

**Problem**: Build erscheint nicht in App Store Connect

- **Lösung**: Warte 10-30 Minuten (Processing-Zeit)
- **Lösung**: Prüfe E-Mail für Fehler-Benachrichtigungen
- **Lösung**: Prüfe Bundle ID Übereinstimmung

### Review-Probleme

**Problem**: App wurde abgelehnt

- **Lösung**: Lies Ablehnungs-E-Mail genau
- **Lösung**: Prüfe App Store Connect → Resolution Center
- **Lösung**: Behebe genannte Probleme
- **Lösung**: Reiche mit Erklärung erneut ein

**Problem**: Review dauert zu lange

- **Lösung**: Normal: 24-48 Stunden
- **Lösung**: Bei > 7 Tagen: Kontaktiere Apple Support
- **Lösung**: Prüfe, ob zusätzliche Informationen benötigt werden

---

## 📚 Weitere Ressourcen

- **EAS Build Docs**: [docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/)
- **EAS Submit Docs**: [docs.expo.dev/submit/introduction/](https://docs.expo.dev/submit/introduction/)
- **App Store Connect Help**: [help.apple.com/app-store-connect/](https://help.apple.com/app-store-connect/)
- **Apple App Store Review Guidelines**: [developer.apple.com/app-store/review/guidelines/](https://developer.apple.com/app-store/review/guidelines/)
- **Expo EAS CLI Reference**: [docs.expo.dev/eas/](https://docs.expo.dev/eas/)

---

## 💡 Tipps

1. **TestFlight nutzen**: Teste gründlich vor App Store Submission
2. **Screenshots früh erstellen**: Nicht erst kurz vor Submission
3. **Privacy Policy**: Muss vor Submission verfügbar sein
4. **Release Notes**: Schreibe klare, hilfreiche Release Notes
5. **Monitoring**: Richte Crash Reports und Analytics ein
6. **Updates planen**: Bereite Updates vor, bevor Probleme auftreten
7. **Windows-Nutzer**: Nutze EAS Build + EAS Submit - das ist der einfachste Weg!

---

## 🪟 Windows-spezifische FAQ

### Kann ich wirklich alles von Windows aus machen?

**Ja!** Mit EAS Build und EAS Submit kannst du:

- ✅ iOS-Builds in der Cloud erstellen
- ✅ Builds automatisch zu App Store Connect hochladen
- ✅ App Store Connect über Web-Interface verwalten
- ✅ TestFlight über Web-Interface einrichten
- ✅ App Review über Web-Interface einreichen

**Kein macOS, kein Xcode, kein Transporter nötig!**

### Was passiert, wenn `eas submit` nicht funktioniert?

1. Prüfe EAS CLI Version: `npx eas-cli --version`
2. Prüfe Apple Credentials: `npx eas-cli credentials`
3. Prüfe Build-Status: `npx eas-cli build:list`
4. Kontaktiere Expo Support: [forums.expo.dev](https://forums.expo.dev)
5. Alternative: Verwende einen macOS-Rechner für manuelles Upload (selten nötig)

### Brauche ich einen Mac für Screenshots?

**Nein!** Du kannst Screenshots auf verschiedenen Wegen erstellen:

- **iOS-Gerät**: Screenshots direkt auf iPhone/iPad machen
- **Online-Tools**: [appstorescreenshot.com](https://www.appstorescreenshot.com/)
- **Android Emulator**: Falls du Android Studio hast, kannst du iOS-Screenshots simulieren
- **Design-Tools**: Figma, Sketch, etc. (funktionieren auf Windows)

### Kann ich die App auf meinem iPhone testen, ohne Mac?

**Ja!** Du kannst:

- **Expo Go**: Für grundlegendes Testing (kostenlos, aus App Store)
- **TestFlight**: Nach dem ersten Build über EAS (Beta-Testing)
- **Development Build**: Über EAS Build (erfordert Apple Developer Account)

---

**Viel Erfolg mit deiner App Store Veröffentlichung! 🚀**
