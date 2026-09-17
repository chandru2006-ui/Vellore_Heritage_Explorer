# Vellore Discover — Developer Guide

## 1. Project Overview

**Vellore Discover** is a multimedia-based local discovery platform for exploring places across Vellore.

The system combines:

- Place discovery and search
- Categories and advanced filters
- Place descriptions and structured information
- Official images and online video links
- User authentication
- Likes and saved places
- User ratings, experiences, reviews, photos and videos
- Community moderation
- Trip planning
- Admin management
- Reports and analytics

The project contains a separate **frontend** and **Node.js/Express backend**, with **MongoDB** used as the database.

---

## 2. Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Responsive UI

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt/password hashing
- CORS
- Cloudinary for uploaded community media

### Development Tools
- Visual Studio Code
- Git
- GitHub
- PowerShell / Command Prompt

---

## 3. Project Structure

```text
Multimedia_Project/
├── 01_Places/
├── 02_Text/
├── 03_Images/
├── 04_Videos/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
└── frontend/
    ├── css/
    ├── js/
    ├── index.html
    ├── place.html
    ├── login.html
    ├── register.html
    ├── my-contributions.html
    ├── saved-places.html
    ├── trip-planner.html
    ├── my-trips.html
    └── developers.html
```

---

# 4. Prerequisites

Install the following before running the project:

1. Node.js
2. MongoDB
3. Git
4. A modern web browser
5. Visual Studio Code or another code editor

Check Node.js:

```cmd
node --version
npm --version
```

Check Git:

```cmd
git --version
```

MongoDB must be running locally if the project uses:

```text
mongodb://localhost:27017/vellore_multimedia
```

---

# 5. Clone the Repository

Repository:

**Vellore_Heritage_Explorer**

```cmd
git clone https://github.com/chandru2006-ui/Vellore_Heritage_Explorer.git
cd Vellore_Heritage_Explorer
```

---

# 6. Backend Setup

Open a terminal in the project directory.

```cmd
cd backend
npm install
```

The backend runs on:

```text
http://localhost:5000
```

Start the server:

```cmd
node server.js
```

Expected output:

```text
Server running on port 5000
MongoDB connected successfully
```

---

# 7. Environment Variables

Create:

```text
backend/.env
```

Example structure:

```env
MONGO_URI=mongodb://localhost:27017/vellore_multimedia
PORT=5000
JWT_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never commit the real `.env` file to GitHub.

The project `.gitignore` contains:

```gitignore
backend/.env
.env
.env.*
!.env.example
```

Never publish:

- JWT secrets
- MongoDB credentials
- Cloudinary API secrets
- Other private API keys

---

# 8. MongoDB

The application database is:

```text
vellore_multimedia
```

Main collections/models include:

- Users
- Places
- Contributions
- Likes
- Saved Places
- Trips

MongoDB stores application data while Cloudinary stores uploaded community media.

---

# 9. Backend Architecture

The backend follows a controller-route-model structure.

```text
Frontend
   |
   v
Express Routes
   |
   v
Middleware
   |
   v
Controllers
   |
   v
Mongoose Models
   |
   v
