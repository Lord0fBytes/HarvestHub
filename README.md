# HarvestHub

A Progressive Web Application (PWA) for managing grocery lists. Designed to be mobile-friendly for use while shopping.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Type**: Progressive Web App (PWA)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: None - publicly accessible
- **ORM**: TBD (Drizzle or Prisma)
- **Deployment**: Vercel

## Version Roadmap

### Version 0.1.0 - Foundation & Basic Items
- Basic item CRUD operations (create, read, update, delete)
- Simple list view with core properties
- Item properties: name, quantity, unit of measure, status
- In-memory state management (no persistence yet)

### Version 0.2.0 - Item Organization
- Tagging system implementation
- Add store and aisle/row properties
- Basic filtering by tags
- Sort functionality

### Version 0.3.0 - Full List Page
- Complete master list view
- Advanced filtering (by store, tags, status)
- Search functionality
- Bulk operations (mark multiple as purchased, delete, etc.)

### Version 0.4.0 - Planning Page (List Building)
- List building interface
- Add items to current shopping list
- Quick add functionality
- List organization and grouping

### Version 0.5.0 - Ordering Page (Shopping Mode)
- Shopping-optimized view organized by store aisles
- Check off items as you shop
- Mobile-first, touch-friendly interface
- Quick navigation between aisles

### Version 0.6.0 - Review Page
- Post-shopping review interface
- Mark items as purchased vs skipped
- Note substitutions or price changes
- Shopping trip history/summary

### Version 0.7.0 - Database & Persistence
- Supabase integration
- Database schema implementation
- ORM setup (Drizzle or Prisma decision)
- Data persistence across sessions

### Version 0.8.0 - PWA Features
- Progressive Web App manifest
- Offline support for in-store use
- Install prompt for home screen
- Service worker for caching

### Version 0.9.0 - Public API & Polish
- Public API endpoints for Claude/AI access
- UI/UX refinements based on usage
- Performance optimization
- Mobile responsiveness polish

### Version 1.0.0 - Production Launch
- Final testing and bug fixes
- Documentation
- Deployment to Vercel
- Production ready

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
