# HarvestHub Version Roadmap

This document outlines the planned features and releases for HarvestHub, from basic functionality through production launch.

## Version 0.1.0 - Foundation & Basic Items ✅

- Basic item CRUD operations (create, read, update, delete)
- Simple list view with core properties
- Item properties: name, quantity, unit of measure, status
- In-memory state management (no persistence yet)

## Version 0.2.0 - Item Organization ✅

- ✅ Tagging system implementation (multi-tag support)
- ✅ Add store and aisle/row properties
- ✅ Basic filtering by tags
- ✅ Sort functionality (name, store, aisle, date added)
- ✅ Enhanced ItemForm with new fields
- ✅ Tag badges with visual feedback

## Version 0.3.0 - Full List Page ✅

- ✅ Complete master list view
- ✅ Advanced filtering (by store, tags, status)
- ✅ Search functionality (name, store, aisle, tags)
- ✅ Bulk operations (select all, mark as purchased, delete multiple)
- ✅ Statistics dashboard (total, pending, purchased, skipped)
- ✅ Modal-based add/edit forms (cleaner UI)
- ✅ Responsive navigation system:
  - Desktop: Left sidebar navigation
  - Mobile: Bottom navigation bar
- ✅ Multi-page structure with placeholders:
  - Planning page (home)
  - Shopping page
  - Review page
  - All Items page (full featured)
- ✅ Sample data loading for testing

## Version 0.4.0 - Planning Page & Data Model Enhancements ✅

- ✅ Planning page with search functionality
- ✅ Quick-add items to shopping list (sets status to pending)
- ✅ Visual feedback for items already on list
- ✅ Supabase database integration (persistent data)
- ✅ Item type classification (grocery/supply/clothing/other)
- ✅ Multiple stores per item (stores array)
- ✅ Null status support for master list items
- ✅ Enhanced ItemForm with type and stores fields
- ✅ Type filter and sort in All Items page
- ✅ Database migrations with indexes

## Version 0.5.0 - Ordering Page (Shopping Mode)

- Shopping-optimized view organized by store aisles
- Check off items as you shop
- Mobile-first, touch-friendly interface
- Quick navigation between aisles

## Version 0.6.0 - Review Page

- Post-shopping review interface
- Mark items as purchased vs skipped
- Note substitutions or price changes
- Shopping trip history/summary

## Version 0.7.0 - Advanced Features

- Recipe integration
- Meal planning functionality
- Shopping trip history
- ORM refinements (if needed)

## Version 0.8.0 - PWA Features

- Progressive Web App manifest
- Offline support for in-store use
- Install prompt for home screen
- Service worker for caching

## Version 0.9.0 - Public API & Polish

- Public API endpoints for Claude/AI access
- UI/UX refinements based on usage
- Performance optimization
- Mobile responsiveness polish

## Version 1.0.0 - Production Launch

- Final testing and bug fixes
- Documentation
- Deployment to Vercel
- Production ready
