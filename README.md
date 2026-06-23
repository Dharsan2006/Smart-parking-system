# 🅿 SmartPark - Smart Parking Management System

A full-stack Smart Parking System built with **React.js**, **Spring Boot**, and **MySQL**.

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
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

---

### Backend Setup

1. **Configure MySQL** — Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/Smartparking?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=1234
   ```

2. **Run the backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The API starts at `http://localhost:8080`

3. **Auto-seeded data** on first run:
   - Admin: `admin@smartpark.com` / `admin123`
   - User: `user@smartpark.com` / `user123`
   - 50 parking slots across 3 floors

---

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   
   npm install
   ```

2. **Start the app**:
   ```bash
   npm start
   ```
   Opens at `http://localhost:3000`

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
- MySQL 8
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
