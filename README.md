# WebProgramming News Portal

## Overview
This project is a full-featured news portal web application built with Node.js, Express, Handlebars, Passport.js, and Knex (MySQL/MariaDB). It supports user authentication, role-based access (admin, editor, writer, user), article management, category/subcategory organization, and a modern, responsive UI for both end-users and content managers.

## Features
- User registration, login (local and Google OAuth2), and profile management
- Role-based permissions (Admin, Editor, Writer, User)
- Article CRUD: create, edit, approve, publish, and manage news posts
- Category and subcategory management
- Commenting and comment-like system
- Premium articles
- Admin, editor, and writer panels
- Responsive Handlebars-based UI with Bootstrap
- Database integration via Knex and MySQL/MariaDB
- Session management and authentication with Passport.js

## Project Structure
```
.
├── database/              # SQL
│   ├── webPostgreSQL.sql
│   └── webupdate.sql      # Main schema and demo data
├── models/                # Data models (categories, posts, users, ...)
├── routes/                # Express routers 
├── utils/                 # Utilities (DB connection)
├── views/                 # Handlebars templates
│   ├── layouts/
│   ├── vwPosts/           # Post-related views
│   ├── vwAccount/         # Account-related views
│   └── ...
├── main.js                # Entry point (Express app)
├── .env                   # Environment variables
└── package.json           # Project dependencies
```

## Setup & Installation
1. **Clone the repository**
   ```sh
   git clone https://github.com/zeus1411/WebProgramming.git
   cd WebProgramming
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Configure environment variables**
   - Copy `.env.example` to `.env` and set your database credentials and session secrets.
4. **Setup the database**
   - Import `database/webupdate.sql` into your MySQL/MariaDB server.
   - Alternatively, use Knex migrations and seeds for schema and demo data.
5. **Run the application**
   ```sh
   npm start
   # or
   node main.js
   ```
6. **Access the app**
   - Open your browser and go to `http://localhost:3000`

## Main Files & Folders
- `main.js`: Configures Express, Passport, Handlebars, session, and routes.
- `models/`: Contains all database models (category, post, user, ...).
- `routes/`: All Express routers for user, post, category, authentication, Google OAuth, admin/editor/writer panels.
- `utils/db.js`: Knex setup for MySQL/MariaDB connection.
- `views/`: Handlebars templates for all pages, including error pages and admin/editor/writer panels.
- `database/webupdate.sql`: SQL dump for schema and sample data.

## Technologies Used
- Node.js, Express.js
- Handlebars (express-handlebars)
- Passport.js (local & Google OAuth2)
- Knex.js (MySQL/MariaDB)
- Bootstrap (frontend styling)
- Moment.js, Bcrypt.js, Nodemailer

> **Note:** For any issues or questions, please contact the maintainer or open an issue on GitHub.
