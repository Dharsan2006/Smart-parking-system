# 🅿 SmartPark - Smart Parking Management System

A full-stack Smart Parking System built with **React.js**, **Spring Boot**, and **PostgreSQL**.

---

## 🏗 Project Structure

```
Smart parking Management/
├── backend/          # Spring Boot REST API
│   └── src/main/java/com/smartparking/
│       ├── model/        # JPA Entities
│       ├── repository/   # Spring Data JPA Repositories
│       ├── service/      # Business Logic
│       ├── controller/   # REST Controllers
│       ├── dto/          # Data Transfer Objects
│       ├── security/     # JWT Auth
│       └── config/       # Spring Config
└── frontend/         # React.js SPA
    └── src/
        ├── pages/        # Page Components
        ├── components/   # Reusable Components
        ├── services/     # API Service Layer
        ├── context/      # React Context (Auth)
        └── hooks/        # Custom Hooks (WebSocket)
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21 (or 17+)
- Node.js 18+ (tested on Node.js 24)
- PostgreSQL 15+
- Maven 3.8+
- Docker & Docker Desktop (Optional if running in container)

---

### Running the Application

#### Option 1: Run Backend via Docker (Recommended)
The backend container `smartpark-container` (`smartpark-backend:1.2`) runs on port **8081**.

In **Terminal 1** (PowerShell):
```powershell
docker start smartpark-container
```
To verify the container is running and view live logs:
```powershell
docker ps
docker logs -f smartpark-container
```

#### Option 2: Run Backend Directly via Maven (Without Docker)
If you prefer running Spring Boot directly on your host machine:

In **Terminal 1** (PowerShell):
```powershell
cd "backend"
mvn spring-boot:run
```
The API starts at `http://localhost:8081`

---

#### Start Frontend (React)
In **Terminal 2** (PowerShell):
```powershell
cd "frontend"
npm install    # (only needed first time)
npm start
```
The frontend opens automatically at `http://localhost:3000`

---

### Default Demo Credentials & Auto-Seeded Data
The system auto-seeds the following on startup:
- **Admin:** `admin@smartpark.com` / `admin123`
- **User:** `user@smartpark.com` / `user123`
- *Tip: On the Sign In page, you can click on either Demo Admin or Demo User to automatically autofill the login form!*
- **50 parking slots** pre-configured across 3 floors (Floors 1, 2, and 3)

---

## ✨ Features

### User Features
| Feature | Description |
|---------|-------------|
| 🔐 JWT Auth | Register/Login with secure JWT tokens |
| 🗺 Parking Map | Live grid showing slot availability |
| 📅 Booking | Book slots in advance with time selection |
| 📱 QR Code | Auto-generated QR code after booking |
| ⏱ Duration Tracking | Automatic parking duration calculation |
| 💳 Payment | Pay based on actual parking time |
| 📋 History | View all bookings with invoice download |

### Admin Features
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Revenue charts and live statistics |
| 🅿 Slot Management | Add/Edit/Delete parking slots |
| 📋 Booking Monitor | View all bookings with search/filter |
| 📷 QR Validator | Validate entry/exit QR codes |
| 🔴 Live Status | Real-time slot status via WebSocket |

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register    Register new user
POST /api/auth/login       Login and get JWT token
```

### Slots
```
GET  /api/slots            Get all parking slots
GET  /api/slots/available  Get available slots
GET  /api/slots/{id}       Get slot by ID
```

### Bookings
```
POST /api/bookings              Create booking
GET  /api/bookings/my           Get my bookings
GET  /api/bookings/{id}         Get booking by ID
POST /api/bookings/validate-qr  Validate QR code
POST /api/bookings/{id}/exit    Record vehicle exit
POST /api/bookings/{id}/cancel  Cancel booking
```

### Payments
```
POST /api/payments              Process payment
GET  /api/payments/booking/{id} Get payment by booking
```

### Admin (requires ADMIN role)
```
GET    /api/admin/dashboard      Dashboard statistics
GET    /api/admin/bookings       All bookings
POST   /api/admin/slots          Create slot
PUT    /api/admin/slots/{id}     Update slot
DELETE /api/admin/slots/{id}     Delete slot
PATCH  /api/admin/slots/{id}/status  Update slot status
```

---

## 🎨 Color Coding

| Color | Status |
|-------|--------|
| 🟢 Green | Available |
| 🔴 Red | Occupied |
| 🟡 Yellow | Reserved |
| ⚫ Gray | Maintenance |

---

## 💰 Pricing Model

```
Total = Base Fee (₹2.00) + (Duration in hours × Price per hour)
```

Slot type pricing:
- Regular: ₹5.00/hr
- Compact: ₹4.00/hr
- Handicapped: ₹3.00/hr
- EV Charging: ₹8.00/hr

---

## 🔧 Tech Stack

**Backend:**
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA + Hibernate
- Spring WebSocket (STOMP)
- PostgreSQL 17
- ZXing (QR Code generation)
- Lombok

**Frontend:**
- React 18
- React Router v6
- Axios
- STOMP.js + SockJS (WebSocket)
- Recharts (Charts)
- qrcode.react
- react-hot-toast
