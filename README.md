# HarvestHub

HarvestHub is a mobile-first Progressive Web App for planning, shopping for, and reviewing grocery lists. It runs against a self-hosted PostgreSQL database and is designed to stay quick and usable while you are in the store.

## Current release

**v1.2.2 — Shopping Workflow Hotfixes**

This source release adds a clear button and responsive layout for Planning search, pull-to-refresh on mobile, and Review completion for both purchased and skipped items. See the [Gitea release notes](https://gitea.massedonia.com/lordofbytes/HarvestHub/releases/tag/v1.2.2) for the full summary. The deployment image remains pinned to v1.2.1 until a v1.2.2 image is verified.

## Features

- **Plan your shop** — Search and filter the master list by type or tag, then add an item to the current cart. The same control removes it if added by mistake.
- **Shopping mode** — Work through pending items by store and aisle, mark them purchased, undo a purchase, or swipe to skip an item on mobile.
- **Review & complete** — Review pending, purchased, and skipped totals; complete a trip to clear purchased and skipped statuses while leaving pending items alone.
- **All items** — Maintain the master list, including item names, type, stores, aisle, tags, and status.
- **Mobile-first PWA** — Responsive desktop and mobile navigation, install support, and a layout tuned for quick use on a phone. Offline shopping is not currently supported.
- **PostgreSQL-backed** — Item data is persisted in PostgreSQL, with Docker Compose for deployment and a backup script for routine maintenance.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL 17
- **Data access:** `pg`
- **PWA:** `@ducanh2912/next-pwa`
- **Container runtime:** Docker and Docker Compose

## Getting started

### Local development

Install dependencies, configure a PostgreSQL connection, and start the development server:

```bash
npm install
DATABASE_URL='postgresql://harvesthub:your-password@127.0.0.1:15432/harvesthub' npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The example assumes an SSH tunnel that exposes PostgreSQL on local port `15432`. Use the host, port, user, password, and database that apply to your own PostgreSQL instance. You can instead place `DATABASE_URL` in `.env.local`; do not commit that file.

For the production build used to verify changes locally:

```bash
npm run build
```

### Docker deployment

#### Prerequisites

- Docker
- Docker Compose

#### Environment variables

Copy the template, then choose a strong database password:

```bash
cp .env.example .env
```

```bash
POSTGRES_PASSWORD=choose-a-strong-password
HARVESTHUB_IMAGE=ghcr.io/lord0fbytes/harvesthub:1.2.1
```

Docker Compose passes this password to PostgreSQL and constructs the application's internal `DATABASE_URL` automatically. The application image is pinned to the release tag shown above. Omit `HARVESTHUB_IMAGE` to use the same default.

The v1.2.1 deployment image is hosted at `ghcr.io/lord0fbytes/harvesthub`. New images are configured to publish to the Gitea Container Registry at `gitea.massedonia.com/lordofbytes/harvesthub`.

#### Start the stack

```bash
# Pull and run the pinned application image and database
docker compose pull harvesthub
docker compose up -d

# View logs
docker compose logs -f

# Stop the stack
docker compose down
```

The application is available at [http://localhost:3100](http://localhost:3100). PostgreSQL is bound to `127.0.0.1:5433` on the Docker host and is not exposed to the network.

### Updating the application image

Docker Compose defaults to the GHCR image for v1.2.1. Before switching, confirm that the Gitea image exists. Then set `HARVESTHUB_IMAGE=gitea.massedonia.com/lordofbytes/harvesthub:1.2.2` in `.env` and run:

```bash
docker compose pull harvesthub
docker compose up -d --no-deps harvesthub
```

### Publishing release images

The release workflow is in `.gitea/workflows/publish-container.yml`. It builds the Git tag associated with a published Gitea release and pushes versioned and `latest` tags to the Gitea Container Registry. It can also be started manually with a `tag` input, such as `v1.2.2`.

Publishing requires a Gitea Actions runner with an `ubuntu-latest` label and Docker build support. Add a personal access token for `lordofbytes` with package read/write permission as the repository Actions secret `REGISTRY_TOKEN`. Gitea's built-in job token cannot publish OCI images. Check that the workflow succeeded and the versioned image exists before changing the deployment image pin.

### One-time Supabase migration

The `postgres-migration` branch can copy the existing `grocery_items` data from Supabase into the self-hosted PostgreSQL database. Supabase must be resumed long enough for the migration to connect.

1. Deploy and start the new stack first.
2. Run a dry run from the running HarvestHub container:

   ```bash
   docker compose exec -e SUPABASE_DATABASE_URL='your-supabase-postgres-connection-string' harvesthub npm run migrate:supabase
   ```

3. If the item count is correct, repeat with `--apply`:

   ```bash
   docker compose exec -e SUPABASE_DATABASE_URL='your-supabase-postgres-connection-string' harvesthub npm run migrate:supabase -- --apply
   ```

The migration preserves IDs and timestamps, only inserts records that are not already present, and never overwrites local records. Remove the Supabase connection string from the deployment environment when finished.

### PostgreSQL backups

Create a timestamped, compressed database backup with:

```bash
./scripts/backup-postgres.sh
```

Backups are written to `/data/backups/harvesthub` by default. Set `BACKUP_DIR` before running the command to use a different location.

## Health check

When the application is running, `GET /api/health` returns `{ "status": "ok" }` and can be used by a reverse proxy or uptime monitor.
