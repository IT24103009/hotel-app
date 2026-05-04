# 🏨 Hotel Management Mobile App
### React Native + Expo | SE2020 Group Assignment

---

## 📱 Project Overview

A full-stack mobile application for Hotel Management built with:
- **Frontend:** React Native (Expo)
- **Backend:** Node.js + Express.js (already built)
- **Database:** MongoDB Atlas

---

## 👥 Team Module Breakdown

| Student | Entity | Module | Tab |
|---------|--------|--------|-----|
| Student 1 | Room | Room Management | Rooms |
| Student 2 | Reservation | Room Booking | Reservations |
| Student 3 | User/Staff | Staff Management | Staff |
| Student 4 | Bill | Financial Management | Billing |
| Student 5 | Maintenance | Maintenance System | Maintenance |
| Student 6 | Event | Events & Visitor Tracking | Events |
| Group | Auth | Login / Register / JWT | — |

---

## 🚀 Setup Instructions

### Step 1 — Install Dependencies

```bash
cd HotelManagementApp
npm install
```

If you get errors with `@react-native-picker/picker`, install it:
```bash
npx expo install @react-native-picker/picker
```

### Step 2 — Configure Your Backend URL

Open `src/config/api.js` and change `BASE_URL`:

```js
// Change this to your deployed backend URL
export const BASE_URL = 'https://your-hotel-api.onrender.com';
```

> ⚠️ **IMPORTANT:** The backend MUST be hosted (Render/Railway/AWS).
> Localhost will NOT work during evaluation.

### Step 3 — Run the App

```bash
# Start Expo
npx expo start

# Or directly on Android
npx expo start --android

# Or on iOS
npx expo start --ios
```

Use the **Expo Go** app on your phone to scan the QR code.

---

## 🏗 Project Structure

```
HotelManagementApp/
├── App.js                          # Entry point
├── app.json                        # Expo config
├── package.json
├── src/
│   ├── config/
│   │   └── api.js                  # Axios + BASE_URL config
│   ├── context/
│   │   └── AuthContext.js          # JWT Auth state management
│   ├── navigation/
│   │   └── AppNavigator.js         # All navigation (tabs + stacks)
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.js       # Staff login (step 1)
│       │   ├── OtpScreen.js         # OTP verification (step 2)
│       │   ├── ClientLoginScreen.js # Guest login
│       │   └── RegisterScreen.js   # Guest registration
│       ├── dashboard/
│       │   └── DashboardScreen.js  # Overview + quick stats
│       ├── rooms/                   # Student 1
│       │   ├── RoomListScreen.js
│       │   ├── RoomDetailScreen.js
│       │   └── AddRoomScreen.js
│       ├── reservations/            # Student 2
│       │   ├── ReservationListScreen.js
│       │   ├── CreateReservationScreen.js
│       │   └── ReservationDetailScreen.js
│       ├── staff/                   # Student 3
│       │   ├── StaffListScreen.js
│       │   └── AddStaffScreen.js
│       ├── billing/                 # Student 4
│       │   ├── BillingListScreen.js
│       │   └── BillDetailScreen.js
│       ├── maintenance/             # Student 5
│       │   ├── MaintenanceListScreen.js
│       │   └── AddMaintenanceScreen.js
│       └── events/                  # Student 6
│           ├── EventListScreen.js
│           └── AddEventScreen.js
```

---

## 🔐 Authentication Flow

### Staff Login (2-Step OTP)
1. Enter username + password → `POST /api/auth/login`
2. OTP sent to staff email
3. Enter OTP → `POST /api/auth/verify-otp`
4. JWT token stored in AsyncStorage

### Guest Login
1. Enter username + password → `POST /api/auth/client/login`
2. JWT token stored immediately

### Guest Register
→ `POST /api/auth/client/register`

---

## 📡 API Endpoints Used

| Module | Method | Endpoint |
|--------|--------|----------|
| Auth | POST | `/api/auth/login` |
| Auth | POST | `/api/auth/verify-otp` |
| Auth | POST | `/api/auth/client/login` |
| Auth | POST | `/api/auth/client/register` |
| Auth | POST | `/api/auth/logout` |
| Rooms | GET | `/api/rooms` |
| Rooms | GET | `/api/rooms/available` |
| Rooms | GET | `/api/rooms/types` |
| Rooms | POST | `/api/rooms` |
| Rooms | PUT | `/api/rooms/:id` |
| Rooms | DELETE | `/api/rooms/:id` |
| Reservations | GET | `/api/reservations` |
| Reservations | POST | `/api/reservations` |
| Reservations | PUT | `/api/reservations/:id/checkin` |
| Reservations | PUT | `/api/reservations/:id/checkout` |
| Reservations | PUT | `/api/reservations/:id/cancel` |
| Staff | GET | `/api/users` |
| Staff | POST | `/api/users` |
| Staff | PUT | `/api/users/:id` |
| Staff | DELETE | `/api/users/:id` |
| Billing | GET | `/api/billing` |
| Billing | PUT | `/api/billing/:id/pay` |
| Maintenance | GET | `/api/rooms/maintenance` |
| Maintenance | POST | `/api/rooms/maintenance` |
| Maintenance | PUT | `/api/rooms/maintenance/:id/complete` |
| Events | GET | `/api/events` |
| Events | GET | `/api/events/halls` |
| Events | GET | `/api/events/packages` |
| Events | POST | `/api/events` |
| Events | PUT | `/api/events/:id` |
| Events | DELETE | `/api/events/:id` |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile UI | React Native + Expo |
| Navigation | React Navigation v6 (Stack + BottomTabs) |
| HTTP Client | Axios |
| Auth Storage | AsyncStorage |
| Icons | @expo/vector-icons (Ionicons) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcryptjs |

---

## 📋 Viva Preparation Guide

### Student 1 — Room Management
- Explain `RoomListScreen.js`: FlatList, filter chips, search
- Explain `AddRoomScreen.js`: form validation, API POST/PUT
- Know: `api.get('/rooms')`, `api.post('/rooms')`, `api.put('/rooms/:id')`

### Student 2 — Reservations
- Explain `ReservationListScreen.js`: status filter, check-in/check-out logic
- Explain `CreateReservationScreen.js`: room selection, date validation
- Know: difference between `reserved` → `checked_in` → `checked_out`

### Student 3 — Staff Management
- Explain `StaffListScreen.js`: role-based filtering, activate/deactivate
- Explain `AddStaffScreen.js`: role chips, password handling for edit
- Know: roles (admin/receptionist/staff) and their permissions

### Student 4 — Billing
- Explain `BillingListScreen.js`: summary totals, mark as paid
- Explain `BillDetailScreen.js`: charges breakdown (room + extra + tax - discount)
- Know: payment methods (cash/card/qr_code), payment flow

### Student 5 — Maintenance
- Explain `MaintenanceListScreen.js`: ongoing vs completed, days counter
- Explain `AddMaintenanceScreen.js`: room selection, staff assignment
- Know: how maintenance changes room status to `maintenance`

### Student 6 — Events
- Explain `EventListScreen.js`: event types, hall info, price display
- Explain `AddEventScreen.js`: hall selection, package selection, timing
- Know: event types (wedding/conference/party/meeting/other)

---

## ⚠️ Important Notes

1. **Change BASE_URL** in `src/config/api.js` before demo
2. Backend must be **live and deployed** — localhost not allowed
3. All students must be able to explain their module's code
4. The app uses JWT stored in AsyncStorage for protected routes
5. Pull-to-refresh is enabled on all list screens
