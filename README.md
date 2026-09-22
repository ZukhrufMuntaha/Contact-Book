# Contact Book

A shared contact book: everyone who opens the link sees the same list. Add, search, edit and delete contacts, backed by Upstash Redis.

**Live demo:** https://contact-book-git-main-self-0545.vercel.app/

## Features

- Add a contact with full name and phone number
- Phone format validation, with duplicate number detection
- Search by name or number
- Edit in place (`Enter` to save, `Esc` to cancel)
- Delete with a 6-second Undo
- Same shared list for every visitor, on any device
- Works on mobile and desktop, with automatic light and dark mode

## Phone number format

| Format | Example |
| --- | --- |
| 11 digits | `0300 1234567` |
| `+` followed by 12 digits (any country code) | `+923001234567`, `+933001234567` |

## Project structure

```
├── index.html        # front end (HTML, CSS, JS)
├── api/contacts.js   # serverless API: GET, POST, PUT, DELETE
├── package.json
└── README.md
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repo at [vercel.com/new](https://vercel.com/new). Framework Preset: **Other**.
3. In the project, go to **Storage → Marketplace Database Providers → Upstash**, create a Redis database, and connect it to the project. Vercel adds the connection details as environment variables automatically (their exact names depend on the prefix you choose when connecting — `api/contacts.js` reads `UPSTASH_REDIS_REST_KV_REST_API_URL` and `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`; check **Settings → Environment Variables** and adjust those two names in the code if yours differ).
4. Deploy (or redeploy, if it already deployed before the database was connected).

## Run locally

```bash
npm i -g vercel
vercel link          # link this folder to your Vercel project
vercel env pull       # pulls the Upstash environment variables
npm install
vercel dev
```

## How data is stored

Contacts are stored in an Upstash Redis database as a single shared list, so every visitor sees the same contacts in real time.
