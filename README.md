# Match The Volunteer

Volunteer and Case lookup app built with React and Google Apps Script. Reads from two Google Spreadsheets (Volunteer Masterlist and Cases) and finds the closest volunteers to a case using the Google Maps Distance Matrix API.

## Prerequisites

- Node.js v18+
- Yarn (classic)
- [Google Apps Script API](https://script.google.com/home/usersettings) enabled

## Initial Setup

1. **Install dependencies**
  ```bash
   yarn install
  ```
2. **Login to Clasp**
  ```bash
   yarn login
  ```
   Opens a browser to authorize clasp with your Google account.
3. **Create GAS project** (first-time only)
  ```bash
   yarn setup
  ```
   Creates a new Apps Script project and configures `.clasp.json` with `rootDir: "./dist"`.
   If you already have a project, ensure `.clasp.json` exists with your `scriptId` and `"rootDir": "./dist"`.
4. **Set spreadsheet URLs** (required before first push)
  Edit `src/server/config.ts` with your Volunteer and Case spreadsheet URLs.

6. **Configure Google Maps API key**
  - Push once, then open the project at [script.google.com](https://script.google.com)
  - **Project Settings** (gear) → **Script properties** → Add `GOOGLE_MAPS_API_KEY`
7. **Generate types and mock data** (for local dev)
  - Add XLSX files to `mock_data/`:
    - `1. Volunteer Masterlist.xlsx`
    - `Case Masterlist.xlsx`
  - Run:
    ```bash
    yarn generate-all
    ```
  - This generates `src/server/types/sheets.ts` and `src/client/api/mockData.generated.ts`
8. **HTTPS for local dev** (optional)
  ```bash
   yarn setup:https
  ```
   Creates `certs/` for HTTPS (required for GAS iframe in local dev).

## Main Commands


| Command           | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `yarn dev`        | Start Vite dev server (port 3000)                     |
| `yarn build`      | Production build → `dist/`                            |
| `yarn build:dev`  | Development build (dev-server wrapper)                |
| `yarn push`       | Push `dist/` to Google Apps Script                    |
| `yarn deploy`     | Build + push (production)                             |
| `yarn deploy:dev` | Build + push (development)                            |
| `yarn start`      | Deploy dev + start local server (full local dev flow) |
| `yarn open`       | Open GAS project in browser                           |
| `yarn lint`       | Run ESLint                                            |


## Type & Mock Data Generation


| Command               | Description                                | Output                                 |
| --------------------- | ------------------------------------------ | -------------------------------------- |
| `yarn generate-types` | Generate TypeScript types from XLSX        | `src/server/types/sheets.ts`           |
| `yarn generate-mock`  | Generate mock data from XLSX for local dev | `src/client/api/mockData.generated.ts` |
| `yarn generate-all`   | Run both                                   | Both files above                       |


**Requirements:** Place `1. Volunteer Masterlist.xlsx` and `Case Masterlist.xlsx` in `mock_data/` before running.

## Deploy to Production

```bash
yarn deploy
```

Then in the GAS editor: **Deploy** → **New deployment** → **Web app**

- Execute as: **Me**
- Who has access: **Anyone** (or your preference)

