# inventory-docs-portal

Internal web application for managing:
- Product master data
- Inventory locations (warehouse / zone / rack / bin)
- Technical documents and datasheets stored on NAS (SMB)

## Key Features
- Product & location mapping
- Datasheet upload with versioning
- NAS (SMB) file streaming (view / download)
- Role-based access control
- Audit logs

## Tech Stack
- Frontend: React
- Backend: Go Fiber / .NET
- Database: PostgreSQL
- Storage: Windows SMB NAS
