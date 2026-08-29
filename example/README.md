# Sort Lab showcase

An interactive example application for `use-sortable`. It consumes the parent
repository through `"use-sortable": "file:.."`, so the table exercises the real
library package rather than copying its logic.

## Run locally

Build the library once, then start the showcase:

```sh
cd ..
npm install
npm run build
cd example
npm install
npm run dev
```

Open `http://localhost:3000`.

## What it demonstrates

- Search across several record fields with a custom comparator
- Multiple simultaneous status, category, and score filters
- Toggleable column sorting and a multi-sort priority preset
- Persistent bookmark promotion using `localStorage`
- Derived result statistics, reset controls, and an empty state

## Validate

```sh
npm run lint
npm test
npm run build
```
