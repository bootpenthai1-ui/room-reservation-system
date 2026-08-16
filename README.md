# ระบบจองห้องออนไลน์ (Online Room Reservation System)

Scaffold ของระบบจองห้องเรียน/ห้องประชุม/ห้องปฏิบัติการ สำหรับนักศึกษา บุคลากรมหาวิทยาลัย บุคคลภายนอก
เจ้าหน้าที่ดูแลห้อง และผู้ดูแลระบบ

## Tech Stack

- Backend: Node.js + Express.js + MongoDB (Mongoose)
- Frontend: HTML/CSS/JavaScript (vanilla, responsive, minimal design)
- Auth: JWT + bcrypt

## โครงสร้างโปรเจกต์

```
room-reservation-system/
  backend/
    server.js
    src/
      config/db.js
      models/        # User, Building, Student, Room, Booking, Payment
      middleware/     # auth (JWT), role (authorize), upload (multer)
      controllers/
      routes/
      utils/seed.js  # ข้อมูลอาคาร/ห้อง/แอดมินเริ่มต้น
  frontend/
    index.html
    pages/           # login, register, rooms, my-bookings, staff-dashboard, admin-dashboard
    css/style.css
    js/               # api.js (fetch wrapper), main.js (navbar/helpers)
```

## เริ่มต้นใช้งาน (Backend)

1. ต้องมี MongoDB รันอยู่ (local หรือ Atlas)
2. คัดลอกไฟล์ env:
   ```
   cd backend
   copy .env.example .env
   ```
   แล้วแก้ `MONGODB_URI` และ `JWT_SECRET` ตามต้องการ
3. ติดตั้ง dependencies:
   ```
   npm install
   ```
4. สร้างข้อมูลเริ่มต้น (อาคาร/ห้องตามสเปก + แอดมิน):
   ```
   npm run seed
   ```
   จะได้บัญชีแอดมินเริ่มต้น: `admin@example.com` / `Admin@1234` (ควรเปลี่ยนรหัสผ่านหลังเข้าใช้งานครั้งแรก)
5. รันเซิร์ฟเวอร์:
   ```
   npm run dev
   ```
   API จะรันที่ `http://localhost:5000/api`

## เริ่มต้นใช้งาน (Frontend)

Frontend เป็นไฟล์ static ล้วน ๆ ไม่ต้อง build สามารถเปิดผ่าน Live Server ของ VS Code
(ให้รันที่พอร์ต 5500 ตาม `CLIENT_ORIGIN` ใน `.env`) หรือเสิร์ฟด้วยเว็บเซิร์ฟเวอร์ static ใด ๆ ก็ได้
แล้วเปิด `frontend/index.html`

ไฟล์ `frontend/js/api.js` กำหนดค่า `API_BASE = "http://localhost:5000/api"` — แก้ตรงนี้หากรัน backend คนละพอร์ต/โดเมน

## บัญชีผู้ใช้ (Roles)

- `student`, `staff`, `external` — สมัครสมาชิกได้เองผ่านหน้า Register
- `room_staff` — เจ้าหน้าที่ดูแลห้อง อนุมัติ/ปฏิเสธการจอง และตรวจสอบการชำระเงิน (สร้างผ่าน MongoDB หรือให้แอดมินปรับ role)
- `admin` — จัดการอาคาร/ห้อง/ผู้ใช้ทั้งหมด

## สิ่งที่ยังไม่ได้ทำ (ขั้นต่อไป)

- หน้าอัปโหลดหลักฐานการชำระเงิน (payment) ฝั่ง frontend (API พร้อมแล้วที่ `/api/payments`)
- แจ้งเตือนแบบ real-time (ปัจจุบันเป็น polling/refresh ตอนโหลดหน้า)
- Export รายงานเป็นไฟล์ (Excel/PDF)
