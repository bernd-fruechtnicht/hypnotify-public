# 🎧 Stereo Meditation Setup Guide

## Prerequisites

Before the stereo meditation feature can work with cloud TTS, you need to set up the following:

### 1. Supabase Project Setup

1. **Go to Supabase Console**: https://supabase.com/dashboard
2. **Create a new project** or select an existing one
3. **Enable the following features**:
   - **Edge Functions**: For TTS processing
   - **Database**: For storing session data
4. **Set up authentication** (optional for now):
   - Go to "Authentication" > "Settings"
   - Configure desired authentication providers

### 2. Supabase Edge Functions Setup

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy the TTS function**:
   ```bash
   supabase functions deploy tts-synthesize
   ```

5. **Get your function URL**:
   - Go to Supabase Dashboard > Edge Functions
   - Copy the URL for `tts-synthesize` function

### 3. Environment Configuration

Create or update your `app.config.js`:

```javascript
export default {
  expo: {
    // ... your existing config
    extra: {
      supabaseFunctionUrl: process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL,
      supabaseApiKey: process.env.EXPO_PUBLIC_SUPABASE_API_KEY,
    },
  },
};
```

### 4. Environment Variables

Create a `.env` file in your project root:

```bash
# Supabase Edge Function URL (get from Supabase Dashboard)
EXPO_PUBLIC_SUPABASE_FUNCTION_URL=https://your-project-ref.supabase.co/functions/v1/tts-synthesize

# Supabase API Key (get from Supabase Dashboard > Settings > API)
EXPO_PUBLIC_SUPABASE_API_KEY=your_supabase_anon_key_here
```

### 5. ⚠️ Security Considerations

**IMPORTANT:** Supabase Edge Functions provide secure server-side processing:

- **Server-side processing** - TTS and FFmpeg run on Supabase's servers
- **No client-side API keys** - Google Cloud TTS API key stays on the server
- **Rate limiting** - Supabase automatically handles rate limiting
- **Authentication** - Can add Supabase Auth for user-specific access

**Recommended security measures:**

1. **Rate Limiting** - Limit requests per IP/user
2. **Authentication** - Require user login for TTS requests  
3. **Usage Quotas** - Limit requests per user per day
4. **Monitoring** - Track API usage and costs
5. **API Key Authentication** - Add custom API key for TTS requests

**Example secure Edge Function:**
```typescript
// In supabase/functions/tts-synthesize/index.ts
export default async function handler(req: Request) {
  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for');
  if (isRateLimited(clientIP)) {
    return new Response('Rate limited', { status: 429 });
  }
  
  // Authentication check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Your TTS logic here
}
```

### 6. 🔮 Future Enhancement: OAuth Authentication

**For production use, consider implementing OAuth authentication:**

- **Short-lived tokens** (1 hour) instead of public anon key
- **User-specific quotas** and usage tracking
- **Automatic token refresh** for seamless experience
- **Enterprise-grade security** with proper user identification

**OAuth Flow:**
```
User → OAuth Provider → Your App → Supabase Edge Function → Google TTS
  ↓           ↓            ↓              ↓                    ↓
Login    Short-lived    Store token   Validate token      Generate audio
```

**Implementation reminder:**
- Set up OAuth provider (Google, GitHub, etc.)
- Implement token validation in Edge Function
- Add client-side OAuth flow
- Replace public anon key with Bearer token authentication

## Audio Storage Strategy

**Current Implementation:** Server-side audio generation with Supabase caching:

- ✅ **Server-side TTS generation** - All audio is generated on Supabase Edge Functions
- ✅ **Supabase storage caching** - Generated audio is cached in Supabase storage
- ✅ **Dynamic audio generation** - Real-time TTS synthesis with stereo panning
- ✅ **Efficient caching** - Audio files are stored and reused for identical requests
- ✅ **Scalable architecture** - Server-side processing handles all audio generation

## Audio Generation Flow

The stereo meditation feature:
1. **Generates audio server-side** using Supabase Edge Functions
2. **Caches audio in Supabase storage** for efficient reuse
3. **Streams audio to client** for immediate playback
4. **Handles errors gracefully** with proper fallback mechanisms
5. **Optimizes storage** by reusing cached audio for identical content

## Cost Considerations

- **Google Cloud TTS**: ~$4 per 1M characters
- **Supabase Edge Functions**: Free tier available
- **Supabase Storage**: Efficient caching reduces repeated TTS costs

## Current Status

✅ **Server-side TTS and audio conversion is already tested and working!**

The stereo meditation system is fully functional with:
- ✅ **Server-side TTS generation** - Tested and working
- ✅ **Audio conversion with FFmpeg** - Tested and working  
- ✅ **Stereo panning** - Tested and working
- ✅ **Supabase Edge Functions** - Ready for deployment

## Next Steps

1. **Deploy Supabase Edge Functions** for production use
2. **Configure Supabase storage** for audio caching
3. **Set up environment variables** for API keys

The stereo meditation uses server-side audio generation with Supabase caching! 🎧✨

## Future Enhancement: Local Audio Storage

**Planned for future versions:**
- **Local device storage** for offline audio playback
- **Hybrid approach** - Server generation + local caching
- **Offline-first architecture** - Download and store audio locally
- **Smart sync** - Sync between server and local storage