MongoDB
```

### Routes

Routes define API endpoints.

Example:

```text
/api/places
/api/auth
/api/contributions
/api/likes
/api/saved-places
/api/trips
/api/admin
```

### Controllers

Controllers contain application/business logic.

### Models

Models define MongoDB document structures.

### Middleware

Middleware handles:

- Authentication
- Admin authorization
- Request processing

---

# 10. Main API Groups

## Places

```text
/api/places
```

Used for:

- Getting places
- Searching places
- Getting place information
- Managing place data

## Authentication

```text
/api/auth
```

Used for:

- Registration
- Login
- Authentication-related operations

## Contributions

```text
/api/contributions
```

Used for:

- Creating contributions
- Editing contributions
- Deleting contributions
- Uploading contribution media
- Viewing public approved contributions
- Viewing a user's contributions

## Likes

```text
/api/likes
```

Used for:

- Like
- Unlike
- Like status

## Saved Places

```text
/api/saved-places
```

Used for:

- Save/unsave places
- Check saved status
- Get saved places

## Trips

```text
/api/trips
```

Used for:

- Creating trips
- Getting personal trips
- Getting a trip
- Updating trips
- Deleting trips

## Admin

```text
/api/admin
```

Used for:

- User management
- Contribution moderation
- Reports

Additional admin APIs:

```text
/api/admin/media
/api/admin/trips
```

---

# 11. Authentication

Authentication uses JWT.

Login generates a token containing information such as:

```text
userId
email
role
```

The token is used by protected endpoints.

The frontend normally sends:

```text
Authorization: Bearer <token>
```

The authentication middleware verifies the token and sets the authenticated user.

---

# 12. User Roles

There are two roles:

```text
user
admin
```

Normal registration creates:

```text
role = user
```

An administrator can manage roles through the admin system.

The admin middleware checks the user's current role in MongoDB before allowing admin operations.

This prevents a normal user from accessing protected admin functions.

---

# 13. Place Model

A Place document contains core information such as:

```text
placeId
placeName
locality
firka
taluk
category
popularityLevel
description
```

It also contains enriched information such as:

```text
whatIsIt
primaryPurposeOrSignificance
historicalBackground
physicalCharacteristics
dimensionsOrSize
locationContext
visitorInformation
accessOrTransport
bestTimeOrSeason
nearbyOrRelatedFeatures
imageRequirements
videoRequirements
audioTtsSource
verificationNeeded
parentOrComplex
placeSpecificityStatus
primaryEvidenceSummary
```

Official multimedia fields include:

```text
videoLink
images
```

Community media fields include:

```text
communityImages
communityVideos
```

Places also contain rating and like information.

Coordinates may be null where verified coordinates were not available.

---

# 14. Official Multimedia

The project separates official media from community uploads.

Official images are stored as image URLs.

Official videos are stored as online video links.

The website does not need to download the videos locally.

The video URL is used by the frontend to open or play the online video.

---

# 15. Image Dataset

The final image dataset contains:

```text
584 image records
41 active places
```

There are no duplicate `(Place_ID, Image_File)` combinations and no duplicate Cloudinary URLs in the final image workbook.

All active place IDs are represented.

Periyar Park (`VEL010`) has:

```text
20 images
```

---

# 16. Video Dataset

The final dataset contains:

```text
39 video links
2 places without video links
```

The two places intentionally without video links are:

```text
ANA009 — Kavasampattu Bed Dam
ANA003 — Magizhvathi Dam
```

Do not invent video links for these places.

---

# 17. Community Contributions

Authenticated users can submit:

- Rating
- Experience
- Feedback/review
- Photos
- Video

A contribution starts with:

```text
pending
```

Possible statuses:

```text
pending
approved
rejected
```

Only approved contributions should be displayed as approved community content.

---

# 18. Contribution Moderation

Administrators can review contributions.

Admin actions include:

```text
Approve
Reject
```

When a contribution is approved, the system updates the related place rating.

The rating system calculates the place's average rating from approved ratings.

---

# 19. Likes

Likes are separate from saved places.

A user can like a place.

The Like model contains:

```text
user
place
```

A unique index prevents the same user from creating duplicate likes for the same place.

The Place document maintains:

```text
likeCount
```

for quick display.

---

# 20. Saved Places

Saved Places are private bookmarks/wishlist items.

They are different from public likes.

Users can:

```text
Save a place
Unsave a place
View saved places
Check saved status
```

The Saved Places page displays the user's saved locations.

---

# 21. Trip Planner

The Trip Planner allows authenticated users to create personal itineraries.

Basic flow:

```text
Trip Planner
     ↓
Choose Places
     ↓
Search/select places
     ↓
Arrange itinerary
     ↓
Save Trip
     ↓
