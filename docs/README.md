# PagePouch 📎

> The most frictionless way to capture, organize, and retrieve web content

PagePouch is a browser extension and web application designed for analysts, researchers, and knowledge workers who need to reliably archive web content with zero friction and maximum searchability.

## 🎯 Vision

Create the go-to tool for threat intelligence analysts and researchers who need to capture web content with perfect fidelity and find it instantly when needed.

## ✨ Features

### Browser Extension
- **One-click capture** - Save any webpage with a single click
- **Full-page screenshots** - Perfect visual fidelity with scroll stitching
- **Complete HTML archival** - Preserve the exact content you saw
- **Smart metadata** - Automatic URL, title, timestamp, and favicon collection
- **Quick organization** - Add to folders and tag content before saving

### Web Application
- **Visual library** - Browse your clips with screenshot previews
- **Powerful search** - Find content across all saved HTML and notes
- **Flexible organization** - Folders, tags, and notes for perfect organization
- **Team collaboration** - Share clips and collaborate with your team
- **Export capabilities** - Export in multiple formats for reporting

## 🏗️ Architecture

This is a monorepo containing:

- `apps/extension/` - Browser extension (Chrome, Edge, Firefox)
- `apps/web/` - Next.js web application
- `packages/shared/` - Shared utilities and types
- `docs/` - Documentation and guides

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- Supabase account

### Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd pagepouch
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- Web app at `http://localhost:3000`
- Extension development build in `apps/extension/dist/`

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select `apps/extension/dist/`

## 📋 Development Status

See our [Implementation Plan](./IMPLEMENTATION_PLAN.md) for detailed development phases and current progress.

### Current Phase: MVP Foundation
- [x] Project structure and setup
- [ ] Database schema implementation
- [ ] Basic extension functionality
- [ ] Web app foundation
- [ ] Authentication system

## 🛠️ Tech Stack

- **Extension**: TypeScript + Manifest V3
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Auth + Storage)
- **Search**: Postgres Full-Text Search
- **Deployment**: Vercel + Supabase

## 📖 Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Detailed development roadmap
- [Requirements](./REQUIREMENTS.md) - Original requirements and specifications
- [API Documentation](./docs/api.md) - API endpoints and usage
- [Extension Guide](./docs/extension.md) - Extension development guide

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🎯 Roadmap

### Phase 1: MVP (Weeks 1-4)
- Core capture functionality
- Basic web app
- Authentication
- Simple search

### Phase 2: Enhanced Features (Weeks 5-8)
- Advanced search
- Team collaboration
- UI/UX polish
- Performance optimization

### Phase 3: Scale & Launch (Weeks 9-12)
- Monetization
- Marketing site
- Chrome Web Store launch
- User onboarding

---

Built with ❤️ for analysts and researchers who deserve better tools.
