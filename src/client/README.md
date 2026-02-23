# Client (React)

React app that runs in the browser. When deployed, it is served by Google Apps Script (`doGet` → `match-the-volunteer.html`). When GAS is available, it calls server functions via `gas-client`; otherwise it uses mock data for local development.

## Structure

```
src/client/
├── api/
│   ├── index.ts           # API layer: GAS or mock
│   ├── mockData.ts        # Mock implementations (uses mockData.generated)
│   └── mockData.generated.ts  # Generated from mock_data/*.xlsx (yarn generate-mock)
├── components/
│   ├── VolunteerSearch.tsx   # Search by volunteer code
│   └── CaseSearch.tsx         # Select case, show biodata + closest volunteers
├── pages/
│   └── HomePage.tsx       # Tab switcher (Volunteer | Case)
├── App.tsx
├── index.tsx              # React root
├── index.html             # Entry HTML
└── styles.css
```

## API layer

`api/index.ts` uses `gas-client` to call server functions when `google.script.run` is available (inside GAS). Otherwise it falls back to mock functions for local dev.


| Function                              | Returns                     | Server / Mock                                                                     |
| ------------------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `searchVolunteerByCode(code)`         | `Volunteer` or throws       | `serverFunctions.searchVolunteerByCode` / `mockSearchVolunteerByCode`             |
| `getCasesList()`                      | `Case[]`                    | `serverFunctions.getCasesList` / `mockGetCasesList`                               |
| `getClosestVolunteersForCase(caseId)` | `ClosestVolunteersResponse` | `serverFunctions.getClosestVolunteersForCase` / `mockGetClosestVolunteersForCase` |


## Components


| Component           | Pattern                                         | Data flow                                                                                                                             |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **VolunteerSearch** | Search by code. User types code, clicks Search. | Fetches one volunteer on demand.                                                                                                      |
| **CaseSearch**      | Select from dropdown. User picks case.          | Loads all cases for dropdown; fetches closest volunteers when a case is selected. Case biodata comes from the selected case in state. |


## Mock data

- `mockData.generated.ts` is produced by `yarn generate-mock` from `mock_data/*.xlsx`.
- `mockData.ts` implements the three mock functions using that data.
- `mockData.generated.ts` is gitignored; run `yarn generate-mock` after cloning if you need local dev without GAS.

## Build

Vite builds the client into a single HTML file (`dist/match-the-volunteer.html`) via `vite-plugin-singlefile`. The GAS `doGet` serves this file. Dev server runs at `https://localhost:3000` (HTTPS required for GAS iframe).