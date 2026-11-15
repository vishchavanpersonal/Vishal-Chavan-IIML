# Taskflow — Simple Task Manager

A responsive task manager built with Next.js, React, TypeScript and Tailwind CSS. It is ready to run locally and deploy on Vercel.

## Features

- Dashboard with total, completed, due-today and overdue task counts
- Create, edit, complete/reopen and delete tasks
- Start date, due date and optional expiry date
- High / Medium / Low priority
- Pending / In Progress / Completed status
- Search and filter by status and priority
- Monthly calendar view showing task due dates
- Browser localStorage persistence
- Responsive layout for desktop and mobile

## Requirements

- Node.js 20.9 or newer
- npm
- GitHub account
- Vercel account

## Run locally

1. Extract this ZIP file.
2. Open the extracted `task-manager-app` folder in VS Code or your terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Push to GitHub

Create an empty repository on GitHub, then run these commands from this project folder:

```bash
git init
git add .
git commit -m "Initial Taskflow app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your own GitHub repository URL.

## Deploy on Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Select **Add New → Project**.
3. Import the GitHub repository you just created.
4. Keep the detected Next.js settings.
5. Select **Deploy**.

Vercel will build and host the application. Future pushes to the connected branch will trigger deployments automatically.

## Important: where tasks are stored

This starter version stores tasks in the browser's `localStorage`. This means:

- Tasks remain after a page refresh in the same browser.
- Data is specific to that browser and device.
- Clearing browser site data can remove the tasks.
- There is no user login, shared workspace, cloud database or automatic cross-device sync yet.

For a multi-device or team-ready version, connect a database such as Supabase or Vercel Postgres and add authentication. The current version intentionally avoids requiring database credentials so you can deploy it immediately.

## Project structure

```text
task-manager-app/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Notes

- The expiry date is stored as task metadata; it does not automatically delete a task.
- Overdue status is calculated from the due date and current date, unless the task is completed.
- Calendar entries are based on due dates.
