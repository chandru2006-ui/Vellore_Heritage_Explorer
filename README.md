# Vellore Discover – Multimedia-Based Local Discovery System

> An interactive multimedia-based local discovery platform designed to help users explore the heritage, culture, nature, landmarks, attractions, and lesser-known destinations of Vellore.

---

## 📌 Project Overview

**Vellore Discover** is a web-based local discovery platform developed to provide an interactive and engaging way to explore places across Vellore.

The system combines structured place information with images, videos, user contributions, ratings, likes, saved places, and personalized trip planning.

The platform is designed around the idea of making local exploration easier by bringing important information about Vellore's destinations into a single digital platform.

The system contains information for **41 unique places** covering categories such as:

- Forts & Palaces
- Temples
- Waterfalls
- Hills
- Dams & Lakes
- Parks & Nature
- Other local attractions and destinations

---

# 🎯 Objectives

The main objectives of Vellore Discover are:

1. To create a centralized digital platform for discovering places in Vellore.
2. To provide structured and place-specific information.
3. To enhance place discovery using multimedia content.
4. To allow users to search and filter places based on different criteria.
5. To allow authenticated users to like and save places.
6. To allow users to submit experiences, ratings, photographs, and videos.
7. To provide an administrator interface for managing content and users.
8. To provide moderation mechanisms for community contributions.
9. To allow users to create and manage personalized trips.
10. To provide reports and analytics for administrators.

---

# ✨ Key Features

## 🗺️ Place Discovery

Users can explore destinations through a visually rich interface.

Each place can contain:

- Place name
- Locality
- Category
- Description
- Historical information
- Physical characteristics
- Significance
- Visitor information
- Transportation/access information
- Best time or season
- Nearby or related features
- Images
- Videos
- Ratings
- Likes

---

## 🔎 Search and Filtering

The Explore section provides multiple ways to find places.

Users can:

- Search by place name
- Search using keywords
- Filter by category
- Filter by location
- Sort results
- Clear filters
- Explore individual place pages

---

## ❤️ Likes

Authenticated users can like places.

The system uses a separate Like collection to prevent duplicate likes from the same user for the same place.

The place also maintains a `likeCount` for efficient display.

---

## 🔖 Saved Places

Users can privately save places for later.

Saved Places are different from Likes.

### Like

Represents user appreciation or interest in a place.

### Saved Place

Represents a personal wishlist/bookmark that the user wants to revisit later.

Users can:

- Save a place
- Remove a saved place
- View all saved places
- Check whether a particular place is already saved

---

# ⭐ Ratings and Community Contributions

Authenticated users can contribute to places.

A contribution may contain:

- Rating
- Experience
- Feedback
- Photos
- Video

All contributions initially enter a moderation workflow.

### Contribution Workflow

```text
User
  │
  ▼
Submit Contribution
  │
  ▼
Pending
  │
  ├───────────────┐
  ▼               ▼
Approved        Rejected
  │
  ▼
Published / Used
  │
  ▼
Place Rating Updated
