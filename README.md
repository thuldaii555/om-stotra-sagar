# Om Stotra Sagar

Om Stotra Sagar is an English-first, local-first Hindu devotional reading website for stotras, deity profiles, pooja guidance, stories, Panchang learning, and personal favorites. It works in the browser without Firebase, login, backend setup, or a required internet connection.

It includes:
- Stotra reading with search and filters
- Deity profiles
- Pooja Bidhi guides
- Family-friendly devotional stories
- An editable educational Panchang guide
- Local favorites
- Local content admin tools

## Local-first architecture

All editable content is stored in the browser using `localStorage`.

That means:
- Content changes stay on the same browser unless you export them.
- Favorites and reader font size also persist locally.
- Export and import are used for backup and restore.
- Reset restores the bundled starter content.
- Malformed saved content is normalized so the app can recover to usable defaults.

## Run locally

Prerequisite:
- Node.js

Steps:
1. Install dependencies: `npm install`
2. Start the app: `npm run dev`
3. Open `http://localhost:3000`

## Content storage

The app stores:
- Stotras
- Deities
- Categories
- Pooja Bidhi
- Stories
- Panchang guide content
- Favorites
- Reader font size

Starter content lives in `src/data/defaultContent.ts`. User edits are saved in the browser.

## Admin

The Admin section is a local content studio. It lets you:
- Add, edit, and delete content locally
- Create deities and categories inline while editing a stotra
- Create deities inline while editing a pooja guide
- Edit Panchang intro text, terms, daily notes, and disclaimer
- Export all content as JSON
- Import JSON backups
- Reset the browser back to the default starter content

## Export and import

- In Admin, open Backup & Restore.
- Use Export Content to place the current content bundle in the JSON box.
- Copy the JSON or save it separately as a backup.
- Paste a previous export or load a JSON file, then use Import Content to restore it.
- Invalid JSON is rejected with a clean error message.

## Reset defaults

In Admin, open Backup & Restore and choose Reset to Default Content. This restores bundled starter content for stotras, deities, categories, pooja guides, stories, and Panchang guide content. It also clears local favorites and reading history.

## Current limitations

- Data is not synced across devices.
- Panchang is an educational guide, not a live calculation service.
- The starter texts and short excerpts should still be verified before public release.
- Browser storage can be cleared by the user or browser settings, so export important edits.

## Future plans

See [docs/FUTURE_BACKEND.md](docs/FUTURE_BACKEND.md) for optional future work such as Nepali support, synced accounts, or live Panchang.

## Netlify deployment

Do not deploy yet. When v1 is approved, build with `npm run build` and deploy the generated `dist` folder to Netlify as a static site.
