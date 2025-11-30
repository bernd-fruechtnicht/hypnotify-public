# 🧪 Test-Strategie für Hypnotify

## Philosophie: Top-Down Ansatz

**Warum Top-Down statt Bottom-Up?**

Während der Prototyp-Entwicklung stand UX und schnelle Iteration im Vordergrund. Manuelle Tests auf verschiedenen Plattformen (iOS, Android, Web) waren essenziell, um plattformspezifische Unterschiede zu identifizieren.

**Jetzt:** Fokus auf **E2E Tests für kritische User-Flows** zuerst, dann schrittweise nach unten (Integration → Unit Tests).

### Test-Pyramide (Top-Down):

```
                    ╱╲
                   ╱  ╲
                  ╱    ╲
                 ╱      ╲
                ╱  E2E   ╲  ← Phase 1: Kritische User-Flows
               ╱  Tests   ╲     Maestro / Detox
              ╱ (Priorität:╲    (Priorität: Hoch)
             ╱    Hoch)     ╲
            ╱─────────────── ╲
           ╱                  ╲
          ╱    Integration     ╲  ← Phase 2: Service-Interaktionen
         ╱       Tests          ╲     Jest + RN Testing Library
        ╱  (Priorität: Mittel)   ╲
       ╱───────────────────────── ╲
      ╱                            ╲
     ╱         Unit Tests           ╲  ← Phase 3: Utils & Services
    ╱      (Priorität: Niedrig)      ╲     Jest
   ╱───────────────────────────────── ╲
  ╱                                    ╲
 ╱                                      ╲
╱─────────────────────────────────────── ╲
```

### Vorteile Top-Down:

- ✅ Testet das, was der User wirklich erlebt
- ✅ Deckt plattformspezifische Probleme ab
- ✅ Schneller ROI für kritische Flows
- ✅ Weniger Wartungsaufwand bei Refactorings
- ✅ Dokumentiert erwartetes User-Verhalten

---

## Phase 1: E2E Tests (Priorität: Hoch) 🎯

### Ziel: Kritische User-Flows absichern

#### Test-Frameworks für React Native E2E:

##### **1. Maestro (Empfohlen für Start)**

- ✅ **Einfach zu erlernen** - YAML-basierte Syntax
- ✅ **Plattform-agnostisch** - iOS, Android, Web
- ✅ **Schnell aufzusetzen** - Keine komplexe Konfiguration
- ✅ **Gut für Prototypen** - Schnelle Test-Erstellung
- ✅ **Kostenlos** und Open Source
- ⚠️ Relativ neu (aber aktiv entwickelt)

**Dokumentation**: https://maestro.mobile.dev  
**GitHub**: https://github.com/mobile-dev-inc/maestro

**Beispiel Maestro Test:**

```yaml
appId: de.hypnohh.hypnotify
---
- launchApp
- tapOn: 'Start Meditation'
- assertVisible: 'Meditation Session'
- tapOn: 'Play'
- assertVisible: 'Playing'
```

##### **2. Detox (Alternativ)**

- ✅ **Etabliert** - Von Wix entwickelt, weit verbreitet
- ✅ **Schnell** - Native Test-Runner
- ✅ **Stabil** - Gut für CI/CD
- ⚠️ **Komplexer Setup** - Erfordert native Konfiguration
- ⚠️ **Nur iOS/Android** - Kein Web-Support

**Dokumentation**: https://wix.github.io/Detox  
**GitHub**: https://github.com/wix/Detox

**Beispiel Detox Test:**

```javascript
describe('Meditation Flow', () => {
  it('should start meditation session', async () => {
    await element(by.id('start-button')).tap();
    await expect(element(by.id('session-screen'))).toBeVisible();
  });
});
```

### Kritische User-Flows für E2E Tests:

#### 1. **Onboarding Flow** (Priorität: Hoch)

