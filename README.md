# Bella Luna Inventory - Full Stack Application

## Project Structure

```
bella_luna_inventory/
├── frontend/                 # Vite + React + TypeScript + MUI
│   ├── src/
│   ├── public/
│   └── ...
├── src/                      # Backend (Clean Architecture)
│   ├── domain/              # Entities & Repository Interfaces
│   ├── application/         # Use Cases & DTOs
│   ├── infrastructure/      # Database, Repositories, External Services
│   ├── interface/           # Controllers & Routes
│   └── shared/              # Utils, Errors, Types
├── prisma/                  # Database Schema
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (for database)

### Installation

1. **Clone and install dependencies:**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

2. **Environment Setup:**
```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Update .env with your Supabase credentials
```

3. **Database Setup:**
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Running the Application

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - List all products
- `GET /api/products/low-stock` - List low stock products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - List categories
- `GET /api/suppliers` - List suppliers

## Deployment

### Backend (Vercel)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Connect frontend folder to Vercel
2. Set VITE_API_URL environment variable
3. Deploy

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, MUI, TanStack Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Security**: Helmet, CORS, Zod validation
