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

### 2. Configure the shared database connection

Copy `backend/.env.example` to `backend/.env`.

Then fill in the shared database values that every teammate will use:

```env
DB_HOST=YOUR_PUBLIC_DATABASE_HOST
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=railway
```

Important:

- Use the database provider's public host, not an internal host like `mysql.railway.internal`, when teammates are running the app on their own computers.
- `backend/.env` is ignored by git, so each teammate can keep the password locally while using the same connection values.

### 3. Create the database tables

Then run the schema file:

```powershell
mysql -h YOUR_PUBLIC_DATABASE_HOST -P 3306 -u root -p railway < "C:\Users\maxkm\OneDrive\Desktop\Software Design\COSC4353\backend\database\combined_schema.sql"
```

This loads the starter tables and data into the shared database.

### 4. Run the app

From the project root:

```powershell
npm.cmd run dev
```

That starts both:

- frontend on `http://localhost:5173`
- backend on `http://localhost:3001`

## Notes

- If PowerShell blocks `npm`, use `npm.cmd`
- If login or register fails, check the backend terminal for the exact database error
- Every teammate should use the same `backend/.env` values so everyone sees the same data