My Trips
```

Each trip contains:

```text
user
name
places
```

Each selected place has an order value.

Example:

```text
Place A → order 0
Place B → order 1
Place C → order 2
```

---

# 22. Admin Trip Management

Administrators can view trip information.

Admin trip statistics include:

```text
Total trips
Total trip places
Average places per trip
```

Admin trip APIs are separate from normal user trip APIs.

---

# 23. Reports and Analytics

The admin reports system provides information including:

- Total places
- Total users
- Total contributions
- Total likes
- Total saved places
- Total trips
- User role breakdown
- Contribution status breakdown
- Place likes
- Top liked places
- Rated places
- Category distribution
- Locality distribution

Reports are intended to help administrators understand platform usage.

---

# 24. Frontend Pages

Important pages include:

```text
index.html
```

Homepage and place discovery.

```text
place.html
```

Individual place details.

```text
login.html
register.html
```

Authentication.

```text
my-contributions.html
```

User contribution management.

```text
saved-places.html
```

Saved place collection.

```text
trip-planner.html
```

Trip creation.

```text
my-trips.html
```

Saved trips.

```text
developers.html
```

Developer information.

```text
admin.html
```

Admin dashboard.

---

# 25. Homepage

The homepage contains:

- Navigation bar
- Hero section
- Search
- Advanced filters
- Categories
- Featured/explore places
- Ratings
- Likes
- Saved-place actions
- Footer

The main frontend JavaScript is:

```text
frontend/js/app.js
```

Authentication UI is handled by:

```text
frontend/js/auth-ui.js
```

---

# 26. Frontend API URL

The frontend currently uses:

```javascript
const API_URL = "http://localhost:5000/api/places";
```

If the backend is moved to another server, update the API configuration accordingly.

---

# 27. Running the Complete Project

## Terminal 1 — Backend

```cmd
cd backend
node server.js
```

Keep this terminal running.

## Frontend

Open the `frontend` directory using a local web server.

For example, with VS Code Live Server, open:

```text
frontend/index.html
```

and launch it using Live Server.

The frontend communicates with:

```text
http://localhost:5000
```

---

# 28. Recommended Development Workflow

When changing the project:

### Step 1 — Understand the feature

Identify:

- Frontend page
- JavaScript file
- CSS file
- Backend route
- Controller
- Model

### Step 2 — Make the backend change

If the feature requires database changes:

```text
Model
  ↓
Controller
  ↓
