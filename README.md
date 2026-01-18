# FindEg.com - Modern E-commerce Platform

FindEg.com is a modern, trendy e-commerce web application specializing in stationary, kids' toys, and school supplies. Built with Next.js 16, clean architecture principles, and a focus on great UI/UX.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Docker** (for database)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 27-10-2025ecommerceV2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Start PostgreSQL in Docker
   npm run db:start
   
   # Push database schema
   npm run db:push
   
   # (Optional) Seed with sample data
   npm run db:seed
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Database Setup

This project uses **Docker** to run a PostgreSQL database for development, making it easy to get started without installing PostgreSQL locally.

### Database Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start Database** | `npm run db:start` | Starts the PostgreSQL container and waits for it to be ready |
| **Stop Database** | `npm run db:stop` | Stops the PostgreSQL container |
| **Reset Database** | `npm run db:reset` | ⚠️ **Deletes all data** and creates a fresh database |
| **View Logs** | `npm run db:logs` | Shows database container logs (useful for debugging) |
| **Push Schema** | `npm run db:push` | Pushes your Drizzle schema to the database |
| **Generate Migration** | `npm run db:generate` | Generates migration files from schema changes |
| **Run Migrations** | `npm run db:migrate` | Runs pending database migrations |
| **Open Studio** | `npm run db:studio` | Opens Drizzle Studio to browse/edit database |
| **Seed Database** | `npm run db:seed` | Populates database with sample data |

### Why Use These Scripts?

- **`db:start`** - Your first step! Starts PostgreSQL in Docker so your app can connect to a database
- **`db:push`** - After starting the database, this creates all your tables based on your schema
- **`db:seed`** - Adds sample products, categories, and users so you can test the app immediately
- **`db:stop`** - Stops the database when you're done (saves system resources)
- **`db:reset`** - Use when you want to start fresh or if your database gets into a bad state
- **`db:logs`** - Check if database is having issues or to see query logs
- **`db:studio`** - Visual interface to see and edit your data (like phpMyAdmin for PostgreSQL)

### Database Connection Details

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `findeg_dev`
- **User:** `findeg_user`
- **Password:** `findeg_dev_password`
- **Connection String:** `postgresql://findeg_user:findeg_dev_password@localhost:5432/findeg_dev`

> **Note:** These credentials are already configured in `.env.local`. The database URL is automatically set when you run `npm run db:start`.

### Troubleshooting Database Issues

**Port 5432 already in use?**
```bash
# Option 1: Stop your local PostgreSQL
brew services stop postgresql

# Option 2: Change port in docker-compose.yml
# Change "5432:5432" to "5433:5432" and update .env.local
```

**Database won't start?**
```bash
# Check if Docker is running
docker info

# View container status
docker-compose ps

# Check logs for errors
npm run db:logs
```

**Need to access database directly?**
```bash
docker-compose exec postgres psql -U findeg_user -d findeg_dev
```

For more details, see [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)

---

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router (Routes & Pages)
├── domain/                 # Business Entities & Logic
│   ├── entities/          # Product, Cart, User entities
│   └── types/             # Domain type definitions
├── application/            # Application Services & Use Cases
│   ├── services/          # Business logic services
│   └── repositories/      # Repository interfaces
├── infrastructure/         # External Concerns
│   ├── database/          # Drizzle ORM & PostgreSQL
│   ├── repositories/      # Database repository implementations
│   └── config/            # Configuration files
├── presentation/           # UI Layer
│   ├── components/
│   │   ├── server/        # Server Components (default)
│   │   ├── client/        # Client Components (interactive)
│   │   └── ui/            # UI primitives (shadcn-style)
│   ├── hooks/             # React hooks
│   └── providers/         # Context providers
└── lib/                    # Utilities & Constants
```

### Key Architecture Decisions

**Server Components by Default**
- Pure UI components are Server Components (no `'use client'`)
- Faster initial page loads
- Better SEO
- Direct service calls (no hooks needed)

**Client Components for Interactivity**
- Only use `'use client'` when needed (forms, animations, browser APIs)
- Hooks and state management
- Event handlers and user interactions

**Clean Architecture Layers**
- **Domain:** Business logic, independent of frameworks
- **Application:** Use cases and service orchestration
- **Infrastructure:** Database, external APIs, file system
- **Presentation:** UI components and user interaction

---

## 📂 Project Structure

### Component Organization (Atomic Design)

```
presentation/components/
├── server/                 # Server Components
│   ├── atoms/             # Basic building blocks (Button, Icon, Badge)
│   ├── molecules/         # Simple combinations (ProductCard, CategoryCard)
│   ├── organisms/         # Complex sections (Header, Footer, ProductGrid)
│   ├── templates/         # Page templates (HomePage, ShopTemplate)
│   └── layout/            # Layout components (Container, Grid)
│
└── client/                # Client Components
    ├── atoms/             # Interactive atoms (Input, QuantityInput)
    ├── molecules/         # Interactive molecules (FilterSidebar, Pagination)
    └── organisms/         # Interactive organisms (CartDrawer, Chatbot)
