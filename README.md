# BioLab Consulting - Enterprise Management Platform

Piattaforma gestionale enterprise completa per BioLab Consulting, società di consulenza per certificazioni biologiche agricole in Alto Adige/Sud Tirolo.

## 🚀 Features Implementate

### ✅ Core Infrastructure
- **Turborepo** monorepo con workspace modulari
- **Next.js 14** con App Router e TypeScript
- **Tailwind CSS** + shadcn/ui per UI components
- **Prisma ORM** con PostgreSQL database
- **tRPC** per end-to-end type safety
- **NextAuth.js** con multi-provider authentication

### ✅ Moduli Funzionanti

#### 1. **CRM Avanzato**
- Dashboard con statistiche real-time
- Gestione clienti completa (CRUD)
- Status tracking (Lead, Prospect, Active, etc.)
- Lead scoring
- Assegnazione consulenti
- Conteggio documenti e certificazioni per cliente

#### 2. **Document Management**
- Lista documenti con filtri
- Upload/download documenti
- Associazione a clienti
- Sistema di cartelle
- Versioning documenti
- Metadata e tag

#### 3. **Task Management**
- Board Kanban (To Do, In Progress, Done)
- Priorità task (Low, Medium, High, Urgent)
- Assegnazione utenti
- Due dates
- Descrizioni e note

#### 4. **Dashboard Analytics**
- Statistiche clienti attivi/totali
- Conteggio certificazioni
- Task pendenti
- Attività recenti
- Revenue tracking

#### 5. **Authentication & Security**
- Login con credenziali
- Google OAuth
- Session management
- Protected routes
- Role-based access control (RBAC) preparato

## 📁 Struttura Progetto

```
biolab-platform/
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/         # Login/Register
│       │   │   ├── (dashboard)/    # Dashboard pages
│       │   │   │   ├── clients/
│       │   │   │   ├── documents/
│       │   │   │   ├── tasks/
│       │   │   │   └── dashboard/
│       │   │   ├── api/
│       │   │   │   ├── auth/       # NextAuth
│       │   │   │   └── trpc/       # tRPC handler
│       │   │   └── page.tsx        # Homepage
│       │   ├── components/
│       │   │   └── dashboard/      # Dashboard components
│       │   └── lib/
│       │       └── trpc/           # tRPC client
│       ├── package.json
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── packages/
│   ├── database/            # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── index.ts
│   │   └── seed.ts
│   │
│   ├── api/                 # tRPC routers
│   │   ├── routers/
│   │   │   ├── client.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── document.ts
│   │   │   └── task.ts
│   │   └── index.ts
│   │
│   ├── auth/                # NextAuth configuration
│   │   └── index.ts
│   │
│   ├── ui/                  # Shared UI components
│   │   ├── components/
│   │   └── lib/utils.ts
│   │
│   └── config/              # Shared configs
│
├── package.json
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database
- (Optional) Redis for caching

### 1. Clone & Install

```bash
cd big-project-1
pnpm install
```

### 2. Database Setup

```bash
# Copy environment variables
cp .env.example .env

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/biolab"

# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed database with sample data
pnpm db:seed
```

### 3. Environment Variables

Create `.env` in root and update:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/biolab"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

### 5. Login Credentials

**Demo Account:**
- Email: `admin@biolab-consulting.com`
- Password: `admin123`

**Other test accounts:**
- Consultant: `marco.rossi@biolab-consulting.com` / `consultant123`
- Consultant: `anna.mueller@biolab-consulting.com` / `consultant123`

## 📊 Database Schema

Il database include tabelle per:

- **Users** - Utenti con role (Admin, Consultant, Client, Manager)
- **Clients** - Aziende agricole clienti
- **Certifications** - Certificazioni biologiche
- **Documents** - Gestione documenti
- **Tasks** - Task management
- **Inspections** - Sopralluoghi
- **Quotes** - Preventivi
- **Contracts** - Contratti
- **Invoices** - Fatture
- **Timesheets** - Timesheet consulenti
- **Messages** - Messaggistica
- **Notifications** - Notifiche
- **Articles** - Knowledge base
- **Activities** - Activity log

## 🚀 Deploy to Vercel

### Quick Deploy

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Configuration

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy!

**Environment variables needed:**
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- OAuth credentials (if using)

## 📦 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm lint             # Lint code
pnpm type-check       # TypeScript check
pnpm format           # Format with Prettier

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to DB
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
```

