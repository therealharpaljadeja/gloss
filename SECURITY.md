# Security

## How Gloss handles API keys

- Readers paste their own keys (Fortytwo, and optionally Exa and LlamaParse). They are stored in the browser's `localStorage` and nowhere else.
- Each request that needs a key sends it to the Gloss server, which forwards it to the provider for that one request. The server does not store or log keys, and has no key of its own to fall back on.
- Whoever runs a Gloss server can, in principle, see the keys passing through it. Only paste your keys into an instance you trust, or run your own.
- Clearing keys from the key menu removes them from the browser.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private vulnerability reporting ("Report a vulnerability" under the repository's Security tab) with steps to reproduce. You should get a reply within a week.
