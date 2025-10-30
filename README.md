# PageStash 📄

> The most frictionless way to capture, organize, and retrieve web content

PageStash is a powerful browser extension and web application designed for researchers, analysts, and anyone who needs to archive web content reliably. Built with modern web technologies and focused on simplicity and reliability.

## 🚀 Features

### Browser Extension
- **One-click capture** of any webpage
- **Full-page screenshots** with advanced stitching
- **Visible area capture** for quick saves  
- **HTML and text extraction** for searchable content
- **Cross-browser support** (Chrome, Firefox)
- **Offline-first** with automatic sync

### Web Application
- **Powerful dashboard** for managing captures
- **Advanced search** with full-text search
- **Folder organization** with drag-and-drop
- **Tag system** for categorization
- **Note-taking** with text highlighting and excerpts
- **Professional UI** with keyboard shortcuts

### Advanced Features
- **Tabbed content viewer** (Screenshot, HTML, Text)
- **Text highlighting** with note creation
- **Search within content** for HTML and text
- **Auto-save** functionality
- **Responsive design** for all devices
- **Professional keyboard shortcuts**

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful component library

### Backend
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication and user management
- **Supabase Storage** - File storage for screenshots
- **Row Level Security** - Secure data access

### Browser Extension
- **Manifest V3** - Modern extension architecture
- **Webpack** - Module bundling
- **Chrome APIs** - Screenshot and tab management
- **Content Scripts** - Page data extraction
- **Service Worker** - Background processing

### Development
- **Turborepo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
pagestash/
├── apps/
│   ├── extension/          # Browser extension
│   │   ├── src/
│   │   │   ├── background/ # Service worker
│   │   │   ├── content/    # Content scripts
│   │   │   ├── popup/      # Extension popup
│   │   │   └── utils/      # Utilities
│   │   └── manifest.json
│   └── web/               # Next.js web application
│       ├── src/
│       │   ├── app/       # App Router pages
│       │   ├── components/ # React components
│       │   ├── lib/       # Utilities
│       │   └── hooks/     # Custom hooks
│       └── public/
├── packages/
│   └── shared/            # Shared TypeScript types
├── docs/                  # Documentation
└── scripts/              # Build and setup scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone https://github.com/mrmcow/pagestash.git
cd pagestash
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup
```bash
# Run the database schema
npm run setup:database
```

### 5. Start Development
```bash
# Start all applications
npm run dev

# Or start individually
npm run dev:web      # Web app on http://localhost:3000
npm run dev:extension # Extension development
```

### 6. Build Extension
```bash
# Build for development
npm run build:extension

# Build for store submission
npm run build:extension:store

# Create downloadable version
npm run build:extension:download
```

## 📖 Documentation

- **[Development Setup](docs/DEVELOPMENT_SETUP.md)** - Detailed setup instructions
- **[Requirements](docs/REQUIREMENTS.md)** - Project requirements and specifications
- **[Implementation Plan](docs/IMPLEMENTATION_PLAN.md)** - Development roadmap
- **[Brand Design System](docs/BRAND_DESIGN_SYSTEM.md)** - UI/UX guidelines
- **[Installation Guide](docs/INSTALLATION_GUIDE.md)** - Extension installation
- **[Authentication Guide](docs/AUTHENTICATION_TEST_GUIDE.md)** - Testing authentication
- **[Extension Testing](docs/EXTENSION_TESTING_GUIDE.md)** - Testing the extension

## 🎯 Use Cases

### Threat Intelligence Analysts
- Capture suspicious websites with full context
- Extract and analyze HTML source code
- Document findings with timestamped notes
- Search across captured content for indicators

### Researchers
- Archive web pages for citation
- Organize sources by topic and project
- Extract quotes with automatic attribution
- Build comprehensive research databases

### General Users
- Save articles for later reading
- Organize bookmarks with screenshots
- Create visual archives of web content
- Share captures with teams

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                    # Start all apps in development
npm run dev:web               # Start web app only
npm run dev:extension         # Start extension development

# Building
npm run build                 # Build all packages
npm run build:web            # Build web app
npm run build:extension      # Build extension

# Extension specific
npm run build:extension:store     # Build for store submission
npm run build:extension:download  # Create downloadable version

# Database
npm run setup:database       # Initialize database schema
npm run setup:storage       # Setup storage policies

# Linting and formatting
npm run lint                # Lint all packages
npm run format              # Format code
```

### Browser Extension Development

1. **Build the extension:**
   ```bash
   npm run build:extension
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `apps/extension/dist/`

3. **Load in Firefox:**
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `apps/extension/dist/manifest.json`

## 🚀 Deployment

### Web Application
The web app can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- Railway
- Self-hosted

### Browser Extension
- **Chrome Web Store** - Use `npm run build:extension:store`
- **Firefox Add-ons** - Use the same build
- **Direct installation** - Use `npm run build:extension:download`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

- 📧 Email: support@pagestash.com
- 💬 Discord: [Join our community](https://discord.gg/pagestash)
- 🐛 Issues: [GitHub Issues](https://github.com/mrmcow/pagestash/issues)
- 📖 Docs: [Documentation](https://docs.pagestash.com)

---

**Made with ❤️ for researchers, analysts, and web archivists worldwide.**
