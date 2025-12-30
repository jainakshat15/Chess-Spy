# Quick Deployment Reference

## 🚀 Quick Start

### Render (WebSocket Server)

1. **Create Web Service** on Render
2. **Settings:**
   - Build: `npm install`
   - Start: `npm run start:ws`
3. **Environment Variables:**
   ```
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
4. **Note the Render URL** (e.g., `https://chess-spy-websocket.onrender.com`)

### Vercel (Next.js App)

1. **Import Project** from GitHub
2. **Environment Variables:**
   ```
   NEXT_PUBLIC_WEBSOCKET_URL=https://your-render-service.onrender.com
   ```
3. **Deploy** - Vercel auto-detects Next.js
4. **Note the Vercel URL** (e.g., `https://chess-spy.vercel.app`)

### Post-Deployment

1. **Update Render `ALLOWED_ORIGINS`** with your Vercel URL
2. **Test** the connection

---

## 📋 Environment Variables

### Render

- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://your-app.vercel.app` (comma-separated, no spaces)

### Vercel

- `NEXT_PUBLIC_WEBSOCKET_URL=https://your-render-service.onrender.com`
- `NEXT_PUBLIC_MONITORING_URL=...` (optional)

---

## 🔧 Local Development

```bash
# Terminal 1: WebSocket Server
npm run dev:ws

# Terminal 2: Next.js App
npm run dev
```

Create `.env.local`:

```
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
```

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
