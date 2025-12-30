# Deployment Guide

This guide covers deploying the Chess Spy application with the WebSocket server on Render and the Next.js app on Vercel.

## Architecture Overview

- **WebSocket Server**: Deployed on Render (handles real-time game state)
- **Next.js App**: Deployed on Vercel (handles UI and static pages)

## Prerequisites

- GitHub account with your repository
- Render account (free tier available)
- Vercel account (free tier available)
- Node.js 18+ installed locally (for testing)

---

## Part 1: Deploy WebSocket Server to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up or log in with your GitHub account

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the `chess-spy` repository

### Step 3: Configure WebSocket Service
Use the following settings:

**Basic Settings:**
- **Name**: `chess-spy-websocket` (or any name you prefer)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (root of repo)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm run start:ws`

**Environment Variables:**
Add the following environment variables:

```
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-vercel-app.vercel.app
```

**Important Notes:**
- Replace `your-vercel-app.vercel.app` with your actual Vercel deployment URL
- You can add multiple origins separated by commas (no spaces)
- After Vercel deployment, you'll need to update this with the actual Vercel URL
- For local development, you can add `http://localhost:3000` temporarily

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, note the **service URL** (e.g., `https://chess-spy-websocket.onrender.com`)

### Step 5: Update CORS Settings
After deployment, update the `ALLOWED_ORIGINS` environment variable in Render with your actual Vercel URL.

---

## Part 2: Deploy Next.js App to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with your GitHub account

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository (`chess-spy`)
3. Vercel will auto-detect Next.js

### Step 3: Configure Project Settings
Use the following settings:

**Framework Preset:**
- **Framework Preset**: Next.js (auto-detected)

**Build Settings:**
- **Root Directory**: Leave empty (or `./` if needed)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**Environment Variables:**
Add the following environment variables:

```
NEXT_PUBLIC_WEBSOCKET_URL=https://your-render-service.onrender.com
NEXT_PUBLIC_MONITORING_URL=your-monitoring-endpoint-url (optional)
```

**Important Notes:**
- Replace `your-render-service.onrender.com` with your actual Render WebSocket service URL
- The `NEXT_PUBLIC_` prefix makes the variable available in the browser
- `NEXT_PUBLIC_MONITORING_URL` is optional (only needed if you have a monitoring endpoint)

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-3 minutes)
3. Once deployed, note your **Vercel deployment URL** (e.g., `https://chess-spy.vercel.app`)

### Step 5: Update Render CORS
1. Go back to Render dashboard
2. Navigate to your WebSocket service
3. Go to **Environment** tab
4. Update `ALLOWED_ORIGINS` to include your Vercel URL:
   ```
   https://chess-spy.vercel.app,https://chess-spy-git-main.vercel.app
   ```
   (Include both the main domain and preview deployment URLs if needed)
5. Click **"Save Changes"** - the service will automatically redeploy

---

## Environment Variables Summary

### Render (WebSocket Server)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | Auto | Port assigned by Render | (auto-set) |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of allowed origins | `https://chess-spy.vercel.app,https://localhost:3000` |

### Vercel (Next.js App)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_WEBSOCKET_URL` | Yes | Render WebSocket server URL | `https://chess-spy-websocket.onrender.com` |
| `NEXT_PUBLIC_MONITORING_URL` | No | Optional monitoring endpoint | `https://your-api.com/capture` |

---

## Testing the Deployment

