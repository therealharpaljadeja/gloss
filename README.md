<a href="https://usegloss.io">
  <img alt="Gloss" src="./public/og.png">
  <h1 align="center">Gloss</h1>
</a>

<p align="center">
  An open source AI reader for articles and PDFs. Select any line, ask a question, and get a cited answer in the margin. Powered by [Fortytwo](https://fortytwo.network).
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftherealharpaljadeja%2Fgloss&project-name=gloss&repository-name=gloss"><img src="https://vercel.com/button" alt="Deploy with Vercel"></a>
</p>

## Tech stack

- [DeepSeek V4.1 Flash](https://docs.fortytwo.network/docs/models) for the LLM
- [Fortytwo](https://docs.fortytwo.network) for LLM inference
- [Exa](https://exa.ai) for web search
- [LiteParse](https://github.com/run-llama/liteparse) for in-browser PDF parsing, with Nemotron 3.5 Super VL on Fortytwo for scanned pages
- No accounts and no server-side keys: readers paste their own keys, kept in their browser
- No analytics or telemetry: no tracking script, and `npm run` scripts turn off Next.js telemetry
- Next.js app router with Tailwind

## Cloning & running

1. Clone the repo: `git clone https://github.com/therealharpaljadeja/gloss`
2. Run `npm install`
3. Run `npm run dev`, open http://localhost:3100 and paste your keys from the key button:
   - **[Fortytwo API key](https://platform.fortytwo.network)** (required)
   - **[Exa API key](https://dashboard.exa.ai/api-keys)** (optional, for web search)
   - **[LlamaParse API key](https://cloud.llamaindex.ai/api-key)** (optional, for "Read it more carefully" on hard PDFs)

   Keys stay in the browser and go with each request; the server stores none. Your library, highlights and notes live in the browser too.

## Self-hosting

Gloss needs no environment variables, database or API keys on the server: readers paste their own keys, and their library lives in their browser. Any host that runs Node.js 20.9+ or Docker works.

**Vercel (free):** click **Deploy with Vercel** above. The Hobby plan is enough for personal use; functions may run up to 300 seconds, which long briefs and careful PDF reads need.

**Docker:**

```bash
docker build -t gloss .
docker run -p 3100:3100 gloss
```

**Node.js** (Railway, Render, Fly.io, a VPS):

```bash
npm ci
npm run build
npm start   # port 3100; or PORT=8080 node scripts/next.mjs start
```

Things to know when hosting:

- **Request time:** answers and careful PDF reads can take up to 5 minutes, and briefs a couple of minutes. Give your host or proxy at least a 300-second timeout.
- **Streaming:** answers stream as server-sent events. Behind nginx, keep `proxy_buffering off` (Gloss also sends `X-Accel-Buffering: no`).
- **Upload size:** "Read it more carefully" uploads the PDF to your server, up to 4.3 MB. Allow that body size in your proxy.
- **Your users' keys pass through your server** with each request. Gloss never stores or logs them; see [SECURITY.md](SECURITY.md).

| Variable | Required | What it does |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | No | Public origin for canonical and social card URLs. Set at build time (`docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.com`). Defaults to the Vercel production URL, or `http://localhost:3100`. |
| `PORT` | No | Port for `node scripts/next.mjs start` and the Docker image. Defaults to 3100. |

Next.js telemetry is off in every `npm run` script and in the Docker image.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Report security issues privately as described in [SECURITY.md](SECURITY.md).

## Future Tasks

- [ ] Ship it as a browser extension that opens the same margin on any page
- [ ] Let a gloss compare two passages you pick at once
