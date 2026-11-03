# VeriFact

An AI-assisted fact-checking app. The interface is a single-page HTML client, and
a small Node/Express proxy sits in front of the Anthropic API so the API key is
never exposed to the browser.

## Why the proxy exists

Calling the Anthropic API directly from the browser would ship your secret key
to every visitor. `server.js` takes a POST from the client, forwards it to
`api.anthropic.com/v1/messages` with the key read from the environment, and
returns the response unchanged.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The client interface |
| `server.js` | Express proxy exposing `POST /analyze` |
| `package.json` | Dependencies (`express`, `cors`) |

## Running

```bash
npm install
export ANTHROPIC_API_KEY=your_key_here     # Windows: set ANTHROPIC_API_KEY=your_key_here
npm start
```

The proxy listens on `http://localhost:3001`. Open `index.html` and point it at
that origin. If the key is missing, the proxy responds with
`API key not configured` rather than failing silently.

## Security note

The key is read from the environment only — it is never hard-coded or committed.
