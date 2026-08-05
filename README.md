# 🌍 SmartTour — QR-Based Tourist Issue Reporting & Location Management Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v10-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900?logo=leaflet)](https://leafletjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-005A9C?logo=pwa)](https://web.dev/progressive-web-apps/)

**SmartTour** is a production-ready, full-stack web application designed for tourist and trekking locations such as **Bopdev Ghat, Kanifnath Temple, viewpoints, trekking routes, parking areas, and nearby attractions**. 

The core mission:
> **Place QR codes at tourist locations. Visitors scan the QR code to automatically identify the location, report issues (garbage, road damage, missing signs, safety hazards, network blackout), and track resolution status in real-time.**

---

## 📸 Tourist Destinations Covered

| Destination | Category | Coordinates | Cover Image |
| :--- | :--- | :--- | :--- |
| **Bopdev Ghat** | Ghat / Mountain Pass | `18.4529, 73.8774` | ![Bopdev Ghat](public/images/bopdev-ghat.jpg) |
| **Kanifnath Temple** | Hilltop Temple | `18.3452, 73.9876` | ![Kanifnath Temple](public/images/kanifnath-temple.jpg) |
| **Bopdev Viewpoint** | Viewpoint | `18.4485, 73.8720` | ![Bopdev Viewpoint](public/images/bopdev-viewpoint.jpg) |
| **Trek Entry Point** | Entry Point | `18.4545, 73.8795` | ![Trek Entry](public/images/trek-entry.jpg) |
| **Bopdev Parking** | Parking Area | `18.4560, 73.8810` | ![Parking Area](public/images/parking-area.jpg) |
| **Midway Rest Point** | Rest Stop | `18.4510, 73.8750` | ![Rest Point](public/images/rest-point.jpg) |

---

## ✨ Key Features

### 🥾 Tourist & Visitor Experience
- **🔲 QR Auto Location Detection**: Scanning a QR code opens `/report?location=slug` and pre-fills the location automatically.
- **🗺️ Interactive OpenStreetMap & Trekking Trails**: Leaflet map displaying location markers, marker popups, and polyline trail routes (Bopdev Summit Trail, Kanifnath Temple Hill Trail).
- **🧭 Google Maps Directions Integration**: 1-click **"Open in Google Maps"** navigation targeted to location GPS coordinates.
- **📍 GPS Coordinates for Unlisted Places**: Visitors can submit reports for unlisted locations with custom landmark names and captured device GPS position.
- **⚡ AI-Assisted Issue Categorization**: Analyzes complaint title and description to auto-suggest category and priority.
- **📶 Specialized Network Problem Reporting**: Dedicated fields for reporting mobile network blackouts, provider issues, and signal loss on trekking routes.
- **📷 Photo Evidence Upload**: Compression and preview validation for complaint images.
- **🔎 Real-time Token Tracking**: Search any report token ID (`ST-2026-XXXXXX`) on `/track` to view status timelines step-by-step and read official authority resolution notes.

### 👑 Admin Management Platform
- **📊 Analytics Dashboard**: 8 real-time metric counters and Recharts visual charts (Category breakdown, Monthly trends, Resolution rates).
- **📋 Report Resolution & Status Editor**: Update report statuses (`Reported` ➔ `Under Review` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`), adjust priority, and save official resolution notes.
- **🗺️ Admin Complaint Map**: Interactive map showing status-coded markers for all active complaints.
- **📍 Locations Manager (CRUD)**: Add, edit, or toggle active status of tourist locations.
- **🔲 QR Code Generator**: Live QR rendering per location, SVG copy, PNG image download, and printable poster mode.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Mapping**: Leaflet, React-Leaflet, OpenStreetMap
- **Data & Auth**: Firebase SDK v10 (Auth, Firestore, Storage, Analytics) + LocalStorage Fallback
- **Data Visualization**: Recharts
- **PWA**: Web Application Manifest (`public/manifest.json`)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your system.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/smarttour.git
cd smarttour
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSyBEwiTTVl3RCwtjJgIgW6m3XrfR0KoO75E
VITE_FIREBASE_AUTH_DOMAIN=smarttour-a0973.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smarttour-a0973
VITE_FIREBASE_STORAGE_BUCKET=smarttour-a0973.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=770325763443
VITE_FIREBASE_APP_ID=1:770325763443:web:982dbf34b181943d086106
VITE_FIREBASE_MEASUREMENT_ID=G-BXPQJ3GC2C
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 5. Production Build
```bash
npm run build
```

---

## 🔐 Firebase Security Rules Setup

To allow public users to submit reports while restricting admin management actions:

### Firestore Database Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /locations/{locationId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /reports/{reportId} {
      allow read, create: if true;
      allow update, delete: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Firebase Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      allow read, create: if true;
      allow update, delete: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🔑 Admin Credentials

| Parameter | Value |
| :--- | :--- |
| **Admin Login URL** | `/admin/login` |
| **Default Email** | `admin@smarttour.dev` |
| **Default Password** | `admin123` |

---

## 📄 License
This project is open source and available under the **MIT License**.
