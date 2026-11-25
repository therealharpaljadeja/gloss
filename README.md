<a href="https://usegloss.io">
  <img alt="Gloss" src="./public/og.png">
  <h1 align="center">Gloss</h1>
</a>

<p align="center">
  An open source AI reader for articles and PDFs. Select any line, ask a question, and get a cited answer in the margin. Powered by [Fortytwo](https://fortytwo.network).
</p>

## Tech stack

- [DeepSeek V4.1 Flash](https://docs.fortytwo.network/docs/models) for the LLM
- [Fortytwo](https://docs.fortytwo.network) for LLM inference
- [Exa](https://exa.ai) for web search
- [LiteParse](https://github.com/run-llama/liteparse) for in-browser PDF parsing, with Nemotron 3.5 Super VL on Fortytwo for scanned pages
- No accounts and no server-side keys: readers paste their own keys, kept in their browser
- Next.js app router with Tailwind

## Cloning & running

1. Clone the repo: `git clone https://github.com/Nutlope/gloss`
2. Run `npm install`
3. Run `npm run dev`, open http://localhost:3100 and paste your keys from the key button:
   - **[Fortytwo API key](https://platform.fortytwo.network)** (required)
   - **[Exa API key](https://dashboard.exa.ai/api-keys)** (optional, for web search)
   - **[LlamaParse API key](https://cloud.llamaindex.ai/api-key)** (optional, for "Read it more carefully" on hard PDFs)

   Keys stay in the browser and go with each request; the server stores none. Your library, highlights and notes live in the browser too.

## Future Tasks

- [ ] Ship it as a browser extension that opens the same margin on any page
- [ ] Let a gloss compare two passages you pick at once
