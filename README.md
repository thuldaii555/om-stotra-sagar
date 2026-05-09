# Om Stotra Sagar

![Built with React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Deployed on Netlify](https://img.shields.io/badge/Netlify-deployed-brightgreen)

Om Stotra Sagar is an English-first, local-first Hindu devotional reading website for stotras, deity profiles, pooja guidance, stories, Panchang learning, and personal favorites.

It works as a static browser app by default. Firebase, login, and a required backend are not used.

## Run Locally

1. Install dependencies: `npm install`
2. Start the app: `npm run dev`
3. Open `http://localhost:3000`

## Local-First Mode

Editable content is stored in browser `localStorage`.

- The bundled starter library lives in `src/data/`.
- Local edits stay in the same browser.
- Export/import JSON is the portable backup path.
- Reset Defaults restores bundled content and clears local favorites/history.
- If optional backend functions are unavailable, the app falls back to local/default content.

Content loading priority:

1. localStorage user/admin edited content, if present
2. remote GitHub content from the optional Netlify Function, only when no local browser bundle exists
3. default bundled content

Remote content is not written over existing browser content automatically.

## Admin Passcode

Admin uses a simple v1 passcode gate.

- Set `VITE_ADMIN_PASSCODE=` for local/static Admin access.
- Admin unlock state is stored in `sessionStorage`, not `localStorage`.
- If `VITE_ADMIN_PASSCODE` is missing, Admin shows: “Admin passcode is not configured.”

This is not production authentication. Real auth can be added later.

## Export / Import

In Admin, open **Backup & Publish**.

- **Export Content** copies the current normalized content bundle into the JSON box.
- **Import Content** restores JSON from the box.
- **Reset Defaults** restores bundled content.
- Export important edits before clearing browser data.

## Optional GitHub Backend With Netlify Functions

The app includes optional Netlify Functions:

- `netlify/functions/get-content.cjs`
- `netlify/functions/save-content.cjs`

These functions read and write a JSON content file in GitHub:

`data/om-stotra-content.json`

Frontend code never receives the GitHub token. Publishing must go through the server-side Netlify Function.

Required Netlify environment variables:

```env
ADMIN_PASSWORD=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
GITHUB_CONTENT_PATH=data/om-stotra-content.json
```

Local/static admin passcode:

```env
VITE_ADMIN_PASSCODE=
```

Never expose `GITHUB_TOKEN` in frontend code. Set it only in Netlify environment variables or a local Netlify dev environment.

## Backend Behavior

- On app load, the frontend tries `/.netlify/functions/get-content`.
- If that endpoint is unavailable, unconfigured, or returns no content, localStorage/default content is used.
- If localStorage content already exists, it remains active and remote content is ignored until the user imports or publishes intentionally.
- In Admin, **Publish to GitHub** calls `/.netlify/functions/save-content`.
- If backend env vars are missing or functions are unavailable, publishing shows `Backend not configured` and local editing still works.

Normal Vite development does not require Netlify CLI:

```bash
npm run dev
```

To test functions locally later, install/use Netlify CLI, create a local `.env` with server-only variables, and run Netlify dev from the project root:

```bash
netlify dev
```

See `docs/NETLIFY_DEPLOYMENT.md` for account migration and deployment details.

## Content Notes

The site includes devotional texts, excerpts, meanings, pooja guides, stories, and Panchang education. Source notes are included on major content items. Traditional texts and regional variants should still be verified against preferred trusted editions before public release.
