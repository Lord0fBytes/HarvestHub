# HarvestHub

> **⚠️ Early Development Warning**
> This project is in active early development and is **not yet fully functional**. Features are being implemented incrementally. See the [Roadmap](ROADMAP.md) for planned features and current progress.

A Progressive Web Application (PWA) for managing grocery lists. Designed to be mobile-friendly for use while shopping.

## Current Status

**Version 0.3.0** - Full List Page with Navigation ✅

Completed features:
- ✅ **Version 0.1.0** - Foundation & Basic Items
  - Basic CRUD operations for grocery items
  - In-memory state management
  - Mobile-first UI
- ✅ **Version 0.2.0** - Item Organization
  - Tagging system with multi-tag support
  - Store and aisle properties
  - Filtering by tags and store
  - Sort functionality (name, store, aisle, date)
- ✅ **Version 0.3.0** - Full List Page
  - Advanced filtering (tags, store, status)
  - Search functionality across all fields
  - Bulk operations (select, mark as purchased, delete)
  - Statistics dashboard
  - Modal-based add/edit forms
  - Responsive navigation (sidebar + bottom nav)
  - Multi-page structure (Planning, Shopping, Review, All Items)

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

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
