# Vercel Audio Asset Loading Fix

## Problem

Auf Vercel wurden Audio-Dateien (Background Music) nicht geladen. Das Problem trat nur auf Vercel auf, nicht bei lokaler Entwicklung.

## Ursachen

### 1. Vercel Rewrite-Konfiguration

Die `vercel.json` hatte ein Rewrite-Rule, das **alle** Requests auf `/index.html` umgeleitet hat:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Das bedeutete, dass auch statische Assets wie Audio-Dateien (`.mp3`), JavaScript-Dateien (`.js`), CSS-Dateien (`.css`), etc. auf `/index.html` umgeleitet wurden, anstatt direkt serviert zu werden.

**Beispiel:**
- Request: `GET /assets/assets/audio/background-music/breath-of-life_15-minutes-320860.b637e428723c830e7e33e8d911761ca9.mp3`
- Vercel leitete um zu: `/index.html`
- Ergebnis: Audio-Datei konnte nicht geladen werden

### 2. Asset-Objekt-Verarbeitung im WebAudioHandler

Im Web-Build gibt `require()` für Assets ein Objekt zurück, nicht direkt einen String-Pfad. Der `WebAudioHandler` auf `main` konnte diese Objekte nicht korrekt verarbeiten:

```typescript
// Vorher (fehlerhaft):
this.audioElement.src = source; // source ist ein Objekt, nicht ein String!
```

**Expo Web Build Asset-Formate:**
- `require()` kann zurückgeben:
  - String (direkter Pfad)
  - Objekt mit `uri` Property
  - Objekt mit `default` Property
  - Objekt mit `__packager_asset` Property (Expo Asset-Objekt)

## Lösung

### 1. Vercel Rewrite-Konfiguration anpassen

Die `vercel.json` wurde angepasst, um statische Assets von der Umleitung auszuschließen:

```json
{
  "rewrites": [
    {
      "source": "/((?!_expo|assets|favicon\\.ico|.*\\.(js|css|mp3|mp4|wav|ogg|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Erklärung:**
- Negative Lookahead `(?!...)` schließt bestimmte Pfade aus
- `_expo` - Expo-spezifische Dateien
- `assets` - Asset-Verzeichnis
- `favicon.ico` - Favicon
- `.*\\.(js|css|mp3|...)` - Alle Dateien mit diesen Endungen

**Ergebnis:**
- Statische Assets werden direkt serviert
- Nur HTML-Routes werden auf `/index.html` umgeleitet (für React Router)

### 2. WebAudioHandler Asset-Verarbeitung verbessern

Der `WebAudioHandler.loadAudio()` wurde erweitert, um verschiedene Asset-Formate korrekt zu verarbeiten:

```typescript
// Resolve the audio source for web
// require() in web builds may return a relative path or object
let audioSrc: string;
if (typeof source === 'string') {
  audioSrc = source;
} else if (source && typeof source === 'object' && source.uri) {
  audioSrc = source.uri;
} else if (source && typeof source === 'object' && source.default) {
  audioSrc = source.default;
} else if (source && typeof source === 'object' && source.__packager_asset) {
  // Expo asset object - construct path from asset
  const assetPath = source.__packager_asset.localUri || source.__packager_asset.uri;
  audioSrc = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
} else {
  // Try to convert to string (fallback)
  audioSrc = String(source);
}

// If it's a relative path, make it absolute
if (audioSrc && !audioSrc.startsWith('http') && !audioSrc.startsWith('/')) {
  audioSrc = `/${audioSrc}`;
}
```

**Unterstützte Formate:**
1. **String**: Direkter Pfad (`"/assets/audio/file.mp3"`)
2. **Objekt mit `uri`**: `{ uri: "/assets/audio/file.mp3" }`
3. **Objekt mit `default`**: `{ default: "/assets/audio/file.mp3" }`
4. **Expo Asset-Objekt**: `{ __packager_asset: { localUri: "...", uri: "..." } }`
5. **Fallback**: Konvertierung zu String

## Testing

### Lokal testen:
```bash
npm run build:web
npx serve dist
```

### Auf Vercel testen:
1. Änderungen committen und pushen
2. Vercel baut automatisch
3. In Browser Console prüfen:
   - `WebAudioHandler: Loading audio from: /assets/assets/audio/...`
   - Keine 404-Fehler für Audio-Dateien
   - Audio sollte abspielen

## Verwandte Dateien

- `vercel.json` - Vercel Deployment-Konfiguration
- `src/services/audio/WebAudioHandler.ts` - Web Audio Handler Implementierung
- `src/services/BackgroundMusicService.ts` - Verwendet `require()` für Audio-Assets

## Datum

Fix implementiert: 29. November 2025

## Commit

- `fix: improve audio source handling in WebAudioHandler for music loading`
- `fix: exclude static assets from Vercel rewrites`

