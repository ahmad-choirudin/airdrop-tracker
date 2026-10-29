◈ AIRDROP TRACKER

Your Web3 airdrop operations dashboard.

A personal workspace for tracking airdrop opportunities, managing campaign tasks, monitoring deadlines, and organizing Web3 research — all in one place.

Built with React, Vite, and Tailwind CSS, featuring a dark interface, neon-lime accents, and browser-based storage. No account required. No backend. Your personal tracking data stays in your browser.

<!-- Add your screenshot after uploading it to the repository:
![Airdrop Tracker Dashboard](docs/screenshots/dashboard.png)
-->✳ Features

◈ Dashboard

- Overview of tracked projects and upcoming deadlines
- Project status distribution and task progress visualization
- Activity log for recent actions
- Quick access to important tracking information

◈ Explore

- Browse and search airdrop projects
- Filter by blockchain, category, and other criteria
- Sort by deadline, date added, or priority
- Switch between grid and list layouts

◈ Task Management

- Kanban board with To Do, In Progress, and Done columns
- Drag-and-drop task organization
- Custom tasks, priorities, and tags
- Search and filter tasks to stay focused

◈ Deadline Calendar

- Monthly calendar with project deadlines
- Weekly schedule and overdue project lists
- Browser notification reminders
- A clearer view of upcoming tasks and important dates

◈ Watchlist

- Save favorite projects for quick access
- Assign priorities and add personal notes
- Keep high-priority opportunities within reach

◈ Project Details

- Project-specific task checklists
- Personal research notes
- Wallet labels for organizational purposes
- Direct links to project websites and X accounts

◈ Built for Everyday Use

- Responsive layouts for mobile and desktop
- Browser-based persistence with "localStorage"
- No login or backend required
- Lightweight React + Vite application

⌘ Tech Stack

Technology| Purpose
React 18| UI components and application logic
Vite 5| Development server and build tooling
Tailwind CSS 3| Utility-first styling
lucide-react| Interface icons
Browser localStorage| Client-side data persistence

◈ Project Structure

src/
├── App.jsx       # Application UI and logic
├── data.json     # Airdrop project dataset
├── index.css     # Custom styles and animations
├── main.jsx      # Application entry point
└── mascot.webp   # Project mascot

⚡ Getting Started

Prerequisites

- Node.js 18 or newer
- npm

Installation

Clone the repository and install the dependencies:

git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
npm install
npm run dev

Open the local URL displayed in your terminal, usually "http://localhost:5173".

To access the development server from another device or through GitHub Codespaces:

npm run dev -- --host

Available Commands

npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build

◈ Project Data

Airdrop project information is maintained in "src/data.json".

Field| Description
"id"| Unique project identifier
"n"| Project name
"c"| Blockchain network
"k"| Project category
"s"| Status: "Active", "Upcoming", or "Ended"
"i"| Verification level: "Confirmed", "Potential", or "Unverified"
"dl"| Days until deadline; negative values indicate overdue deadlines
"ad"| Days since the project was added
"v"| Days since the project was last verified
"r"| Project summary
"f"| Optional risk warning
"w"| Project website URL
"x"| Project X account URL

◈ Data & Privacy

Personal tracking information is stored locally in your browser using "localStorage".

Current storage keys:

- "at-tasks2" — task data
- "at-watch" — watchlist, priorities, and notes
- "at-log" — activity log

There is no application backend or login system. Data may be lost if browser site data is cleared, and it does not automatically sync between devices.

⚠️ Security & Disclaimer

Airdrop Tracker is an organizational tool, not a guarantee of financial rewards or investment returns.

- A project marked as confirmed does not guarantee an airdrop or token distribution.
- Always verify project information through official sources.
- Never enter your seed phrase, private key, or other wallet credentials.
- The wallet field is intended for labels only, such as "Main Wallet".
- Do your own research before interacting with any Web3 project.

◈ Design Philosophy

Track smarter. Research carefully. Stay organized.

Airdrop Tracker is designed to make airdrop research more structured and manageable through a focused interface, practical task management, and clear deadline tracking.

---

Built for the Web3 community.
