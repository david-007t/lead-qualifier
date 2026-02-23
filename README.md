# Lead Qualifier — Ascend Solutions

AI-powered lead qualification and discovery tool for service businesses. Find real opportunities via web search, score them against your criteria, and manage your pipeline.

## Quick Deploy with Vercel

### Prerequisites
- Node.js 18+
- GitHub account
- Vercel account (free tier works)
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit — Lead Qualifier MVP"
gh repo create lead-qualifier --private --source=. --push
```

2. **Deploy to Vercel**
```bash
npx vercel --prod
```
Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new).

3. **Set environment variable**
In Vercel dashboard → Settings → Environment Variables:
```
ANTHROPIC_API_KEY = sk-ant-xxxxx
```

4. **Redeploy** after setting the env var and you're live.

## Local Development

```bash
npm install
cp .env.example .env.local  # Add your API key
npm run dev
```

Note: The AI Lead Finder won't work locally without a separate API server since Vite's dev proxy needs a backend. For local testing of the finder, use `vercel dev` instead of `npm run dev`.

## Architecture

- **Frontend**: React + Vite (single component, no router needed)
- **API Proxy**: `/api/anthropic.js` — Vercel serverless function that forwards requests to Anthropic with your API key server-side (keeps key secret)
- **Storage**: localStorage (per-browser, per-user)
- **Charts**: Recharts

## Features
- 8 industry presets (construction, gov contracting, marketing, IT, real estate, landscaping, cleaning, events)
- AI-powered lead discovery via web search
- Customizable qualification criteria
- Inline editing, CSV import/export
- Follow-up status tracking
- Analytics dashboard
- Dark/light theme
- Mobile responsive
