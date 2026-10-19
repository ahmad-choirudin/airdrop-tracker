# Airdrop Tracker

A web app for tracking crypto airdrop projects: deadlines, task checklists, personal notes, and a watchlist. All personal data is stored in your browser (localStorage), with no backend and no login.

## Features

- **Dashboard**: project count, nearest deadline, status distribution, task progress chart, and activity log.
- **Explore**: project list with search, chain and category filters, sorting (deadline, date added, priority), and grid or list view.
- **Tasks**: kanban board (todo, doing, done) with drag and drop, priority and tag filters, search, and custom tasks.
- **Calendar**: monthly deadline calendar, this week's list, overdue list, and reminders via browser notifications.
- **Watchlist**: favorite projects with priority and notes.
- **Project details**: checklist, personal notes, wallet label, and links to the website and X account.
- Responsive layout: works on both mobile and desktop.

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- lucide-react

## Getting Started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually `http://localhost:5173`). To access it from another device or from Codespaces, run it with `npm run dev -- --host`.

Other commands:

```bash
npm run build     # production build to the dist folder
npm run preview   # preview the production build
```

## Project Structure

```
src/
  App.jsx       # all UI and app logic
  data.json     # airdrop project list
  index.css     # extra styles and animations
  main.jsx      # entry point
  mascot.webp   # mascot image
```

## Editing Project Data

The project list lives in `src/data.json`. Fields used by the app:

| Field | Meaning |
| --- | --- |
| `id` | Unique project ID |
| `n` | Project name |
| `c` | Chain |
| `k` | Category |
| `s` | Status: `Active`, `Upcoming`, or `Ended` |
| `i` | Verification: `Confirmed`, `Potential`, or `Unverified` |
| `dl` | Days until deadline (negative means overdue) |
| `ad` | Days ago the project was added |
| `v` | Days ago it was last verified |
| `r` | Project summary |
| `f` | Risk warning (optional) |
| `w` | Website URL |
| `x` | X account URL |

## Data Storage

Tasks, favorites, priorities, notes, and the activity log are stored in the browser's localStorage under the keys `at-tasks2`, `at-watch`, and `at-log`. Clearing site data in your browser will erase everything.

## Security Notes

- There is no guarantee that any project will distribute an airdrop. Do your own research.
- Never enter a seed phrase, private key, or full wallet address into this app. The wallet field is for labels only, for example "Main wallet".
