# Netlify Deployment

Om Stotra Sagar is local-first and GitHub-backed. Netlify should deploy the built site, serve optional Functions, and store runtime secrets.

## Connect GitHub to Netlify

1. Push the project to GitHub.
2. In Netlify, create a new site from the GitHub repository.
3. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Deploy from the GitHub branch you want Netlify to track, usually `main`.

The same settings are also stored in `netlify.toml`.

## Environment Variables

Frontend build variable:

```env
VITE_ADMIN_PASSCODE=
```

Server-only Netlify Function variables:

```env
ADMIN_PASSWORD=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
GITHUB_CONTENT_PATH=data/om-stotra-content.json
PANCHANG_API_PROVIDER=generic
PANCHANG_API_KEY=
PANCHANG_API_BASE_URL=
```

`VITE_ADMIN_PASSCODE` is only a simple UI gate. It is bundled into frontend code and is not real security.

`ADMIN_PASSWORD` and `GITHUB_TOKEN` must stay server-only. Add them in Netlify environment variables or a local `netlify dev` environment. Never commit real secrets.

`PANCHANG_API_PROVIDER`, `PANCHANG_API_KEY`, and `PANCHANG_API_BASE_URL` must also stay server-only. The frontend never reads them. Panchang should remain in a clean unavailable state until a real provider URL and key are configured.

## Optional GitHub Backend

The static site works without Netlify Functions or backend variables. In that mode:

- bundled content loads,
- browser `localStorage` edits work,
- Admin passcode works when `VITE_ADMIN_PASSCODE` is set,
- export/import works,
- Publish to GitHub shows a backend-not-configured message.

When the backend is configured, `get-content.cjs` can read `GITHUB_CONTENT_PATH` from GitHub and `save-content.cjs` can create or update that JSON file using the GitHub Contents API.

## Local Backend Testing

Normal local development does not require Netlify CLI:

```bash
npm run dev
```

To test GitHub-backed publishing locally:

1. Install Netlify CLI if needed: `npm install -g netlify-cli`
2. Create a local `.env` with the server-only variables above.
3. Run `netlify dev` from the project root.
4. Open Admin > Backup & Publish and use Publish to GitHub.

Do not commit `.env`.

## Panchang Function Testing

Panchang uses the optional Netlify Function endpoint `/.netlify/functions/get-panchang`.

- Query params: `date`, `lat`, `lng`, `timezone`, `language`
- Server env vars: `PANCHANG_API_PROVIDER`, `PANCHANG_API_KEY`, `PANCHANG_API_BASE_URL`

Normal `npm run dev` will usually return 404 for that endpoint because Vite does not serve Netlify Functions. The frontend handles that gracefully and shows local date/time plus a not-configured message.

To test Panchang locally:

1. Set the Panchang env vars in Netlify or local `netlify dev`.
2. Run `netlify dev`.
3. Open Panchang in the app.
4. Enter location coordinates or use browser geolocation.
5. Confirm the returned values render in the result grid.

## Moving to Another Netlify Account

1. Create a new Netlify site from the same GitHub repository.
2. Confirm the build settings from `netlify.toml`.
3. Recreate environment variables in the new Netlify account.
4. Deploy.
5. Test Admin > Backup & Publish > Publish to GitHub.

No Netlify account-specific IDs or secrets are stored in the repo. Moving accounts is a reconnect-and-recreate-env-vars process.

## Publish Test

1. Confirm `ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, and `GITHUB_CONTENT_PATH` are set in Netlify.
2. Deploy the site.
3. Unlock Admin.
4. Export JSON first as a backup.
5. Click Publish to GitHub.
6. Verify `data/om-stotra-content.json` exists or was updated in GitHub.

If publishing fails, local content remains in the browser and export/import remains available.
