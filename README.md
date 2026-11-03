# VeriFact

An AI-assisted fact-checking app. Paste a claim and it returns a structured
analysis — verdict, confidence, emotional language, source credibility, factual
consistency and propaganda techniques.

The interface is a single HTML file; a small Node/Express proxy sits in front of
the Anthropic API so the key is never exposed to the browser.

## Why the proxy exists

Calling the Anthropic API directly from the browser would ship your secret key to
every visitor. `server.js` takes a POST from the client, forwards it to
`api.anthropic.com/v1/messages` with the key read from the environment, and
returns the response.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The interface (self-contained, no build step) |
| `server.js` | Express server: serves the page and proxies `POST /analyze` |
| `package.json` | Dependencies (`express`, `cors`) |
| `.env.example` | Template for the API key |

## Running

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
# then edit .env and paste your key
npm start
```

Open **http://localhost:3001**. The page is served by the same server that
proxies the request, so there is no URL to configure.

Check that the key was picked up:

```bash
curl http://localhost:3001/health
# {"status":"ok","keyConfigured":true}
```

If you open `index.html` directly from disk instead, it falls back to
`http://localhost:3001` automatically.

## Security note

The key is read from the environment only — never hard-coded, never committed.
`.env` is gitignored.
