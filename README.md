# SwipeLoan AI Voice Assistant (Aanya)

Production Base URL: **`https://ai.swipeloan.in`**

Dedicated AI Voice Agent deployment for [SwipeLoan](https://swipeloan.in) powered by Gemini Live WebRTC / WebSocket.

## Endpoints & URLs

- **Integration Guide**: [`https://ai.swipeloan.in/guide`](https://ai.swipeloan.in/guide)
- **Embed Script (CDN)**: [`https://ai.swipeloan.in/embed.js`](https://ai.swipeloan.in/embed.js)
- **Embed Widget Page (iframe)**: [`https://ai.swipeloan.in/aanya/embed`](https://ai.swipeloan.in/aanya/embed)
- **Full Voice Assistant Web Page**: [`https://ai.swipeloan.in/talktoaanya`](https://ai.swipeloan.in/talktoaanya)

## Quick Embed on Any Website

Add this single tag right before the closing `</body>` tag on your website:

```html
<script src="https://ai.swipeloan.in/embed.js" async></script>
```

### Optional Configuration Attributes:

```html
<script 
  src="https://ai.swipeloan.in/embed.js" 
  data-position="bottom-right" 
  data-label="Talk to Aanya" 
  data-subtitle="AI Loan Assistant" 
  data-color="#10B981" 
  data-auto-open="false" 
  async
></script>
```

## Environment Configuration

Configure the base URL and API keys in `.env.local`:

```bash
NEXT_PUBLIC_BASE_URL=https://ai.swipeloan.in
NEXT_PUBLIC_APP_URL=https://ai.swipeloan.in
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or [`/guide`](http://localhost:3000/guide)) in your browser.
