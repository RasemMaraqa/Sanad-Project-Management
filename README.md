# سَنَد — Sanad Project Management

<p align="center">
  <img src="frontend/public/sanad-logo.png" alt="Sanad Project Management logo" width="220" />
</p>

Sanad is a bilingual project-management application for teams. It keeps work organized in one simple order:

```text
Workspace → Project → Task
```

- A **workspace** is the home for a company, department, or team.
- A **project** is one piece of work inside a workspace.
- A **task** is one action inside a project.

Users never need to know or enter internal user IDs, workspace IDs, or project IDs.

## Authorship and repository relationship

The **Sanad frontend was generated 100% with AI** and was tested and integrated for this application.

The **backend was created by the project owner in a separate repository**. A copy is included here so the complete frontend, API, and database can run together. The backend remains the project owner's work and can continue to be maintained in its original repository.

## The easiest way to use Sanad

If this computer has already been prepared, do not open a terminal and do not run commands:

1. Double-click **Sanad Project Manager** on the Windows desktop.
2. Wait a few seconds.
3. The browser opens automatically at `http://localhost:5173`.
4. Register an account or sign in.

The launcher checks the API and frontend, starts anything that is not already running, waits until both are ready, and opens the website. Local developer mode requires PostgreSQL to be installed and running; clean installations can use the automatic Docker mode described below.

### After downloading Sanad on another computer

1. Extract the complete Sanad folder. Do not move individual files out of it.
2. Double-click **Install Desktop Launcher.cmd** inside the folder.
3. A **Sanad Project Manager** shortcut is created on that user's Desktop using the correct folder location.
4. Double-click the new Desktop shortcut to start Sanad.

The folder launcher uses relative paths, so the extracted folder may have any name and may be stored anywhere the user can access. Do not copy a `.lnk` shortcut from another computer because it contains that computer's absolute folder path.

On a prepared developer computer, the launcher uses the local Python, Node.js, and PostgreSQL installation. On a clean computer, it automatically uses the included Docker configuration when Docker Desktop is installed and running. The first Docker start builds the application and may take several minutes; later starts are much faster. If neither setup is available, the launcher displays simple installation instructions.

## First-time user guide

### 1. Create an account

Open Sanad, choose **Create an account**, enter your name, email address, and password, then sign in.

### 2. Create a workspace

Open **Workspaces**, press **New workspace**, and enter the team or company name. Example: `Ramallah Office`.

### 3. Create a project

Open the workspace, choose **Projects**, press **New project**, and describe the result you want. Example: `Open the new store`.

### 4. Add tasks

Open the project and press **New task**. Give the task a clear title, priority, deadline, and responsible person.

### 5. Update progress

You do not need to open the edit form just to change progress. Change the status directly from the task list or board:

- **To Do** — work has not started.
- **In Progress** — somebody is working on it.
- **Done** — work is complete.

### 6. Add teammates

The teammate must create a Sanad account first. Open **Members**, press **Add member**, enter their email address, and choose a role. Internal IDs are never requested or displayed.

### 7. Get help inside the app

Press the **question-mark button** in the top bar for a four-step guide. The interface also explains when a workspace or project must be selected. The current workspace and project appear in the sidebar and top breadcrumb.

## What every menu item means

| Menu item | What it does |
| --- | --- |
| Dashboard | Shows totals and progress across accessible workspaces. |
| Workspaces | Creates and opens company or team spaces. |
| Projects | Shows projects inside the selected workspace. |
| Tasks | Opens tasks for the selected project. |
| Members | Adds people to the selected workspace and changes their roles. |
| Roles | Controls what workspace members may view or change. |
| Settings | Changes language, appearance, and account preferences. |

If **Projects**, **Tasks**, **Members**, or **Roles** cannot open, select or create a workspace first. If **Tasks** cannot open, select a project first. Sanad displays a message explaining the required action.

## Main features

- Registration, login, logout, saved sessions, and protected routes
- Workspaces, projects, tasks, members, roles, and permissions
- Task assignment, priority, deadline, filters, pagination, and details
- List and Kanban board task views
- Direct task-status changes without opening the edit dialog
- Email-based member invitations without exposing internal IDs
- Permission-aware buttons backed by server-side authorization
- English and Arabic interfaces with right-to-left Arabic layout
- Light and graphite dark themes using the green, navy, and red logo palette
- Responsive desktop and mobile layouts
- Loading states, empty states, confirmation dialogs, errors, and notifications
- One-click Windows launcher
- Docker configurations for local and public deployment

## How the application works

```text
User's browser
      ↓
React + TypeScript frontend
      ↓ /api
FastAPI backend
      ↓
PostgreSQL database
```

The browser displays the interface. FastAPI applies business rules and permissions. PostgreSQL stores accounts, workspaces, projects, tasks, roles, and memberships.

## Project folders

```text
frontend/                     React, TypeScript, Vite, and Tailwind interface
  src/api/                    Typed API requests
  src/components/             Reusable interface components
  src/context/                Login, language, and notification state
  src/layouts/                Sidebar and application shell
  src/pages/                  Application screens
backend/                      Integrated copy of the separate FastAPI repository
  app/authorization/          Role and permission policies
  app/core/                   Configuration and security
  app/database/               Database session and seed helpers
  app/models/                 SQLAlchemy database models
  app/routers/                API endpoints
  app/schemas/                Request and response validation
  alembic/                    Database migrations
scripts/Start-Sanad.ps1       One-click launcher logic
scripts/Install-Sanad-Shortcut.ps1 Creates a location-correct Desktop shortcut
Start Sanad.cmd               Repository launcher entry point
Install Desktop Launcher.cmd  Adds the launcher to the current user's Desktop
docker-compose.yml            Local Docker stack
docker-compose.production.yml Production Docker stack
deploy/Caddyfile              HTTPS reverse proxy configuration
```

