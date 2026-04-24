# Development Setup Guide

This guide will help you set up the PageStash development environment.

## Prerequisites

- **Node.js 18+** and **npm 8+**
- **Git**
- **Supabase account** (free tier is sufficient for development)
- **Chrome/Edge browser** for extension testing

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd pagestash
npm install
```

### 2. Set up Supabase

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and create the project

2. **Get your project credentials**:
   - Go to Settings → API
   - Copy your `Project URL` and `anon public` key

3. **Set up the database**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `docs/database-schema.sql`
   - Run the SQL to create all tables, indexes, and functions

4. **Create storage buckets**:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `screenshots` (public: false)
   - Create a new bucket called `favicons` (public: true)

### 3. Environment Configuration

Create environment files for each app:

**Root `.env.local`:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EXTENSION_ID=your_extension_id_when_loaded
```

**Web App `.env.local` (`apps/web/.env.local`):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Extension environment (`apps/extension/.env`):**
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
WEB_APP_URL=http://localhost:3000
```

### 4. Start Development

```bash
# Start all development servers
npm run dev
```

This will start:
- Web app at `http://localhost:3000`
- Extension build in watch mode

### 5. Load the Extension

1. **Build the extension**:
   ```bash
   cd apps/extension
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `apps/extension/dist` folder

3. **Test the extension**:
   - You should see the PageStash icon in your toolbar
   - Click it to open the popup
   - Try capturing a page

## Project Structure

```
pagestash/
├── apps/
│   ├── extension/          # Browser extension
│   │   ├── src/
│   │   │   ├── background/ # Service worker
│   │   │   ├── content/    # Content scripts
│   │   │   ├── popup/      # Extension popup UI
│   │   │   └── utils/      # Extension utilities
│   │   ├── public/         # Static assets
│   │   └── manifest.json   # Extension manifest
│   └── web/                # Next.js web application
│       ├── src/
│       │   ├── app/        # App router pages
│       │   ├── components/ # React components
│       │   ├── lib/        # Utilities and configs
│       │   └── hooks/      # Custom React hooks
│       └── public/         # Static assets
├── packages/
│   └── shared/             # Shared types and utilities
│       ├── src/
│       │   ├── types/      # TypeScript types
│       │   ├── utils/      # Utility functions
│       │   └── constants/  # App constants
│       └── dist/           # Built package
├── docs/                   # Documentation
└── README.md
```

## Development Workflow

### Making Changes

1. **Shared code changes**: Edit files in `packages/shared/src/`
2. **Web app changes**: Edit files in `apps/web/src/`
3. **Extension changes**: Edit files in `apps/extension/src/`

### Testing Changes

- **Web app**: Changes are hot-reloaded automatically
- **Extension**: Refresh the extension in `chrome://extensions/` after changes

### Building for Production

```bash
# Build all packages
npm run build

# Build specific package
cd apps/web && npm run build
cd apps/extension && npm run build
```

## Common Development Tasks

### Adding a New Database Table

1. Add the table schema to `docs/database-schema.sql`
2. Run the SQL in your Supabase dashboard
3. Add TypeScript types to `packages/shared/src/types/index.ts`
4. Update API endpoints as needed

### Adding a New Shared Type

1. Edit `packages/shared/src/types/index.ts`
2. Build the shared package: `cd packages/shared && npm run build`
3. Use the type in web app or extension

### Debugging the Extension

1. **Background script**: Go to `chrome://extensions/`, find PageStash, click "service worker"
2. **Content script**: Open DevTools on any webpage, check Console
3. **Popup**: Right-click the extension icon → "Inspect popup"

### Database Queries

Use the Supabase dashboard SQL editor to test queries:

```sql
-- Test search function
SELECT * FROM public.search_clips('test query', auth.uid());

-- Check user usage
SELECT * FROM public.user_usage WHERE user_id = auth.uid();
```

## Troubleshooting

### Common Issues

1. **Extension not loading**:
   - Check that `manifest.json` is valid
   - Ensure all referenced files exist in `dist/`
   - Check browser console for errors

2. **Database connection issues**:
   - Verify Supabase URL and keys in `.env.local`
   - Check that RLS policies are correctly set up
   - Ensure user is authenticated

3. **Build errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

### Getting Help

- Check the [Implementation Plan](../IMPLEMENTATION_PLAN.md) for feature details
- Review the [Requirements](../REQUIREMENTS.md) for specifications
- Look at existing code for patterns and examples

## Next Steps

Once you have the development environment running:

1. **Implement core extension functionality** (capture, popup UI)
2. **Build web app authentication** (Supabase Auth)
3. **Create clip library interface** (view saved clips)
4. **Add search functionality** (full-text search)
5. **Implement organization features** (folders, tags)

See the [Implementation Plan](../IMPLEMENTATION_PLAN.md) for detailed task breakdown and priorities.
