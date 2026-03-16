# ENGSE207 – Final Lab Set 1
## Secure Microservices Task Management System

### รายชื่อสมาชิก
- 67543210004-7 นายพิชิรกร ชาติปิระ
- 67543210041-9 นายพัชรพล  สืบทายาท

---

# 1. ภาพรวมของระบบ (System Overview)

ระบบนี้เป็น **Task Management System** ที่พัฒนาด้วยสถาปัตยกรรมแบบ Microservices  
โดยมีการใช้ HTTPS เพื่อความปลอดภัยของการสื่อสาร ใช้ JWT สำหรับการยืนยันตัวตน และมีระบบ Logging สำหรับบันทึกการใช้งานของระบบ

ผู้ใช้สามารถ
- สมัครสมาชิกและ login
- สร้าง task
- ดู task ของตนเอง
- ลบ task

ผู้ดูแลระบบ (admin) สามารถ
- ดู system logs ได้

วัตถุประสงค์ของงานนี้คือ
- ฝึกการออกแบบ **Microservices Architecture**
- ใช้ **Docker Compose** เพื่อจัดการหลาย services
- เรียนรู้ **HTTPS, JWT Authentication และ Logging**
- สร้างระบบที่สามารถทดสอบและ deploy ได้จริง

---

# 2. Architecture Diagram

ภาพรวมสถาปัตยกรรมของระบบ

```
Browser / Postman
       │
       │ HTTPS :443  (HTTP :80 redirect → HTTPS)
       ▼
┌─────────────────────────────────────────────────────────────┐
│  🛡️ Nginx (API Gateway + TLS Termination + Rate Limiter)    │
│                                                             │
│  /api/auth/*   → auth-service:3001    (ไม่ต้องมี JWT)          │
│  /api/tasks/*  → task-service:3002   [JWT required]         │
│  /api/logs/*   → log-service:3003    [JWT required]         │
│  /             → frontend:80         (Static HTML)          │
└───────┬────────────────┬──────────────────┬─────────────────┘
        │                │                  │
        ▼                ▼                  ▼
┌──────────────┐ ┌───────────────┐ ┌──────────────────┐
│ 🔑 Auth Svc  │ │ 📋 Task Svc   │ │ 📝 Log Service   │
│   :3001      │ │   :3002       │ │   :3003          │
│              │ │               │ │                  │
│ • Login      │ │ • CRUD Tasks  │ │ • POST /api/logs │
│ • /verify    │ │ • JWT Guard   │ │ • GET  /api/logs │
│ • /me        │ │ • Log events  │ │ • เก็บลง DB       │
└──────┬───────┘ └───────┬───────┘ └──────────────────┘
       │                 │
       └────────┬────────┘
                ▼
     ┌─────────────────────┐
     │  🗄️ PostgreSQL      │
     │  (1 shared DB)      │
     │  • users   table    │
     │  • tasks   table    │
     │  • logs    table    │
     └─────────────────────┘
```

# 3. โครงสร้าง repository

```
final-lab-set1/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── nginx/
│   ├── nginx.conf              ← HTTPS + reverse proxy config
│   ├── Dockerfile
│   └── certs/                  ← Self-signed cert (generate ด้วย script)
│       ├── cert.pem
│       └── key.pem
│
├── frontend/
│   ├── Dockerfile
│   ├── index.html              ← Task Board UI (Login + CRUD Tasks + JWT inspector)
│   └── logs.html               ← Log Dashboard (ดึงจาก /api/logs)
│
├── auth-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── routes/auth.js
│       ├── middleware/jwtUtils.js
│       └── db/db.js
│
├── task-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── routes/tasks.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── jwtUtils.js
│       └── db/db.js
│
├── log-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
│
├── db/
│   └── init.sql                ← Schema + Seed Users ทั้งหมด
│
├── scripts/
│   └── gen-certs.sh            ← สร้าง self-signed cert
│
└── screenshots/
    ├── 01_docker_running.png
    ├── 02_https_browser.png
    ├── 03_login_success.png
    ├── 04_login_fail.png
    ├── 05_create_task.png
    ├── 06_get_tasks.png
    ├── 07_update_task.png
    ├── 08_delete_task.png
    ├── 09_no_jwt_401.png
    ├── 10_logs_api.png
    ├── 11_rate_limit.png
    └── 12_frontend_screenshot.png
```
# 4. การสร้าง HTTPS Certificate

```
mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/key.pem \
  -out    nginx/certs/cert.pem \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=RMUTL/OU=ENGCE301/CN=localhost"
echo "✅ Certificate created in nginx/certs/"

ไฟล์ที่ได้

cert.pem
key.pem

นำไปใช้ใน nginx configuration

PowerShell
# รันครั้งเดียวก่อน docker compose up
bash scripts/gen-certs.sh

Linux
# รันครั้งเดียวก่อน docker compose up
chmod +x scripts/gen-certs.sh
```

# 5. วิธีรันระบบด้วย Docker Compose

ติดตั้ง
-Docker
-Docker Compose

