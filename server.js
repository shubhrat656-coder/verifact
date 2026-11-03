const express = require("express");
const cors = require("cors");
const https = require("https");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve the client from the same origin as the proxy, so `npm start` is the
// only command needed and the browser never calls a hard-coded host.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Simple readiness probe - tells you whether the API key is configured
// without exposing the key itself.
app.get("/health", (req, res) => {
  res.json({ status: "ok", keyConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.post("/analyze", (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "API key not configured. Set ANTHROPIC_API_KEY before starting the server.",
    });
  }

  const body = JSON.stringify(req.body);

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = "";
    proxyRes.on("data", (chunk) => (data += chunk));
    proxyRes.on("end", () => {
      try {
        res.status(proxyRes.statusCode).json(JSON.parse(data));
      } catch (e) {
        // Upstream sometimes returns HTML (rate limit, outage). Don't crash the
        // request with an unhandled parse error.
        res.status(502).json({
          error: "Upstream returned a non-JSON response",
          status: proxyRes.statusCode,
        });
      }
    });
  });

  proxyReq.on("error", (e) => {
    res.status(502).json({ error: e.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`VeriFact running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("WARNING: ANTHROPIC_API_KEY is not set - /analyze will return an error.");
  }
});
