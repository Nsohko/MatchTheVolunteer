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
   <br/>

2. **Login to Clasp**
   ```bash
   yarn login
   ```
   Opens a browser to authorize clasp with your Google account.
   (Yes the command is yarn, its configured to open clasp)
   </br>

3. **Create GAS project** (first-time only)
   ```bash
   yarn setup
   ```
   Creates a new Apps Script project and configures `.clasp.json` with `rootDir: "./dist"`.
   If you already have a project, ensure `.clasp.json` exists with your `scriptId` and `"rootDir": "./dist"`.

## Local Development & Testing
Note: Map API cannot be tested locally yet (no time to finish)
TODO: Make it able to connect to sheets and map during local dev

1. **Create a .env file, and copy the content of [.env.example](.env.example)**

2. **Download the Cases and Volunteer Masterlist, and place them under /mock_data**

3. **Run ```yarn generate-mock``` to generate mock data for testing from the sheets.**
   If the data changes, run the command again to generate fresh mock data

4. **Run ```yarn dev```, web app should be available at http://localhost:3000/**


## Pushing to GAS
1. **Run ```yarn deploy```.**
   This will push ur code to GAS

2. **Configure sheets metadata fFrom your project page on GAS**
   **Project Settings** (gear) → **Script properties** → Add:
     - `SHEET_URL` – Volunteer spreadsheet URL
     - `CASE_SHEET_URL` – Case spreadsheet URL
     - `VOLUNTEER_SHEET_NAME` – e.g. `Volunteer Masterlist`
     - `CASE_SHEET_NAME` – e.g. `Cases`
     - `GOOGLE_MAPS_API_KEY` – Your Google Maps API key

3. **Deploy**
   From the GAS editor: **Deploy** → **New deployment** → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (or your preference)

## Other Notes

The types in [sheets.ts](src\types\sheets.ts) are generated dynamically from the sheet columns
To refresh the types (e.g. if column names change) run ```yarn generate-types```
You may also need to change the variable-column mapping in [case.ts](src\types\case.ts) and [volunteer.ts](src\types\volunteer.ts)


### References

This project was built on [React-Google-Apps-Script](https://github.com/enuchi/React-Google-Apps-Script) by [Enuchi](https://github.com/enuchi)