```

**Atomic Design Principles:**
- **Atoms:** Smallest units, no dependencies (Button, Icon, Badge)
- **Molecules:** Groups of atoms (ProductCard = Image + Title + Price + Button)
- **Organisms:** Complex sections (Header = Logo + Nav + Search + Cart)
- **Templates:** Page-level structures with layout

---

## 🎨 Styling & Theming

- **Tailwind CSS:** Utility-first CSS framework
- **CSS Variables:** Theme colors defined in `app/globals.css`
- **Dark Mode:** Automatic theme switching support
- **`cn` Utility:** Helper function in `lib/utils.ts` for conditional classes

**Example:**
```tsx
<div className={cn(
  "bg-primary text-white", 
  isActive && "font-bold"
)}>
```

---

## 🌍 Internationalization (i18n)

- **Supported Languages:** English (`en`), Arabic (`ar`)
- **RTL Support:** Automatic right-to-left layout for Arabic
- **Translation Hook:** `useTranslation()` for client components
- **Static Translations:** Stored in `lib/i18n.ts`

**Usage:**
```tsx
const { t } = useTranslation();
<h1>{t('welcome_message')}</h1>
```

---

## 🛠️ Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | Start dev server (auto-kills port 3000 if busy) |
| **Build** | `npm run build` | Create production build |
| **Start** | `npm run start` | Run production server |
| **Lint** | `npm run lint` | Run ESLint |

---

## 📚 Documentation

- **[Database Setup](docs/DATABASE_SETUP.md)** - Complete database guide
- **[Architecture Layers](docs/architecture/)** - Detailed layer documentation
- **[Cleanup Summary](docs/CLEANUP_SUMMARY.md)** - Recent codebase cleanup
- **[Implementation Status](docs/IMPLEMENTATION_STATUS.md)** - Migration progress
- **[Project Summary](PROJECT_SUMMARY.md)** - High-level overview
- **[Migration Plan](MIGRATION_PLAN.md)** - Complete migration strategy

---

## 🔑 Key Features

### E-commerce Functionality
- Product browsing with categories
- Advanced filtering and search
- Shopping cart with variants
- Product reviews and ratings
- Wishlist management
- Checkout process

### Technical Features
- **Server-Side Rendering (SSR)** - Fast initial page loads
- **Static Site Generation (SSG)** - Pre-rendered pages
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Optimized bundle sizes
- **TypeScript** - Full type safety
- **Clean Architecture** - Maintainable and testable code

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 📝 Contributing

1. **Follow Atomic Design** - Place components in correct folders
2. **Server Components First** - Only use Client Components when needed
3. **Type Everything** - Define interfaces for all props
4. **Use Constants** - Store mock data in `lib/constants.ts`
5. **Extract Logic** - Create hooks for reusable logic

---

## ❓ FAQ

**Q: Why `npm run dev` instead of `next dev`?**  
A: Our custom script (`scripts/dev.js`) automatically kills any process using port 3000 before starting the server.

**Q: Where is the actual page code?**  
A: Page templates are in `src/presentation/components/server/templates/`. The `app/` directory just imports them.

**Q: How do I add a new page?**  
A: Create a template in `src/presentation/components/server/templates/`, then import it in the corresponding `app/*/page.tsx` file.

**Q: Database not connecting?**  
A: Make sure you've run `npm run db:start` and that Docker is running. Check `.env.local` has the correct `DATABASE_URL`.

**Q: How do I change colors?**  
A: Edit CSS variables in `app/globals.css` or update `tailwind.config.js`.

**Q: What's the difference between Server and Client components?**  
A: Server Components render on the server (no `'use client'`), Client Components run in the browser (have `'use client'` directive).

---

## 📄 License

This project is private and proprietary.

---

## 👥 Team

**FindEg Team** - Building the future of e-commerce in Egypt 🇪🇬