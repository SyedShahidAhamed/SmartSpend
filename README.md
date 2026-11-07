# SmartSpend

SmartSpend is a React + Vite personal budget tracker using Firebase Authentication and Cloud Firestore.

## Setup

1. Install Node.js (LTS).
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`.
4. Fill in the Firebase web-app configuration values in `.env`.
5. Start the app: `npm run dev`
6. Create a production build: `npm run build`

The `.env` file is intentionally not included in this project archive. Never commit it or share its values publicly.

## Project structure

```text
src/
  components/
    common/       Shared UI components
    modals/       Category and Help modals
  data/           Empty initial data (no demo records)
  pages/          Dashboard, Budgets, Transactions, Analytics, etc.
  services/       Firestore data access
  utils/          Formatting helpers
  App.jsx         App shell, routing, auth state and shared state
  firebase.js     Firebase client initialization
  main.jsx        React entry point
```

## Demo data

New accounts start with no categories and no transactions. Users can create their own budgets and expenses. Existing Firestore records are not automatically deleted, to avoid removing any real data.

## Help form

The Help Centre submits messages to the configured Formspree endpoint:
`https://formspree.io/f/mqppobvg`

Formspree must have the form enabled and the recipient email verified in its dashboard.

## Firebase

Firebase Authentication and Firestore remain client-connected. Cloud Functions configuration has been removed; daily scheduled email receipts are not enabled in this version.
