# Match The Volunteer

Volunteer and Case lookup app built with React and Google Apps Script. Reads from two Google Spreadsheets (Volunteer Masterlist and Cases) and finds the closest volunteers to a case using the Google Maps Distance Matrix API.

## Prerequisites

- Node.js v18+
- Yarn (classic)
- [Google Apps Script API](https://script.google.com/home/usersettings) enabled

## Initial Setup

0. **Download requisites**
   - Download git [here](https://git-scm.com/install/)
   - Download NodeJS [here](https://nodejs.org/en/download)
   - Install yarn via the following steps (in your PowerShell): ```npm install --global yarn```

1. **Clone the repo**
   ```
   git clone https://github.com/Nsohko/MatchTheVolunteer.git
   cd MatchTheVolunteer
   code .
   ```
   These are 3 seperate commands, enter them one at a time into Windows PowerShell.  
   After doing it successsfully, the codebase should be open in VSCode.  
   Open your terminal in VSCode via ```View``` (top bar) -> ```Terminal```  
   Then press the small down triangle next to the  ```+``` at the top right of the terminal, then press ```git bash```  
   All the following commands should be entered into the terminal that opens

1. **Install dependencies**
   ```
   yarn install
   ```  
   
2. **Login to Clasp**
   ```bash
   yarn run login
   ```
   Opens a browser to authorize clasp with your Google account.
   (Yes the command is yarn, its configured to open clasp)
   If it doesnt work, try ```yarn login```

3. **Create GAS project** (first-time only)
   ```bash
   yarn run setup
   ```
   Creates a new Apps Script project and configures `.clasp.json` with `rootDir: "./dist"`.  
   If you already have a project, ensure `.clasp.json` exists with your `scriptId` and `"rootDir": "./dist"`. 

   If you navigate to your Google Drive, there should be a new file called ```MatchTheVolunteer```

## Local Development & Testing
Note: Map API cannot be tested locally yet (no time to finish)
TODO: Make it able to connect to sheets and map during local dev

1. **Create a .env file, and copy the content of [.env.example](.env.example)**
   - Make a copy of the volunteer and cases masterlist. For better accuracy run the fake name generator script
   - Replace the values of ```VOLUNTEER_SHEET_URL``` and ```CASE_SHEET_URL``` with the urls fo ur copies

2. **Download the Cases and Volunteer Masterlist, and place them under ```/mock_data```**
   - You will need to create a folder called ```/mock_data``` under project root  
   (i.e. directly under ```/MatchTheVolunteer```)

3. **Run ```yarn generate-mock``` to generate mock data for testing from the sheets.**
   If the data changes, run the command again to generate fresh mock data  
   - TODO: Make it read the data directly from the downloaded sheets instead of generating the mockdata file. This will let us test our server functions 

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

