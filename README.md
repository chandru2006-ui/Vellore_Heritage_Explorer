# Vellore Discover 🌍

### Multimedia-Based Local Discovery System for Vellore

Vellore Discover is a full-stack web application that helps users **discover, explore and experience places across Vellore** through structured information, images and videos.

The platform combines **local discovery + multimedia + community participation + personalization + trip planning** in one system.

---

## 🌐 What Does This Project Do?

Vellore Discover allows users to:

- 🔎 Search and discover places
- 🗂️ Explore places by category and location
- 📍 View detailed information about destinations
- 🖼️ Explore place images
- 🎬 Watch available videos
- ❤️ Like places
- 🔖 Save places for later
- ⭐ Rate places
- 📝 Share experiences and feedback
- 📷 Upload community photos
- 🎥 Submit community videos
- 🗺️ Create personalized trips
- 📋 Manage saved trips

Administrators can manage:

- Places
- Users
- Official media
- Community contributions
- Trips
- Reports and analytics

---

# 🏗️ System Architecture

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



🎬 Multimedia Architecture

Multimedia is a major part of the project.

Each destination can contain:

Place
 │
 ├── Text Information
 │
 ├── Images
 │      └── Cloudinary URLs
 │
 └── Video
        └── Online Video URL

The current dataset contains:

41 unique active places
584 official image records
39 places with video links
2 places intentionally without video links

The two places without video links are:

ANA009 – Kavasampattu Bed Dam
ANA003 – Magizhvathi Dam

Official media and community-submitted media are maintained separately.

👥 User & Community System

Authenticated users can:

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

Community contributions can contain:

Rating
Experience
Feedback
Photos
Video

New contributions are initially:

PENDING

Administrators can:

PENDING
   │
   ├── APPROVE → Public Content
   │
   └── REJECT  → Rejected Content
🗺️ Trip Planning

Users can create personalized trips:

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
🛠️ Technology Stack
Layer	Technology
Frontend	HTML5, CSS3, JavaScript
Backend	Node.js, Express.js
Database	MongoDB
ODM	Mongoose
Authentication	JWT
Images	Cloudinary
Videos	Online Video URLs
API	REST
Version Control	Git / GitHub
📁 Project Structure
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
🗄️ Database

MongoDB stores the application's structured data.

Main entities:

User
Place
Contribution
Like
Saved Place
Trip

Relationships:

User
 ├── Likes ───────────────► Place
 ├── Saved Places ────────► Place
 ├── Contributions ───────► Place
 └── Trips ───────────────► Place
🔐 Security

The system uses:

JWT authentication
Role-based authorization
Protected APIs
Admin-only operations
Environment variables for secrets

Sensitive configuration such as:

MongoDB URI
JWT Secret
Cloudinary credentials

is stored locally in:

backend/.env

The .env file is excluded from GitHub using .gitignore.

Never commit or publish real credentials.

📊 Project Statistics
Item	Current Status
Active Places	41
Official Images	584
Places with Videos	39
Places without Videos	2
Main Categories	6
Database	MongoDB
Backend	Node.js + Express
Frontend	HTML + CSS + JavaScript
🎯 Project Goal

The goal of Vellore Discover is to create a centralized and engaging platform for discovering:

Heritage
Culture
Temples
Nature
Waterfalls
Hills
Dams and lakes
Parks
Landmarks
Lesser-known destinations

The system combines multimedia, community participation and personalized discovery to provide a richer local exploration experience.

🚀 Future Scope

Possible future improvements include:

Mobile application
Advanced interactive maps
GPS-based nearby discovery
AI-based recommendations
Intelligent trip optimization
Tamil and multilingual support
Audio guides
Offline access
Advanced analytics
Notifications
👨‍💻 Developers
Vansh

Student Developer · VIT Vellore

Aniket Verma

Student Developer · VIT Vellore

Chandru

Student Developer · VIT Vellore

Together, the developers designed and developed Vellore Discover as a multimedia-based local discovery platform for Vellore.
