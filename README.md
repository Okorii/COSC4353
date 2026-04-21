# QueueSmart

QueueSmart is a React + Express app for managing a pet grooming queue.

## Features

- Login and registration
- User dashboard
- Join queue / leave queue
- Queue status
- Queue management
- Service management
- Admin dashboard
- History view

## Project Structure

- `src/` contains the React frontend
- `backend/` contains the Express API and MySQL queries
- `backend/database/combined_schema.sql` creates the database tables and starter data

## Setup

### 1. Install dependencies

From the project root:

```powershell
npm.cmd install
```

The backend dependencies should also be installed:

```powershell
cd backend
npm.cmd install
cd ..
```

### 2. Configure MySQL

Update the password in `backend/config/db.js` so it matches your MySQL root password.

Then run the schema file:

```powershell
mysql -u root -p < "C:\Users\maxkm\OneDrive\Desktop\Software Design\COSC4353\backend\database\combined_schema.sql"
```

This creates the `pet` database and loads the starter tables/data.

### 3. Run the app

From the project root:

```powershell
npm.cmd run dev
```

That starts both:

- frontend on `http://localhost:5173`
- backend on `http://localhost:3001`

## Notes

- If PowerShell blocks `npm`, use `npm.cmd`
- Keep MySQL running before starting the app
- If login or register fails, check the backend terminal for the exact database error
