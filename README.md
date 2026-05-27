# 🤝 PeerLink: A Student Peer Mentoring System

PeerLink is a comprehensive web-based platform designed to bridge the gap between students seeking academic guidance and qualified student mentors. Built with Laravel and React, the system streamlines the mentorship process—from applications and skill assessments to scheduling, reviews, and administration.

## ✨ Key Features

* **Multi-Role Dashboards:** Distinct, purpose-built interfaces for Students, Mentors, and System Administrators.
* **Session Booking:** Interactive calendars for mentors to set availability and for students to book sessions seamlessly.
* **Mentorship Workflows:** Complete lifecycle management for mentorship requests (Apply → Review → Approve/Decline → Terminate).
* **Skill Assessments & Reviews:** Self-assessed skill tracking and a built-in rating/review system for completed mentorships (with image upload support).
* **Advanced Admin Controls:** A master user list with quick-select filtering, bulk year-level promotions, and Excel/CSV bulk account importing with pre-validation.
* **Notification System:** Get a real-time notification alert for specific events.

---

## 💻 System Requirements

Before you begin, ensure your machine has the following installed:

* **PHP:** Version 8.2 or higher (Ensure the gd and zip extensions are enabled in your php.ini file).
* **Composer:** Dependency manager for PHP
* **Node.js & npm:** For compiling frontend React assets
* **MySQL:** Database server (Preferably MySQL Workbench setup, can be standalone, or via XAMPP/Laragon)
* **Git:** Version control

---

## 🚀 Installation & Setup Guide

Follow these steps exactly to get a local copy of PeerLink up and running.

### 1. Clone the Repository
Open your terminal and clone the project to your local machine:
```bash
git clone https://github.com/NhStGa/PeerLink-Student-Mentoring-System.git
cd PeerLink-Student-Mentoring-System

```

### 2. Install Dependencies

Install both the backend (PHP) and frontend (JavaScript) packages:

*(Note: Ensure the gd and zip extensions are enabled in your php.ini file).*
*(Note: If you receive a PHP version error during the composer install, use `composer install --ignore-platform-reqs` instead).*

```bash
composer install
npm install

```

### 3. Environment Configuration

Duplicate the example environment file to create your local configuration:

```bash
cp .env.example .env

```

Next, generate a unique application key:

```bash
php artisan key:generate

```

### 4. Database Setup

1. Open your MySQL interface (recommended: MySQL Workbench).
2. Create a brand new, empty database. A good name is `CREATE DATABASE peerlink_db;`.
3. Open the `.env` file in the root of the project and update the database section to match your local credentials:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peerlink_db
DB_USERNAME=root      # (Change if your local DB uses a different username)
DB_PASSWORD=          # (Add your password if your local DB requires one)

```

### 5. Migrate and Seed the Database

Build the database tables and populate them with the default System Admin account:

```bash
php artisan migrate --seed

```

### 6. Link Local Storage

Because the system handles user avatars and review image uploads, you must link the storage directory to make images publicly accessible:

```bash
php artisan storage:link

```

---

## 🏃‍♂️ Running the Application

To run PeerLink locally, you need to start both the Laravel backend server and the Vite frontend development server.

Open two separate terminal windows/tabs.

### Terminal 1 (Backend):

```bash
php artisan serve

```

### Terminal 2 (Frontend):

```bash
npm run dev

```

The application will now be running at: `http://localhost:8000`
*(Tip: Ctrl + Click the server link in the backend terminal to instantly open the system in your browser).*

---

## 🔑 Default Login Credentials

After successfully running the migrations and seeders, you can log into the system using the default master administrator account:

* **Email:** `admin@peerlink.com`
* **Password:** `P2PSys2026`

*(Note: If you create new accounts manually or via the Bulk Excel Importer, their default password will also be `P2PSys2026`)*