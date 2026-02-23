# Match The Volunteer

Volunteer and Case lookup app built with React and Google Apps Script. Reads from two Google Spreadsheets (Volunteer Masterlist and Cases) and finds the closest volunteers to a case using the Google Maps Distance Matrix API.

## Prerequisites

- Node.js v18+
- Yarn (classic)
- [Google Apps Script API](https://script.google.com/home/usersettings) enabled

## Setup

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Login to Clasp**
   ```bash
   yarn run login
   ```

3. **Create GAS project** (standalone web app)
   ```bash
   yarn run setup
   ```
   Or manually: `npx clasp create --type standalone --title "MatchTheVolunteer"` and update `.clasp.json` with the scriptId and `"rootDir": "./dist"`.

4. **Set GOOGLE_MAPS_API_KEY** in GAS Script Properties:
   - Deploy once, then open the project in [script.google.com](https://script.google.com)
   - File > Project properties > Script properties
   - Add `GOOGLE_MAPS_API_KEY` with your Google Maps API key

## Deploy

```bash
yarn run deploy
```

Then in the GAS editor: **Deploy > New deployment > Web app**
- Execute as: **Me**
- Who has access: **Anyone** (or your preference)

## Spreadsheet URLs

Edit `src/server/config.ts` to change the Volunteer and Case spreadsheet URLs:

```ts
export const CONFIG = {
  SHEET_URL: "https://docs.google.com/spreadsheets/d/YOUR_VOLUNTEER_ID/edit...",
  CASE_SHEET_URL: "https://docs.google.com/spreadsheets/d/YOUR_CASE_ID/edit...",
  VOLUNTEER_SHEET_NAME: "Volunteer Masterlist",
  CASE_SHEET_NAME: "Cases",
  ...
};
```

## Local Development

```bash
yarn run setup:https   # First time only - generates certs
yarn run start         # Deploys dev build and starts local server
```

Then open the web app URL and it will load your local React app with live reload.

## Scripts

- `yarn build` - Production build (outputs to `dist/`)
- `yarn deploy` - Build and push to GAS
- `yarn dev` - Start Vite dev server (for local UI development)
- `yarn push` - Push `dist/` to GAS (run after build)