Route
```

### Step 3 — Test the API

Confirm the backend returns the expected status and data.

### Step 4 — Update frontend

Modify:

```text
HTML
CSS
JavaScript
```

as required.

### Step 5 — Test in browser

Check:

- Desktop
- Smaller screen
- Authentication
- API errors
- Loading states
- Empty states

### Step 6 — Commit changes

```cmd
git status
git add .
git commit -m "Describe the change"
git push
```

---

# 29. Adding a New Place

When adding a new place, update the place dataset carefully.

A new place should have:

```text
Unique Place_ID
Place_Name
Locality
Category
Description
Required enriched information
Official images where available
Video link where available
```

Do not invent:

- Coordinates
- Sources
- Video links
- Historical claims

If information cannot be verified, preserve the appropriate empty/verification state.

---

# 30. Adding Images

Official images are represented by URLs.

When adding images:

1. Use the correct Place_ID.
2. Ensure the image belongs to the place.
3. Avoid duplicate URLs.
4. Avoid duplicate image records.
5. Import the image data into MongoDB.
6. Test the place page.

The image importer is:

```text
backend/importImages.js
```

---

# 31. Adding Videos

Official videos are stored in the Place document through:

```text
videoLink
```

The video importer is:

```text
backend/importVideos.js
```

Only valid video links should be imported.

Blank video fields should remain blank when the dataset intentionally has no video.

---

# 32. Important Backend Files

```text
backend/server.js
```

Main Express server.

```text
backend/models/
```

Database models.

```text
backend/controllers/
```

Business logic.

```text
backend/routes/
```

API endpoints.

```text
backend/middleware/authMiddleware.js
```

JWT authentication.

```text
backend/middleware/adminMiddleware.js
```

Admin authorization.

---

# 33. Important Frontend Files

```text
frontend/index.html
frontend/place.html
frontend/login.html
frontend/register.html
frontend/admin.html
frontend/saved-places.html
frontend/my-contributions.html
frontend/trip-planner.html
frontend/my-trips.html
frontend/developers.html
```

CSS:

```text
frontend/css/
```

JavaScript:

```text
frontend/js/
```

---

# 34. Security Rules

Never commit:

```text
.env
```

Never expose:

```text
JWT_SECRET
CLOUDINARY_API_SECRET
database credentials
private API keys
```

Do not store passwords as plain text.

Authentication must remain protected by JWT.

Admin operations must remain protected by:

```text
protect
adminOnly
```

Do not allow normal registration to choose:

```text
role = admin
```

---

# 35. Troubleshooting

## Backend does not start

Check:

```cmd
node --version
```

Then:

```cmd
npm install
node server.js
```

Check whether MongoDB is running.

---

## MongoDB connection error

Check `.env`:

```env
MONGO_URI=mongodb://localhost:27017/vellore_multimedia
```

Also make sure MongoDB is running.

---

## Frontend cannot load places

Check that the backend is running:

```text
http://localhost:5000
```

Then check the browser developer console.

Confirm the frontend API URL points to the correct backend.

---

## Login does not work

Check:

- Backend is running
- MongoDB is connected
- User exists
- Password is correct
- Browser console
- Network requests
- JWT response

---

## Admin page does not work

Confirm the logged-in account has:

```text
role = admin
```

Admin APIs require authentication and admin authorization.

---

## Images are missing

Check:

- Image URL
- Place_ID
- MongoDB Place document
- Browser network errors
- Cloudinary/public URL availability

---

# 36. GitHub Workflow

Check changes:

```cmd
git status
```

Stage:

```cmd
git add .
```

Commit:

```cmd
git commit -m "Update Vellore Discover"
```

Push:

```cmd
git push
```

To get the latest repository version:

```cmd
git pull
```

Before pushing, always make sure secrets are ignored.

---

# 37. Repository

GitHub repository:

```text
https://github.com/chandru2006-ui/Vellore_Heritage_Explorer
```

The repository contains the project source code and documentation.

---

# 38. Developer Principles

When maintaining Vellore Discover:

1. Keep frontend and backend responsibilities separate.
2. Reuse existing API patterns.
3. Protect authenticated endpoints.
4. Protect admin endpoints.
5. Never expose secrets.
6. Keep place IDs consistent across datasets.
7. Avoid duplicate media.
8. Do not invent unsupported place information.
9. Test both API and browser behavior after major changes.
10. Keep the interface responsive and professional.
11. Preserve the distinction between official and community media.
12. Keep likes, saved places, ratings, contributions, and trips as separate features.

---

# 39. Quick Reference

### Start backend

```cmd
cd backend
node server.js
```

### Install backend packages

```cmd
cd backend
npm install
```

### Check Git

```cmd
git status
```

### Save changes

```cmd
git add .
git commit -m "Your message"
git push
```

### Backend

```text
http://localhost:5000
```

### Database

```text
vellore_multimedia
```

### Main API

```text
http://localhost:5000/api
```

---

# 40. Final Architecture Summary

```text
                    VELLORE DISCOVER
                           |
          +----------------+----------------+
          |                                 |
       FRONTEND                          BACKEND
          |                                 |
 HTML / CSS / JS                    Node.js + Express
          |                                 |
          |                          Authentication
          |                          Admin Security
          |                          REST APIs
          |                                 |
          +------------ API ----------------+
                                           |
                                      Mongoose
                                           |
                                       MongoDB
                                           |
                            +--------------+--------------+
                            |                             |
                       Place Data                   User Data
                            |                             |
                    Official Media              Contributions
                    Images / Videos             Likes / Saves
                                                 Trips
                                                 Ratings
                                                 |
                                             Cloudinary
                                           Community Media
```

Vellore Discover is therefore organized as a full-stack multimedia discovery system with a responsive frontend, REST-based backend, MongoDB data layer, authenticated community features, administrative moderation, analytics, multimedia support, and personal trip planning.