จากนั้นรัน
```
docker compose up --build
```

ระบบจะเริ่ม services ต่อไปนี้
-nginx
-auth-service
-task-service
-log-service
-databases

เข้าใช้งานได้ที่
```
https://localhost
```

# 6. รายชื่อ seed users สำหรับทดสอบ พร้อมคำอธิบายการสร้าง bcrypt hash เองอย่างไร

SEED USERS
--
--  บัญชีสำหรับทดสอบ:
--    alice@lab.local / alice123
--    bob@lab.local   / bob456
--    admin@lab.local / adminpass
--
--  ตัวอย่างการสร้าง hash ใหม่:
--    node -e "const b=require('bcryptjs'); console.log(b.hashSync('alice123',10))"
--    node -e "const b=require('bcryptjs'); console.log(b.hashSync('bob456',10))"
--    node -e "const b=require('bcryptjs'); console.log(b.hashSync('adminpass',10))"
--  
--  เมื่อเรา Login ด้วย password จริง bcrypt hash จะเปลี่ยนระหรัสผ่านของเราเป็นอย่างอื่น เช่น $2b$10$8bNx1syrjuUiJT0ntNkeLeRYjDrBSrjKCV641itIsi7oTkUV384Gu 
--  แล้วเราจะทำนำ bcrypt hash ที่ได้ไปใส่แทนรหัสผ่านเก่าใน db/db.js เพิ่อที่เมื่อเราใส่รหัสในการ Login ระบบจะไม่เก็บรหัสผ่านจริง แต่เก็บค่า hash ที่เราเปลี่ยนแล้วแทน 

## แล้วมันจะปลอดภัยจากอะไรบ้าง
ถ้าฐานข้อมูลถูกขโมยหรือหลุดออกไป เช่น

username | password
alice    | alice123
bob      | bob456

แฮกเกอร์จะเห็นรหัสผ่านทันที ❌

แต่ถ้าใช้ bcrypt

username | password_hash
alice    | $2a$10$JvC3kT9c5PpJrW8R3y6yQe9t7h...
bob      | $2a$10$Yk8L2mQp9rD5sT7n4w...

แฮกเกอร์จะเห็นแค่ hash ซึ่งไม่สามารถรู้รหัสผ่านจริงได้ง่าย ๆ

# 7. วิธีทดสอบ API และ Frontend

## Teat APT

```
# ── ตัวแปร ───────────────────────────────────
BASE="https://localhost"    # ใช้ --insecure เพราะ self-signed cert

# ── T3: Login ────────────────────────────────
TOKEN=$(curl -sk -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@lab.local","password":"alice123"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo $TOKEN

# ── T4: Login (ผิด password) ──────────────────
curl -sk -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@lab.local","password":"wrong"}'

# ── T5: Create Task ───────────────────────────
curl -sk -X POST $BASE/api/tasks/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"from curl","priority":"high"}'

# ── T6: Get Tasks ─────────────────────────────
curl -sk $BASE/api/tasks/ -H "Authorization: Bearer $TOKEN"

# ── T9: No JWT → 401 ─────────────────────────
curl -sk $BASE/api/tasks/

# ── T10A: Member เรียก Log Dashboard ต้องถูกปฏิเสธ ─────────
curl -sk -i $BASE/api/logs/ -H "Authorization: Bearer $TOKEN"

# ── T10B: Admin เรียก Log Dashboard ได้สำเร็จ ───────────────
ADMIN_TOKEN=$(curl -sk -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.local","password":"adminpass"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl -sk $BASE/api/logs/ -H "Authorization: Bearer $ADMIN_TOKEN"

# ── T11: Rate Limit ───────────────────────────
for i in {1..8}; do
  echo -n "Attempt $i: "
  curl -sk -o /dev/null -w "%{http_code}\n" -X POST $BASE/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@lab.local","password":"wrong"}'
  sleep 0.1
done
```
## Test Frontend 

เปิด browser ไปที่
```
https://localhost
```
จากนั้น
Login
สร้าง Task
ดูรายการ Task
ลบ Task

## 9. การทำงานของ HTTPS, JWT และ Logging

HTTPS

ระบบใช้ HTTPS เพื่อเข้ารหัสข้อมูลระหว่าง client และ server
Nginx ทำหน้าที่เป็น reverse proxy และจัดการ TLS certificate

JWT Authentication

หลังจาก login สำเร็จ
Auth Service จะสร้าง JWT token
Token นี้จะถูกใช้ในการเรียก API อื่น ๆ
```
Authorization: Bearer TOKEN
```
Task Service และ Log Service จะตรวจสอบ token ก่อนให้เข้าถึงข้อมูล

Logging
Log Service จะบันทึกข้อมูล เช่น
- login attempts
- API requests
- system errors
ผู้ใช้ที่เป็น admin สามารถดู logs ได้ผ่าน API

# 10. Known Limitations

## ข้อจำกัดของระบบ
- ยังไม่มีระบบ refresh token
- frontend ยังเป็น version พื้นฐาน

