TALENTFLOW — Mini Hiring Platform (Frontend Only)

Stack: Vite + React + Bootstrap 5 + React Router v6 + React Query (TanStack) + @hello-pangea/dnd + react-window + react-hook-form + MSW + Dexie

Features snapshot:
- Jobs: list with pagination/filter, create, reorder (DnD with optimistic update/rollback)
- Candidates: large list virtualization, search/filter, profile, kanban (coming next)
- Assessments: builder, preview, runtime (coming next)
- Persistence: IndexedDB via Dexie, all I/O through MSW with artificial latency and error rate

Getting Started

1) Install

```bash
npm install
```

2) Run dev server

```bash
npm run dev
```

Open the printed localhost URL (typically http://localhost:5173). MSW service worker registers automatically on app start.

3) Build

```bash
npm run build
npm run preview
```

Notes
- First run seeds the Dexie DB with 25 jobs, 1000 candidates, and sample assessments.
- Write endpoints in MSW include 200–1200 ms latency and ~8% error rate to exercise optimistic updates and rollbacks.
- To reset data, clear the browser’s IndexedDB for the site (Application tab in devtools) and refresh.

Project Structure (selected)

```
src/
  api/
    client.js            # fetch wrapper
    msw.js               # MSW setup + REST handlers
  db/
    db.js                # Dexie schema + seed
  components/
    Jobs/
      JobsPage.jsx       # list, filters, pagination, DnD reorder
      JobCard.jsx
      JobFormModal.jsx
    common/
      Pagination.jsx
      Toast.jsx
  hooks/
    useJobs.js           # jobs queries and mutations
  utils/
    slugify.js
    id.js
  App.jsx
  main.jsx
```

Deployment
- Any static host (Vercel/Netlify). Ensure the MSW worker file is served (Vite will handle in dev; for prod, include `mockServiceWorker.js` at the site root or disable mocks for prod).
