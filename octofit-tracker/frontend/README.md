# Octofit Tracker Frontend

React 19 presentation tier for Octofit Tracker, built with Vite, React Router, and Bootstrap.

## Configure the API

Define `VITE_CODESPACE_NAME` in `octofit-tracker/frontend/.env.local` so the browser can reach the backend's forwarded port:

```env
VITE_CODESPACE_NAME=your-codespace-name
```

Restart the Vite dev server after changing the file. Collection requests use `https://${VITE_CODESPACE_NAME}-8000.app.github.dev/api/[component]/`. If the variable is unset or invalid, requests safely fall back to `http://localhost:8000/api/[component]/` for local development.

## Run

```bash
npm run dev
```

Production build and lint checks:

```bash
npm run build
npm run lint
```
