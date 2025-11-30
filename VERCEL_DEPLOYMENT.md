# Vercel Deployment Guide for Hypnotify

This guide will help you deploy your React Native Web app to Vercel for free.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)
3. **Environment Variables**: You'll need your Supabase credentials

## Environment Variables Required

You'll need to set these in Vercel's dashboard:

### Required Variables:

- `EXPO_PUBLIC_SUPABASE_FUNCTION_URL`: Your Supabase Edge Function URL
- `EXPO_PUBLIC_SUPABASE_API_KEY`: Your Supabase API key

### How to Get These Values:

1. **Supabase Function URL**:
   - Go to your Supabase project dashboard
   - Navigate to Edge Functions
   - Copy the URL for your `tts-synthesize` function
   - Format: `https://your-project.supabase.co/functions/v1/tts-synthesize`

2. **Supabase API Key**:
   - Go to Settings > API in your Supabase dashboard
   - Copy the "anon public" key

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Framework Preset: `Other`
   - Build Command: `npm run build:web`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - In Vercel dashboard, go to your project
   - Navigate to Settings > Environment Variables
   - Add the required variables listed above

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Build the Web Version**:

   ```bash
   npm run build:web
   ```

3. **Deploy**:

   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add EXPO_PUBLIC_SUPABASE_FUNCTION_URL
   vercel env add EXPO_PUBLIC_SUPABASE_API_KEY
   ```

## Post-Deployment

### Custom Domain (Optional)

- In Vercel dashboard, go to Settings > Domains
- Add your custom domain
- Update DNS records as instructed

### Monitoring

- Check Vercel dashboard for deployment status
- Monitor function logs for any issues
- Test the stereo meditation feature

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Ensure build command is correct
   - Check Vercel build logs

2. **Environment Variables Not Working**:
   - Verify variable names match exactly
   - Check that variables are set for "Production" environment
   - Redeploy after adding variables

3. **Audio Not Working**:
   - Check browser console for errors
   - Verify Supabase Edge Function is deployed
   - Test TTS API key is valid

4. **CORS Issues**:
   - Ensure Supabase Edge Function has proper CORS headers
   - Check that your domain is allowed in Supabase settings

### File Size Limits:

- Vercel free tier: 100MB total
- Your audio files should be optimized
- Consider using CDN for large assets

## Cost Considerations

**Vercel Free Tier Includes**:

- 100GB bandwidth per month
- 100 serverless function executions per day
- Unlimited static deployments
- Custom domains

**Potential Costs**:

- Google TTS API usage (pay-per-character)
- Supabase usage (free tier available)
- Custom domain (if not using Vercel's free subdomain)

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Consider rate limiting for production use
- Monitor API usage to avoid unexpected charges

## Next Steps

1. Deploy to Vercel
2. Test all features thoroughly
3. Set up monitoring and alerts
4. Consider implementing analytics
5. Plan for scaling if needed

Your app should now be live at `https://your-project.vercel.app`!
