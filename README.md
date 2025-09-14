เว็บไซต์ลงทะเบียนกิจกรรม (Activity Registration Website)
นักศึกษา:

นาย กิตติพิชญ์ เพ็งแจ่ม

นาย เกียรติศักดิ์ สกุลวันธนพัฒน์

นาย ธิเบศ สว่างการ

สรุปโครงการ (Project Overview)
ระบบเว็บไซต์สำหรับลงทะเบียนกิจกรรมภายในสถาบัน/องค์กร พัฒนาด้วยสแตกหลักคือ Node.js + Express (backend), PostgreSQL (database), Sequelize (ORM + migrations) และ React (client) โดยออกแบบให้ทำงานร่วมกับบริการ Cloud (เช่น S3, Cognito, RDS) แต่ในเวอร์ชันปัจจุบันถูกพัฒนาเป็นระบบท้องถิ่นสำหรับการทดสอบและเรียนรู้

คุณสมบัติหลัก (Features)
สมัครสมาชิก / เข้าสู่ระบบ: (local JWT สำหรับ dev; รองรับ Cognito สำหรับ production)

สร้าง / แก้ไข / ลบกิจกรรม: (Activity CRUD)

ลงทะเบียน/ยกเลิกการลงทะเบียนกิจกรรม: พร้อมตรวจสอบจำนวนผู้ลงทะเบียน (capacity)

ออกรายงานผู้เข้าร่วม: สามารถส่งออกเป็นไฟล์ CSV และ PDF (ใช้ Puppeteer ในการแปลง HTML เป็น PDF)

อัปโหลดไฟล์โปสเตอร์: ผ่าน presigned URL ไปยัง S3 (service พร้อมใช้งาน)

Development-friendly: มาพร้อม Dockerized PostgreSQL + pgAdmin, Sequelize migrations & seeders

Frontend (React): สำหรับทดสอบ UI พื้นฐาน: Login, Register, Home

โครงสร้างโปรเจกต์ (Project Structure)
my-activity-backend/
├─ client/                 # React app (Vite)
├─ docker/
│  └─ docker-compose.yml
├─ migrations/             # Sequelize migrations
├─ seeders/                # Sequelize seeders
├─ src/
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  ├─ templates/           # ejs สำหรับ HTML→PDF
│  ├─ app.js
│  └─ server.js
├─ scripts/
│  └─ clear-data.js
├─ .env.example
├─ package.json            # backend
└─ README.md               # (คุณกำลังอ่าน)

สิ่งที่ต้องติดตั้ง (Prerequisites)
Git

Node.js (v16+ หรือ v18+ แนะนำ) และ npm

Docker & Docker Compose (สำหรับรัน Postgres + pgAdmin)

(แนะนำ) WSL2 บน Windows เพื่อใช้งานคำสั่ง UNIX-like ได้สะดวก

(ถ้าต้องการ PDF generation) Puppeteer จะดาวน์โหลด Chromium (~100MB) เมื่อติดตั้ง

ตัวแปรสภาพแวดล้อม (.env)
คัดลอกจากไฟล์ตัวอย่าง:

cp .env.example .env

ตัวอย่างค่าที่ต้องตั้ง (แก้ไขตามสภาพแวดล้อมของแต่ละคน):

# server
PORT=3000
NODE_ENV=development

# dev auth helper
DISABLE_AUTH=true
LOCAL_JWT_SECRET=devsecret
LOCAL_JWT_EXPIRES=2h

# database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=activitydb

# aws (optional)
AWS_REGION=ap-southeast-1
S3_BUCKET=your-bucket
COGNITO_POOL_ID=ap-southeast-1_xxx
COGNITO_CLIENT_ID=xxxxxxxxx

สำคัญ: ห้าม commit ไฟล์ .env ที่มีค่าจริงขึ้น GitHub

ขั้นตอนการตั้งค่า (Step-by-step Setup)
Clone repository

git clone [https://github.com/KKP240/Cloud-Proj-Repo.git](https://github.com/KKP240/Cloud-Proj-Repo.git)
cd Cloud-Proj-Repo

สร้างไฟล์ .env

cp .env.example .env
# แก้ไขค่าใน .env ให้ตรงกับเครื่องของคุณ

ติดตั้ง dependencies (backend)

npm install

เริ่ม Docker (Postgres + pgAdmin)

docker-compose -f docker/docker-compose.yml up -d

ตรวจสอบสถานะ container:

docker ps
docker-compose -f docker/docker-compose.yml logs -f db

รอจน PostgreSQL พร้อมรับ connection

(ถ้าจำเป็น) สร้าง database ก่อน
หากคุณเชื่อมต่อกับ Database Server ที่ยังไม่มีฐานข้อมูลสำหรับโปรเจกต์นี้ ให้รัน:

npx sequelize-cli db:create

หมายเหตุ: หากใน docker-compose.yml มีการกำหนด POSTGRES_DB ไว้อยู่แล้ว มักไม่จำเป็นต้องรันคำสั่งนี้ เพราะ container จะสร้าง DB ให้โดยอัตโนมัติ

รัน migrations

npx sequelize-cli db:migrate

(Optional) เติมข้อมูลตัวอย่าง

npx sequelize-cli db:seed:all

รัน backend

Development mode:

npm run dev

Production mode:

npm start

ตรวจสอบว่าเซิร์ฟเวอร์ทำงานถูกต้องที่: http://localhost:3000/health

Frontend (React) — สั่งรัน client
โฟลเดอร์ client/ เป็นแอปพลิเคชัน React ที่สร้างด้วย Vite

ติดตั้งและรัน

cd client
npm install
npm run dev

เปิด browser ไปที่: http://localhost:5173

Proxy (แนะนำ)
ในไฟล์ client/vite.config.js สามารถตั้งค่า proxy เพื่อให้ request ที่ขึ้นต้นด้วย /api ถูกส่งต่อไปยัง backend ที่ http://localhost:3000 ได้โดยอัตโนมัติ ทำให้ไม่ต้องกำหนด base URL ในโค้ด frontend

// client/vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}

คำสั่งสำคัญที่ใช้งานบ่อย
Start backend (dev): npm run dev

Start backend (prod): npm start

Run migrations: npx sequelize-cli db:migrate

Create DB (ถ้าจำเป็น): npx sequelize-cli db:create

Run seeders: npx sequelize-cli db:seed:all

Clear demo data: node scripts/clear-data.js (หากมีไฟล์นี้)