- [ ] App-Start und Onboarding durchlaufen
- [ ] Sprache auswählen
- [ ] Background Music Setup
- [ ] Onboarding abschließen

#### 2. **Meditation Session Flow** (Priorität: Hoch)

- [ ] Session aus Bibliothek auswählen
- [ ] Session starten
- [ ] TTS-Playback funktioniert
- [ ] Pause/Resume
- [ ] Session beenden

#### 3. **Stereo Meditation Flow** (Priorität: Hoch)

- [ ] Stereo Session erstellen/bearbeiten
- [ ] Links/Rechts Statements zuweisen
- [ ] Stereo Playback starten
- [ ] Beide Kanäle spielen gleichzeitig
- [ ] Session beenden

#### 4. **Settings & Configuration** (Priorität: Mittel)

- [ ] Sprache wechseln
- [ ] Voice auswählen
- [ ] Background Music ein/ausschalten
- [ ] Settings speichern und persistieren

#### 5. **Platform-Spezifische Tests** (Priorität: Hoch)

- [ ] **iOS**: TTS funktioniert, Audio-Playback
- [ ] **Android**: TTS funktioniert, Audio-Playback, Volume-Handling
- [ ] **Web**: TTS funktioniert (Web Speech API), Audio-Playback
- [ ] **Cross-Platform**: Settings synchronisieren sich

---

## Phase 2: Integration Tests (Priorität: Mittel) 🔗

### Ziel: Service-Interaktionen testen

#### Test-Framework: Jest + React Native Testing Library

#### Wichtige Integration Points:

1. **TTS Service Integration**
   - [ ] WebTTS → NativeTTS Fallback
   - [ ] CloudTTS Integration
   - [ ] Voice Selection pro Sprache

2. **Audio Service Integration**
   - [ ] Background Music + TTS gleichzeitig
   - [ ] Volume-Handling
   - [ ] Audio-Cleanup bei Navigation

3. **Storage Service Integration**
   - [ ] Settings persistieren
   - [ ] Sessions speichern/laden
   - [ ] Statements speichern/laden

4. **Cloud TTS Integration**
   - [ ] API-Calls funktionieren
   - [ ] Error-Handling
   - [ ] Caching-Verhalten

---

## Phase 3: Unit Tests (Priorität: Niedrig) 🔧

### Ziel: Einzelne Funktionen/Utils testen

#### Test-Framework: Jest

#### Priorisierte Unit Tests:

1. **Utils**
   - [ ] `voiceUtils.ts` - Voice-Filtering
   - [ ] `stereoPanning.ts` - Panning-Berechnungen
   - [ ] `logger.ts` - Logging-Verhalten

2. **Services (wichtigste Methoden)**
   - [ ] `StorageService` - CRUD-Operationen
   - [ ] `TTSService` - Voice-Selection
   - [ ] `AudioService` - Volume-Handling

3. **Type Validation**
   - [ ] Zod-Schemas für Settings
   - [ ] Session-Validation
   - [ ] Statement-Validation

---

## Nächste Schritte

### Kurzfristig (wenn bereit):

1. Maestro installieren und konfigurieren
2. Ersten E2E Test für "Onboarding Flow" schreiben
3. Ersten E2E Test für "Meditation Session Flow" schreiben

### Mittelfristig:

1. Weitere kritische User-Flows testen
2. Platform-spezifische Tests hinzufügen
3. Integration Tests für Services

### Langfristig:

1. Unit Tests für Utils
2. Unit Tests für Services
3. Coverage-Reporting einrichten

---

## Notizen

- **Manuelle Tests bleiben wichtig** - Besonders für UX und plattformspezifische Unterschiede
- **E2E Tests ergänzen, nicht ersetzen** - Manuelle Tests für Edge Cases
- **Schrittweise Einführung** - Nicht alles auf einmal, sondern priorisiert
- **ROI-Fokus** - Tests für kritische Flows zuerst, dann erweitern
