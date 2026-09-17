# VELLORE DISCOVER

**Vellore Discover** is a multimedia-based local discovery platform designed to help users explore the heritage, culture, nature, landmarks, and lesser-known destinations of Vellore.

## 🏗️ System Architecture

```text
                         VELLORE DISCOVER
                                │
                                ▼
                         ┌─────────────┐
                         │    USER     │
                         └──────┬──────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │      FRONTEND        │
                    │   HTML / CSS / JS    │
                    └──────────┬───────────┘
                               │
                          REST API / HTTP
                               │
                               ▼
                    ┌──────────────────────┐
                    │       BACKEND        │
                    │   Node.js / Express  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐    ┌────────────┐   ┌─────────────┐
        │ MongoDB  │    │ Cloudinary │   │ Video URLs  │
        │ Database │    │   Images   │   │   Online    │
        └────┬─────┘    └────────────┘   └─────────────┘
             │
             ▼
    ┌───────────────────────────┐
    │ Users / Places            │
    │ Contributions / Likes     │
    │ Saved Places / Trips      │
    └───────────────────────────┘
```

---

## 🎬 Multimedia Architecture

Multimedia is a major part of the project.

Each destination can contain:

```text
Place
 │
 ├── Text Information
 │
 ├── Images
 │      └── Cloudinary URLs
 │
 └── Video
        └── Online Video URL
```

### Current Multimedia Dataset

| Item | Count |
|---|---:|
| Unique active places | 41 |
| Official image records | 584 |
| Places with video links | 39 |
| Places without video links | 2 |

The two places intentionally without video links are:

```text
ANA009 – Kavasampattu Bed Dam
ANA003 – Magizhvathi Dam
```

Official media and community-submitted media are maintained separately.

---

## 👥 User & Community System

Authenticated users can:

```text
Register
   ↓
Login
   ↓
Explore Places
   ↓
Like / Save
   ↓
Create Trips
   ↓
Submit Contributions
   ↓
Receive Moderation Result
```

Community contributions can contain:

- Rating
- Experience
- Feedback
- Photos
- Video

New contributions are initially:

```text
PENDING
```

Administrators can moderate contributions:

```text
PENDING
   │
   ├── APPROVE → Public Content
   │
   └── REJECT  → Rejected Content
```

---

## 🗺️ Trip Planning

Users can create personalized trips:

```text
Trip Planner
     ↓
Search Places
     ↓
Select Places
     ↓
Arrange Order
     ↓
Name Trip
     ↓
Save
     ↓
My Trips
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Images | Cloudinary |
| Videos | Online Video URLs |
| API | REST |
| Version Control | Git / GitHub |

---

## 📁 Project Structure

```text
Vellore_Heritage_Explorer/
│
├── 01_Places/
├── 02_Text/
├── 03_Images/
├── 04_Videos/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── place.html
│   ├── login.html
│   ├── register.html
│   ├── saved-places.html
│   ├── my-contributions.html
│   ├── trip-planner.html
│   ├── my-trips.html
│   ├── developers.html
│   └── admin.html
│
├── .gitignore
├── README.md
└── DEVELOPER_GUIDE.md
```

---

## 🗄️ Database

MongoDB stores the application's structured data.

### Main Entities

- User
- Place
- Contribution
- Like
- Saved Place
- Trip

### Relationships

```text
User
 ├── Likes ───────────────► Place
 ├── Saved Places ────────► Place
 ├── Contributions ───────► Place
 └── Trips ───────────────► Place
```

---

## 🔐 Security

The system uses:

- JWT authentication
- Role-based authorization
- Protected APIs
- Admin-only operations
- Environment variables for secrets

Sensitive configuration such as:

```text
MongoDB URI
JWT Secret
Cloudinary credentials
```

is stored locally in:

```text
backend/.env
```

The `.env` file is excluded from GitHub using `.gitignore`.

**Never commit or publish real credentials.**

---

## 📊 Project Statistics

| Item | Current Status |
|---|---|
| Active Places | 41 |
| Official Images | 584 |
| Places with Videos | 39 |
| Places without Videos | 2 |
| Main Categories | 6 |
| Database | MongoDB |
| Backend | Node.js + Express |
| Frontend | HTML + CSS + JavaScript |

---

## 🎯 Project Goal

The goal of **Vellore Discover** is to create a centralized and engaging platform for discovering:

- Heritage
- Culture
- Temples
- Nature
- Waterfalls
- Hills
- Dams and lakes
- Parks
- Landmarks
- Lesser-known destinations

The system combines **multimedia, community participation, and personalized discovery** to provide a richer local exploration experience.

---

## 🚀 Future Scope

Possible future improvements include:

- Mobile application
- Advanced interactive maps
- GPS-based nearby discovery
- AI-based recommendations
- Intelligent trip optimization
- Tamil and multilingual support
- Audio guides
- Offline access
- Advanced analytics
- Notifications

---

## 👨‍💻 Developers

### Vansh

**Student Developer · VIT Vellore**

### Aniket Verma

**Student Developer · VIT Vellore**

### Chandru

**Student Developer · VIT Vellore**

Together, the developers designed and developed **Vellore Discover** as a multimedia-based local discovery platform for Vellore.

---

## 📖 Developer Documentation

For complete technical setup, backend/frontend architecture, API information, database models, authentication, troubleshooting, and maintenance instructions, see:

```text
DEVELOPER_GUIDE.md
```

---

## 🌐 Repository

**Vellore_Heritage_Explorer**

GitHub repository:

```text
https://github.com/chandru2006-ui/Vellore_Heritage_Explorer
```
