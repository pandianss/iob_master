# IOB Governance Platform - Quick Start Guide

## 🚀 Quick Start

### Option 1: One-Click Startup (Recommended)
```powershell
.\start-dev.ps1
```

This script will:
- ✅ Check Docker availability
- ✅ Start/create PostgreSQL database container
- ✅ Run migrations and seed data (if needed)
- ✅ Launch backend and frontend in separate windows

### Option 2: Manual Startup

1. **Start Database**
   ```powershell
   docker start iob-db-v3
   # OR create new:
   docker run --name iob-db-v3 -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=iob_governance -p 5434:5432 -d postgres:15
   ```

2. **Start Backend** (in project root)
   ```powershell
   npm run start:dev
   ```

3. **Start Frontend** (in `client` folder)
   ```powershell
   cd client
   npm run dev
   ```

## 📍 Access Points

- **Frontend (UI)**: http://localhost:5173
- **Backend (API)**: http://localhost:3000
- **Database**: `postgresql://127.0.0.1:5434/iob_governance`

## 🔑 Credentials

**Super User**
- Email: `admin@iob.in`
- Identity: `EMP00000`
- Role: General Manager (Admin Department)

## 🛠️ Useful Commands

### Database
```powershell
# Reset database
docker rm -f iob-db-v3
.\start-dev.ps1  # Will recreate and seed

# View logs
docker logs iob-db-v3

# Connect to database
docker exec -it iob-db-v3 psql -U user -d iob_governance
```

### Backend
```powershell
# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Seed data
npx ts-node prisma/seed.ts
```

## 📚 API Endpoints

### Admin Module (`/admin`)
- `POST /admin/departments` - Create department
- `GET /admin/departments` - List departments
- `POST /admin/designations` - Create designation
- `POST /admin/users` - Create user
- `POST /admin/postings` - Assign posting
- `POST /admin/doa-rules` - Create DoA rule

### Decision Module (`/decisions`)
- `POST /decisions` - Create decision
- `POST /decisions/:id/action` - Perform action (approve/escalate)

### Reporting Module (`/reporting`)
- `GET /reporting/inbox/:identityRef` - Get pending approvals
- `GET /reporting/doa-breaches` - DoA breach heatmap
- `GET /reporting/compliance/:deptCode` - Compliance score

## 🏗️ Project Structure

```
iob/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Initial data
├── src/
│   ├── common/            # Shared services (Prisma)
│   ├── modules/
│   │   ├── admin/         # System administration
│   │   ├── decision/      # Decision lifecycle
│   │   ├── governance/    # DoA, Committee, Compliance
│   │   └── reporting/     # MIS & dashboards
│   └── main.ts
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/    # Shell, Header
│   │   └── pages/         # Inbox, etc.
│   └── vite.config.ts
└── start-dev.ps1          # Startup script
```

## 🎯 Next Steps

1. **Connect UI to Backend**: Replace mock data in `Inbox.tsx` with real API calls
2. **Build Decision Profile View**: Show full lineage and audit trail
3. **Implement Committee Dashboard**: Meeting management and quorum tracking
4. **Add Authentication**: JWT-based auth with role-based access control
