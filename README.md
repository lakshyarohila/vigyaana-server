# 🎓 Vigyana Backend

This is the backend for **Vigyana**, a full-stack learning platform  It powers course creation, video uploads, payments, enrollment, progress tracking, and role-based access control using Node.js, Express, Prisma, and PostgreSQL.

---

## 🚀 Tech Stack

- **Node.js + Express** – REST API framework
- **Prisma ORM** – PostgreSQL DB modeling
- **PostgreSQL** – Main database
- **JWT (httpOnly cookies)** – Secure auth system
- **Cloudinary** – Image & video storage
- **Razorpay** – Payment gateway integration
- **Zod** – Request validation (if added later)
- **CORS, Helmet** – Security middleware

---


---

## 👥 User Roles

- `STUDENT` – Can enroll, view, and track courses
- `INSTRUCTOR` – Can create/publish their own courses
- `ADMIN` – Can approve, publish, delete any course

---

## 🔐 Authentication (JWT + Cookies)

- Login/Signup via `/api/auth`
- Tokens are stored in **httpOnly cookies**
- On refresh, frontend checks `/api/auth/me` to persist login
- Middleware:
  - `protect` – verifies JWT
  - `isStudent`, `isInstructor`, `isAdmin` – role-based guards

---

## 📚 Course & Section Features

| Feature                    | Endpoint                          |
|----------------------------|-----------------------------------|
| Create Course              | `POST /api/courses`               |
| Add Section (video)        | `POST /api/sections`              |
| Get All Published Courses  | `GET /api/courses`                |
| Get Instructor Courses     | `GET /api/courses/mine`           |
| Update Course Status       | `PATCH /api/courses/:id/status`   |
| Delete Course              | `DELETE /api/courses/:id`         |

✅ Uploads handled via **Cloudinary** using `multer`.

---

## 💸 Payments & Enrollment (Razorpay)

| Feature                  | Endpoint                           |
|--------------------------|------------------------------------|
| Create Razorpay Order    | `POST /api/payment/order`          |
| Verify Payment & Enroll  | `POST /api/payment/verify`         |
| Get My Enrollments       | `GET /api/enrollments/my`          |
| Check Enrollment Status  | `GET /api/enrollments/check/:id`   |
| Get Enrolled Sections    | `GET /api/enrollments/sections/:id`|
| Update Watch Progress    | `PATCH /api/enrollments/progress/:id`|

---

## 🧾 Certificates

- Auto-generated when student hits **100%** progress
- Fetch via `GET /api/certificates`

---

## 🛡️ Admin Endpoints

| Feature                 | Endpoint                          |
|-------------------------|-----------------------------------|
| Get All Courses         | `GET /api/admin/courses`          |
| Approve/Unpublish Course| `PATCH /api/courses/:id/status`   |
| Delete Course           | `DELETE /api/courses/:id`         |

Middleware `protect + isAdmin` used for admin-only access.

---

## 🧪 Sample `.env`

```env
PORT=5000
DATABASE_URL=postgresql://your_user:your_pass@localhost:5432/vigyana
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret




## scripts

npm install        # Install dependencies
npx prisma migrate dev  # Run migrations
npm run dev        # Start development server


✅ Completed Features
 JWT Auth + Role-based access

 Instructor Course & Section Management

 Video + Thumbnail Uploads to Cloudinary

 Student Enrollment & Progress

 Secure Razorpay Integration

 Certificate Auto-Issuance

 Admin Approve/Unpublish/Delete

 Course Status Filtering (Draft / Published)

📦 To-Do (Advanced)
 Email Notifications (SendGrid)

 Forgot / Reset Password

 Admin analytics (e.g., revenue stats)

 API testing collection (Postman)

