# HarvestHub

A Progressive Web Application (PWA) for managing grocery lists. Designed to be mobile-friendly for use while shopping.

> **🤖 Built with Claude Code**
> This project is developed using [Claude Code](https://claude.com/claude-code), an AI-powered coding assistant. All code updates are reviewed by a human before being pushed to production.

## Features

- 📱 **Mobile-First Design** - Optimized for use while shopping
- 🔄 **Real-time Sync** - Powered by Supabase for persistent data
- 📝 **Smart Planning** - Organize items by tags, stores, and aisles
- 🛒 **Shopping Mode** - Mark items as purchased with swipe gestures
- 📊 **Review & Complete** - Track and complete your shopping trips
- 🐳 **Docker Ready** - Easy deployment with Docker support

## Current Status

**Version 1.0.0** - First Release with Docker Support ✅

See the full [Version Roadmap](ROADMAP.md) for upcoming features.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Type**: Progressive Web App (PWA)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: None - publicly accessible
- **ORM**: TBD (Drizzle or Prisma)
- **Deployment**: Vercel

## Getting Started

### Local Development

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Docker Deployment

HarvestHub can be deployed using Docker for production environments.

#### Prerequisites
- Docker installed on your system
- Docker Compose (optional, but recommended)

#### Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can use `.env.example` as a template.

#### Using Docker Compose (Recommended)

```bash
# Build and run the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### One-time Supabase data migration

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

#### Using Docker CLI

```bash
# Build the image
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key \
  -t harvesthub .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key \
  harvesthub
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
