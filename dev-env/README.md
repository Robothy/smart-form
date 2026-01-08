Dev container for simple-form

This repository includes a development container that provides:

- Ubuntu 24.04 base
- Node.js LTS
- Python 3
- Git
- A small script to attempt installing "claude-code" tools (best-effort)

Build and run (from the `dev-env` folder):

```bash
docker compose up -d --build
docker compose exec dev bash
```

Inside the container:

- Node is available as `node` and `npm`.
- Python is available as `python3` and `pip3`.
- Git is available as `git`.
- The `@anthropic-ai/claude-code` npm package is installed globally at image build time when available.