## Run on the prepared Windows computer

Use the **Sanad Project Manager** desktop shortcut. The configured development addresses are:

- Website: `http://localhost:5173`
- API health check: `http://localhost:8000/health`
- API documentation: `http://localhost:8000/docs`

Keep the project folder in its current location because the desktop shortcut points to it.

## Prepare a different Windows computer

Use a supported 64-bit version of Windows. Install PostgreSQL, Python, Node.js, and npm. Then configure the backend:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `backend/.env` and set the PostgreSQL password, database URL, and a long random `SECRET_KEY`. Create the database if it does not exist, then run:

```powershell
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

In a second PowerShell window:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run everything with Docker

Docker is the simplest repeatable setup for a new server.

1. Install Docker Desktop or Docker Engine.
2. From the project root, create the private configuration:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Replace the sample `POSTGRES_PASSWORD` and `SECRET_KEY` in `.env`.
4. Start the application and create/update its database tables:

   ```powershell
   docker compose up --build -d
   docker compose exec api alembic upgrade head
   ```

5. Open `http://localhost:3000`.

Useful Docker commands:

```powershell
docker compose ps
docker compose logs -f
docker compose down
```

`docker compose down` stops the application but keeps database data. Do not run `docker compose down -v` unless you intentionally want to delete the Docker database volume.

## Let other PCs use Sanad on a local network

Only the server computer needs the backend and database. Client computers only need a modern web browser.

1. Connect every computer to the same router or network switch.
2. Give the server a fixed local IP or DHCP reservation, such as `192.168.1.20`.
3. Run Sanad on the server.
4. Allow the website port through Windows Defender Firewall for **Private networks only**:
   - Port `3000` for the Docker setup
   - Port `5173` for the development launcher
5. On another computer, open one of these addresses:

   ```text
   http://192.168.1.20:3000
   http://192.168.1.20:5173
   ```

Replace `192.168.1.20` with the server's IPv4 address shown by `ipconfig`. Keep the server powered on and prevent it from sleeping while others use Sanad.

The `5173` development address is for a trusted local network only. Do not expose it directly to the internet.

## Publish Sanad on the internet

Use the included production stack on a supported Linux server or VPS:

1. Point a domain name to the server's public IP address.
2. Install Docker Engine and Docker Compose.
3. Copy the project to the server.
4. Create the production settings:

   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```

5. Set `DOMAIN`, `POSTGRES_PASSWORD`, and a random `SECRET_KEY` of at least 32 characters.
6. Start and migrate the stack:

   ```bash
   docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
   docker compose --env-file .env.production -f docker-compose.production.yml exec api alembic upgrade head
   ```

Open `https://your-domain`. Caddy obtains and renews HTTPS certificates automatically. Only ports 80 and 443 are published; PostgreSQL and FastAPI stay inside the Docker network.

## Configuration reference

| Variable | Meaning | Secret? |
| --- | --- | --- |
| `POSTGRES_USER` | PostgreSQL account name | No |
| `POSTGRES_PASSWORD` | PostgreSQL password | Yes |
| `POSTGRES_DB` | Database name | No |
| `DATABASE_URL` | Complete backend database connection | Yes |
| `SECRET_KEY` | Signs authentication tokens | Yes |
| `CORS_ORIGINS` | Browser addresses allowed to call the API | No |
| `VITE_API_URL` | Public frontend path or URL for the API | No |
| `DOMAIN` | Public production hostname | No |

Never commit `.env` or `.env.production`. Never reuse the sample passwords in a real deployment.

## Roles and security

The frontend hides actions the current user is not allowed to use. The backend checks authorization again for every protected operation; hidden buttons are not the security boundary.

Typical roles are:

- **Owner** — full workspace control
- **Manager** — manages work according to assigned permissions
- **Viewer** — read-only or limited access

Custom roles can be created from the Roles screen. Give each role only the permissions it needs.

## Backups and updates

Back up PostgreSQL regularly, especially before an application update. For Docker deployments, protect the `postgres_data` volume and create database dumps on a schedule.

To update a production installation, copy or pull the new code, back up the database, then run the production `up -d --build` and Alembic migration commands again.

## Troubleshooting

### The page says “Unable to connect to server”

Check `http://localhost:8000/health`. If it does not open, the API or PostgreSQL is not running. Start PostgreSQL, then launch Sanad again.

### The page says “API URL is not configured”

Set this in `frontend/.env`:

```text
VITE_API_URL=/api
```

Restart the frontend after changing any `.env` or Tailwind configuration file.

### The old colors are still visible

Perform a hard refresh with `Ctrl+F5`. If a Tailwind configuration was changed, restart the frontend server because Vite may keep the previous generated CSS in memory.

### Projects or Tasks appears to do nothing

Create or select a workspace first. Tasks also requires a selected project. The application displays a message and takes you to the correct selection screen.

### Another computer cannot connect

Confirm that both computers are on the same network, use the server's IPv4 address instead of `localhost`, keep the server awake, and allow the correct port through the server firewall.

### The launcher cannot find Node.js or Python

The prepared launcher expects Node.js under `C:\Program Files\nodejs` and the Python virtual environment under `backend\venv`. Install the missing dependency or recreate the virtual environment.

## Developer verification

Frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

Docker configuration check:

```powershell
docker compose config
```

While the backend is running, its interactive API documentation is available at `http://localhost:8000/docs` and its generated OpenAPI schema at `http://localhost:8000/openapi.json`.