## 🔧 Next Steps & Extensions

### Moduli Pronti per Implementazione

Il database schema è completo e supporta i seguenti moduli aggiuntivi:

1. **AI Compliance Assistant** - Chatbot con RAG su normative
2. **Sistema Preventivazione Automatica** - Wizard preventivi
3. **Gestione Sopralluoghi** - Mobile-first inspection tool
4. **Timesheet & Fatturazione** - Tracciamento ore e invoicing
5. **Client Portal** - Portale clienti con chat
6. **Marketing Automation** - Email campaigns e lead nurturing
7. **Knowledge Base** - Wiki normative bio
8. **Multi-language (IT/DE/EN)** - Sistema i18n
9. **Advanced Reporting** - Dashboard analytics avanzate
10. **Integrations** - Google, WhatsApp, Stripe, etc.

### Per Aggiungere un Nuovo Modulo

1. **Creare il router tRPC**
   ```typescript
   // packages/api/routers/newmodule.ts
   export const newModuleRouter = router({
     list: protectedProcedure.query(async ({ ctx }) => {
       return ctx.prisma.yourModel.findMany();
     }),
   });
   ```

2. **Aggiungere al router principale**
   ```typescript
   // packages/api/index.ts
   export const appRouter = router({
     // ...existing
     newModule: newModuleRouter,
   });
   ```

3. **Creare la pagina**
   ```typescript
   // apps/web/src/app/(dashboard)/newmodule/page.tsx
   export default function NewModulePage() {
     const { data } = trpc.newModule.list.useQuery();
     return <div>{/* Your UI */}</div>;
   }
   ```

4. **Aggiungere alla sidebar**
   ```typescript
   // apps/web/src/components/dashboard/sidebar.tsx
   { icon: Icon, label: "New Module", href: "/newmodule" }
   ```

## 🎨 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- React Hook Form
- Zod validation

### Backend
- Next.js API Routes
- tRPC
- Prisma ORM
- NextAuth.js
- PostgreSQL

### DevOps
- Turborepo
- pnpm workspaces
- ESLint
- Prettier
- Husky

## 📝 API Examples

### tRPC Usage

```typescript
// List clients
const { data } = trpc.client.list.useQuery({ limit: 10 });

// Create client
const createClient = trpc.client.create.useMutation();
await createClient.mutateAsync({
  companyName: "Azienda Test",
  email: "test@example.com",
  contactPerson: "Mario Rossi",
});

// Update client
const updateClient = trpc.client.update.useMutation();
await updateClient.mutateAsync({
  id: "client-id",
  status: "ACTIVE",
});
```

## 🔐 Security

- ✅ NextAuth.js authentication
- ✅ CSRF protection
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ HTTPS enforced in production
- ✅ Environment variables for secrets
- ✅ Role-based access control ready
- ✅ Audit logging implementato

## 📱 PWA Support

La piattaforma è pronta per essere convertita in PWA:
- Service Worker config pronto
- Manifest.json da aggiungere
- Offline-first strategy implementabile

## 🌍 Internazionalizzazione

Schema preparato per IT/DE/EN:
- Database supporta `locale` field
- Articles/Categories multi-lingua
- next-intl pronto per integrazione

## 📄 License

Proprietary - BioLab Consulting © 2024

## 🤝 Contributing

Per contribuire al progetto:
1. Creare feature branch
2. Implementare modifiche
3. Test completi
4. Pull request per review

## 📞 Support

Per supporto tecnico contattare il team di sviluppo.

---

**Sviluppato con ❤️ per BioLab Consulting - Alto Adige/South Tyrol**
