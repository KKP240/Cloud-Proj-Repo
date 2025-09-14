# เว็บไซต์ลงทะเบียนกิจกรรม

ระบบเว็บแอปพลิเคชันสำหรับจัดการการลงทะเบียนกิจกรรมภายในสถาบันหรือองค์กร พัฒนาด้วยเทคโนโลยีทันสมัยเพื่อความสามารถในการขยายและความสะดวกในการพัฒนา

## สมาชิกทีม
- **นาย กิตติพิชญ์ เพ็งแจ่ม**
- **นาย เกียรติศักดิ์ สกุลวันธนพัฒน์**
- **นาย ธิเบศ สว่างการ**

## ภาพรวมโครงการ
โครงการนี้เป็นเว็บแอปพลิเคชันสำหรับการลงทะเบียนกิจกรรม พัฒนาด้วย:
- **Backend**: Node.js + Express
- **ฐานข้อมูล**: PostgreSQL ร่วมกับ Sequelize (ORM + migrations)
- **Frontend**: React (Vite)
- **บริการคลาวด์**: รองรับ AWS (S3, Cognito, RDS) แต่ปัจจุบันรันในระบบท้องถิ่นเพื่อการทดสอบและเรียนรู้

ระบบนี้ถูก dockerized เพื่อการติดตั้งที่ง่ายและมีฟีเจอร์เช่น การยืนยันตัวตนด้วย JWT, การจัดการกิจกรรม, และการสร้างรายงาน

## คุณสมบัติ
- **การยืนยันตัวตน**: สมัครสมาชิก/เข้าสู่ระบบด้วย JWT (สำหรับ dev) และรองรับ Cognito (สำหรับ production)
- **การจัดการกิจกรรม**: สร้าง, แก้ไข, ลบกิจกรรม (CRUD)
- **การลงทะเบียน**: ลงทะเบียน/ยกเลิกการลงทะเบียนกิจกรรม พร้อมตรวจสอบจำนวนที่ว่าง
- **การสร้างรายงาน**: ส่งออกรายชื่อผู้เข้าร่วมเป็น CSV หรือ PDF (ผ่าน Puppeteer)
- **การอัปโหลดไฟล์**: อัปโหลดโปสเตอร์กิจกรรมไปยัง S3 ด้วย presigned URL
- **เหมาะสำหรับการพัฒนา**: Dockerized PostgreSQL + pgAdmin, Sequelize migrations และ seeders
- **Frontend**: อินเทอร์เฟซ React สำหรับหน้า Login, Register และ Homepage

## โครงสร้างโปรเจกต์
```
my-activity-backend/
├── client/                 # แอป React (Vite)
├── docker/                 # การตั้งค่า Docker
│   └── docker-compose.yml
├── migrations/             # Sequelize migrations
├── seeders/               # Sequelize seeders
├── src/                   # โค้ด backend
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── templates/         # EJS สำหรับ HTML-to-PDF
│   ├── app.js
│   └── server.js
├── scripts/               # สคริปต์เสริม
│   └── clear-data.js
├── .env.example           # เทมเพลตตัวแปรสภาพแวดล้อม
├── package.json           #  dependencies ของ backend
└── README.md              # ไฟล์นี้
```

## สิ่งที่ต้องติดตั้ง
- **Git**
- **Node.js** (แนะนำ v16+ หรือ v18+) และ **npm**
- **Docker** และ **Docker Compose** (สำหรับ PostgreSQL + pgAdmin)
- *(แนะนำ)* **WSL2** บน Windows เพื่อใช้คำสั่ง UNIX-like ได้สะดวก
- *(สำหรับสร้าง PDF)* Puppeteer จะดาวน์โหลด Chromium (~100MB) ระหว่างติดตั้ง

## ตัวแปรสภาพแวดล้อม
1. คัดลอกไฟล์ตัวอย่าง:
   ```bash
   cp .env.example .env
   ```
2. แก้ไข `.env` ให้ตรงกับเครื่องของคุณ ตัวอย่าง:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development

   # Dev auth helper
   DISABLE_AUTH=true
   LOCAL_JWT_SECRET=devsecret
   LOCAL_JWT_EXPIRES=2h

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=postgres
   DB_NAME=activitydb

   # AWS (optional)
   AWS_REGION=ap-southeast-1
   S3_BUCKET=your-bucket
   COGNITO_POOL_ID=ap-southeast-1_xxx
   COGNITO_CLIENT_ID=xxxxxxxxx
   ```
   **หมายเหตุ**: ห้าม commit ไฟล์ `.env` ที่มีค่าจริงขึ้น GitHub

## ขั้นตอนการติดตั้ง
1. **Clone repository**:
   ```bash
   git clone https://github.com/KKP240/Cloud-Proj-Repo.git
   cd Cloud-Proj-Repo
   ```

2. **สร้างไฟล์ `.env`**:
   ```bash
   cp .env.example .env
   # แก้ไข .env ให้ตรงกับเครื่องของคุณ
   ```

3. **ติดตั้ง dependencies (backend)**:
   ```bash
   npm install
   ```

4. **เริ่ม Docker (PostgreSQL + pgAdmin)**:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```
   ตรวจสอบ container:
   ```bash
   docker ps
   docker-compose -f docker/docker-compose.yml logs -f db
   ```
   รอจน PostgreSQL พร้อมรับการเชื่อมต่อ

5. **(ถ้าจำเป็น) สร้างฐานข้อมูล**:
   หากฐานข้อมูลยังไม่ถูกสร้างโดย `docker-compose.yml`:
   ```bash
   npx sequelize-cli db:create
   ```

6. **รัน migrations**:
   ```bash
   npx sequelize-cli db:migrate
   ```

7. **(ตัวเลือก) เติมข้อมูลตัวอย่าง**:
   ```bash
   npx sequelize-cli db:seed:all
   ```

8. **รัน backend**:
   - Development:
     ```bash
     npm run dev
     ```
   - Production:
     ```bash
     npm start
     ```
   ตรวจสอบ health endpoint: [http://localhost:3000/health](http://localhost:3000/health)

## การตั้งค่า Frontend (React)
โฟลเดอร์ `client/` เป็นแอป React (สร้างด้วย Vite)

1. ติดตั้งและรัน:
   ```bash
   cd client
   npm install
   npm run dev
   ```
2. เปิด browser: [http://localhost:5173](http://localhost:5173)

3. **ตั้งค่า Proxy** (แนะนำ):
   ใน `client/vite.config.js` ตั้งค่า proxy เพื่อส่ง `/api` ไปยัง backend:
   ```javascript
   server: {
     proxy: {
       '/api': 'http://localhost:3000'
     }
   }
   ```

## คำสั่งที่ใช้งานบ่อย
- เริ่ม backend (dev): `npm run dev`
- เริ่ม backend (prod): `npm start`
- รัน migrations: `npx sequelize-cli db:migrate`
- สร้างฐานข้อมูล (ถ้าจำเป็น): `npx sequelize-cli db:create`
- รัน seeders: `npx sequelize-cli db:seed:all`
- ล้างข้อมูลตัวอย่าง: `node scripts/clear-data.js` (ถ้ามีสคริปต์นี้)

## หมายเหตุ
- ตรวจสอบว่า Docker รันอยู่ก่อนเริ่ม backend
- สำหรับ production ให้ตั้งค่าบริการ AWS (S3, Cognito, RDS) ใน `.env`
- ดูเพิ่มเติมที่ [เอกสาร Sequelize CLI](https://sequelize.org/docs/v6/other-topics/migrations/) สำหรับคำสั่ง migration/seed ขั้นสูง