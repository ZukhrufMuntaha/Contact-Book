# Contact Book

A simple, responsive web app to save names and phone numbers. Add contacts with the form, then view, search, edit and delete them in the list below.

Plain HTML, CSS and JavaScript in a single file. No build step, no dependencies.

## Features

- Add a contact with full name and phone number
- Validation with clear error messages, including duplicate number detection
- Search by name or number
- Edit in place (`Enter` to save, `Esc` to cancel)
- Delete with a 6-second Undo
- Works on mobile and desktop, with automatic light and dark mode

## Run locally

Open `index.html` in your browser.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Set **Framework Preset** to **Other**, leave build settings empty, and click **Deploy**.

Or with the CLI:

```bash
npm i -g vercel
vercel --prod
```

## Data storage

Contacts are saved in the browser's `localStorage`. They persist after a refresh, but stay on that device and browser and are not shared between users.

## Structure

```
├── index.html
└── README.md
```
