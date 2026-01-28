# inventory-docs-portal — Backend

Backend service สำหรับระบบ **Inventory & Documents Portal**  
รองรับการจัดเก็บและแสดงเอกสาร (Datasheet / Manual / Certificate) โดยสามารถใช้ได้ทั้ง:

- **WebDAV (Synology NAS)** ผ่าน HTTP Basic Auth  
- **SMB / NAS** (mount เป็น filesystem)

พัฒนาด้วย **Go + Fiber** และใช้ **PostgreSQL** เป็นฐานข้อมูล

---

## ✨ Features
- Upload เอกสาร (multipart/form-data)
- View เอกสารใน browser (PDF/Image)
- Download เอกสาร
- จัดเก็บ metadata ลง PostgreSQL
- เลือก Storage driver ได้ (SMB / WebDAV)
- รันได้ทั้ง Local และ Docker Compose

---

## 🧱 Tech Stack
- Go 1.22
- Fiber v2
- PostgreSQL 15
- Docker / Docker Compose
- Storage: WebDAV (Synology), SMB (NAS)

---

## 📁 Project Structure
```
backend/
├─ cmd/api/
├─ internal/
│  ├─ config/
│  ├─ db/
│  ├─ http/
│  ├─ modules/documents/
│  ├─ storage/
│  └─ utils/
├─ migrations/
├─ Dockerfile
├─ docker-compose.yml
├─ docker-compose.dev.yml
└─ .env.example
```

---

## ⚙️ Configuration

สร้างไฟล์ `.env` จาก `.env.example` (ห้าม commit ขึ้น git)

### ตัวอย่าง `.env` (WebDAV) — แนะนำ
> หมายเหตุ: ถ้ารันผ่าน Docker Compose ให้ใช้ host เป็น `postgres` (ไม่ใช่ localhost)

```env
APP_NAME=inventory-docs-portal
APP_ENV=dev
HTTP_PORT=8080
MAX_UPLOAD_MB=50

DATABASE_URL=postgres://inventory:inventory@postgres:5432/inventory_docs?sslmode=disable

STORAGE_DRIVER=webdav
WEBDAV_BASE_URL=http://<NAS_HOST>:<PORT>/<PATH>
WEBDAV_USER=<USERNAME>
WEBDAV_PASS=<PASSWORD>
WEBDAV_TIMEOUT_SECONDS=60
```

### ตัวอย่าง `.env` (SMB)
```env
STORAGE_DRIVER=smb
NAS_BASE_PATH=/mnt/nas/afc_docs
DATABASE_URL=postgres://inventory:inventory@postgres:5432/inventory_docs?sslmode=disable
```

---

# 🐳 Run ด้วย Docker Compose (แนะนำ)

## Step 0: เข้าโฟลเดอร์ backend
```bash
cd backend
```

## Step 1: สร้างไฟล์ .env
```bash
cp .env.example .env
# แล้วแก้ค่าใน .env ให้ครบ โดยเฉพาะ DATABASE_URL และ WEBDAV_*
```

## Step 2: Start ทั้งระบบ (API + Postgres)
```bash
docker compose up --build
```

## Step 3: Health check
```bash
curl http://localhost:8080/health
# expected: ok
```

## Step 4: Upload ทดสอบ
> หากไม่มีไฟล์ pdf ให้ใช้ test.txt ได้

```bash
echo "hello" > test.txt

curl -X POST http://localhost:8080/api/documents   -F "sku=ABC123"   -F "docType=datasheet"   -F "version=v1"   -F "file=@test.txt"
```

## Step 5: View / Download
แทน `{id}` ด้วย id ที่ได้จาก upload

- View:
  ```
  GET http://localhost:8080/api/documents/{id}/view
  ```
- Download:
  ```
  GET http://localhost:8080/api/documents/{id}/download
  ```

---

# ▶️ Run Local (Dev)

## Option A: รัน DB ด้วย Docker แล้วรัน Go บนเครื่อง
1) Start Postgres:
```bash
cd backend
docker compose -f docker-compose.dev.yml up -d
```

2) ตั้ง `.env` ให้ `DATABASE_URL` ชี้ไป localhost:
```env
DATABASE_URL=postgres://inventory:inventory@localhost:5432/inventory_docs?sslmode=disable
```

3) รัน API:
```bash
go run ./cmd/api
```

4) Health check:
```bash
curl http://localhost:8080/health
```

> หมายเหตุ: ถ้าเครื่องคุณไม่มี Go 1.22 ให้ใช้ Docker Compose แทน (แนะนำ)

---

## 🧪 API Examples

### Upload
```bash
curl -X POST http://localhost:8080/api/documents   -F "sku=ABC123"   -F "docType=datasheet"   -F "version=v1"   -F "file=@test.pdf"
```

### View
```
GET /api/documents/{id}/view
```

### Download
```
GET /api/documents/{id}/download
```

---

## 🗄️ Database
- PostgreSQL
- Migrations รันอัตโนมัติจาก `migrations/` ตอน API start

เช็คข้อมูลล่าสุด (optional):
```bash
docker exec -it inventory-docs-postgres psql -U inventory -d inventory_docs   -c "select id, sku, type, version, file_key, created_at from documents order by created_at desc limit 5;"
```

---

## 🔐 Security Notes
- ห้าม commit `.env` หรือ credentials
- ใช้ service account สำหรับ NAS/WebDAV
- Backend เป็น proxy ไม่ expose path จริงให้ frontend

---

## 🧩 Troubleshooting

### 1) `no configuration file provided: not found`
คุณรัน `docker compose` ในโฟลเดอร์ที่ไม่มี compose file  
ให้ `cd backend` ก่อน หรือใช้ `-f backend/docker-compose.yml`

### 2) `Cannot connect to the Docker daemon ... docker.sock`
Docker Desktop ยังไม่ running → เปิด Docker Desktop แล้วลองใหม่

### 3) WebDAV `403 Forbidden` ตอน upload
- ตรวจว่า WebDAV path มีสิทธิ์เขียนจริง
- บางโฟลเดอร์อนุญาตเขียนเฉพาะ root และบล็อก subfolder  
  (โปรเจกต์นี้รองรับ “flat fileKey” สำหรับ WebDAV ได้)

### 4) macOS: `mounts denied ... path is not shared`
ถ้าใช้ SMB และ mount path จาก host → ต้องแชร์ path ใน Docker Desktop:
Docker Desktop → Settings → Resources → File Sharing  
หรือใช้ WebDAV (แนะนำ) จะไม่ต้อง mount

---

## 🚀 Next Steps
- Auth / JWT
- RBAC
- Products & Locations module
- Document approval & audit log
- List/Search API (`GET /api/documents?sku=...`)
