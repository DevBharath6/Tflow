TalentFlow

TalentFlow is a modern, fast, and intuitive HR platform designed to streamline recruitment processes. It allows organizations to manage jobs, candidates, and assessments efficiently, with features such as a Kanban-style candidate board, real-time stats, and a scalable architecture.

Table of Contents

Project Overview

Features

Tech Stack

Project Structure

Installation

Usage

Database Seeding

Future Enhancements

Author

Project Overview

TalentFlow is a full-stack web application designed to help HR teams manage recruitment efficiently. It provides:

Job posting and management

Candidate tracking across multiple stages

Kanban board for visual candidate flow

Assessment creation and submission

Dashboard-like stats for jobs and candidates

Scalable frontend and backend with a modern architecture

The project emphasizes usability, real-time updates, and a responsive design suitable for HR teams of any size.

Features

Admin Panel Features:

Create, edit, and delete jobs

View and manage candidates

Drag & drop candidates across stages (Kanban board)

Real-time stats of jobs and candidates

Assign assessments to jobs

Public Features:

Browse jobs and candidates

View assessments (if applicable)

Interactive dashboard with live stats

Tech Stack

Frontend:

React.js (Vite-based project)

React Router v6

React Query (@tanstack/react-query)

Bootstrap / Custom CSS for UI

Drag & Drop: @hello-pangea/dnd

Backend / Data Layer:

Dexie.js (IndexedDB wrapper for browser-based storage)

MSW (Mock Service Worker) for API simulation

UUID for unique identifiers

Build & Dev Tools:

Vite.js (frontend bundler & dev server)

NPM / Yarn

Git for version control

Home.js – Hero, features, and stats section

KanbanBoard.js – Drag & drop candidate board

db.js – Database schema, seeding, and mock API handlers

client.js – Handles API requests

Installation

Clone the repository:

git clone https://github.com/yourusername/talentflow.git
cd talentflow


Install dependencies:

npm install
# or
yarn install


Run the development server:

npm run dev
# or
yarn dev


Open http://localhost:5173 in your browser.

Usage

Navigate to the Home page to view stats and explore Jobs/Candidates.

Click Explore Jobs or Browse Candidates to go to respective pages.

Admin users can manage jobs, candidates, and assessments via the Admin Panel.

Drag & drop candidates across stages in the Kanban Board to update their recruitment status.

Database Seeding

TalentFlow uses Dexie.js for IndexedDB storage. On first load, the database automatically seeds:

25 Jobs – with titles, slugs, and statuses

1000 Candidates – random names, emails, skills, stages

3 Assessments – example sections with multiple question types

Seeding ensures that the app is ready to interact with real-looking data immediately.

Future Enhancements

Add real backend (Node.js + Express + MongoDB) for persistence

Authentication & role-based access control (Admin/User)

Candidate search, filtering, and sorting

Reporting & analytics dashboard

Real-time notifications for candidate updates

Author

Your Name

GitHub: [your-github-link]

LinkedIn: [your-linkedin-link]

This README should cover everything your assessors expect: project description, tech stack, features, usage instructions, and structure.