1. **Test WebSocket Server:**
   - Visit your Render service URL in browser
   - You should see a connection error (expected - it's a WebSocket server, not HTTP)
   - Check Render logs to ensure server started successfully

2. **Test Next.js App:**
   - Visit your Vercel deployment URL
   - Open browser console (F12)
   - Create/join a room
   - Check console for WebSocket connection messages
   - Verify you can make moves and see opponent moves

---

## Troubleshooting

### WebSocket Connection Issues

**Problem**: "WebSocket connection failed"
- **Solution**: 
  - Verify `NEXT_PUBLIC_WEBSOCKET_URL` in Vercel matches your Render service URL
  - Check that `ALLOWED_ORIGINS` in Render includes your Vercel URL
  - Ensure both services are deployed and running

### CORS Errors

**Problem**: "CORS policy blocked"
- **Solution**: 
  - Update `ALLOWED_ORIGINS` in Render to include exact Vercel URL
  - Include both `https://your-app.vercel.app` and `https://your-app-git-main.vercel.app`
  - Restart Render service after updating environment variables

### Build Failures

**Problem**: Build fails on Vercel
- **Solution**: 
  - Check build logs in Vercel dashboard
  - Ensure `package.json` has all required dependencies
  - Verify Node.js version compatibility (18+)

**Problem**: Build fails on Render
- **Solution**: 
  - Check that `start:ws` script exists in `package.json`
  - Verify `websocket-server.js` file exists
  - Check Render build logs for specific errors

### Service Not Starting

**Problem**: Render service shows "Unhealthy"
- **Solution**: 
  - Check Render logs for errors
  - Verify `PORT` environment variable is set (auto-set by Render)
  - Ensure `websocket-server.js` listens on the correct port

---

## Local Development

For local development with separate services:

1. **Terminal 1 - WebSocket Server:**
   ```bash
   npm run dev:ws
   ```
   Runs on `http://localhost:3001`

2. **Terminal 2 - Next.js App:**
   ```bash
   npm run dev
   ```
   Runs on `http://localhost:3000`

3. **Set Environment Variables:**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
   NEXT_PUBLIC_MONITORING_URL=your-monitoring-url (optional)
   ```

Or use the combined command:
```bash
npm run dev:all
```
(Requires `concurrently` package - install with `npm install --save-dev concurrently`)

---

## Updating Deployments

### After Code Changes

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Automatic Deployment:**
   - Vercel automatically deploys on push to main branch
   - Render automatically deploys on push to main branch
   - Both services will rebuild and redeploy

3. **Manual Redeploy:**
   - **Vercel**: Dashboard → Project → Deployments → Redeploy
   - **Render**: Dashboard → Service → Manual Deploy

### After Environment Variable Changes

1. **Update in Dashboard:**
   - Vercel: Project Settings → Environment Variables
   - Render: Service → Environment tab

2. **Redeploy:**
   - Vercel: Automatically redeploys
   - Render: Automatically redeploys (or click "Save Changes")

---

## Cost Considerations

### Free Tier Limits

**Render:**
- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- Consider upgrading to paid tier for always-on service

**Vercel:**
- Free tier includes unlimited deployments
- Generous bandwidth limits
- No spin-down issues

### Optimization Tips

1. **Keep Render Service Active:**
   - Use a monitoring service to ping your Render service every 10 minutes
   - Or upgrade to paid tier for always-on service

2. **Reduce Cold Starts:**
   - Consider using Render's paid tier for production
   - Or implement a health check endpoint that pings the service

---

## Security Notes

1. **CORS Configuration:**
   - Only allow specific origins in `ALLOWED_ORIGINS`
   - Don't use `*` in production
   - Include both production and preview URLs

2. **Environment Variables:**
   - Never commit `.env.local` files
   - Use Vercel/Render dashboards for production secrets
   - Rotate secrets regularly

3. **HTTPS:**
   - Both Render and Vercel provide HTTPS by default
   - Ensure WebSocket connections use `wss://` (secure WebSocket)

---

## Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Socket.IO Docs**: [socket.io/docs](https://socket.io/docs)

---

## Quick Reference Checklist

### Render Deployment
- [ ] Created Render account
- [ ] Created Web Service
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm run start:ws`
- [ ] Added `NODE_ENV=production`
- [ ] Added `ALLOWED_ORIGINS` (update after Vercel deployment)
- [ ] Noted Render service URL

### Vercel Deployment
- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Added `NEXT_PUBLIC_WEBSOCKET_URL` (Render URL)
- [ ] Added `NEXT_PUBLIC_MONITORING_URL` (optional)
- [ ] Deployed successfully
- [ ] Noted Vercel deployment URL

### Post-Deployment
- [ ] Updated Render `ALLOWED_ORIGINS` with Vercel URL
- [ ] Tested WebSocket connection
- [ ] Tested game functionality
- [ ] Verified both services are running

