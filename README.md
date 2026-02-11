# 101482699 Lab Test 1 - Chat App

Real-time chat application for COMP 3133 Lab Test 1.

## Tech Stack

- **Backend:** Express, Socket.io, Mongoose
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, React Query
- **Database:** MongoDB

## Running

```bash
# Install dependencies
cd server && bun install
cd ../client && bun install
cd ..

# Start both server and client
bun dev
```

Server runs on `http://localhost:3000`, client on `http://localhost:5173`.

Requires MongoDB running on `localhost:27017` (or set `MONGO_URI` in `server/.env`).

## Disclaimer

This is very insecure and does no input validation. This is for a test and the priority was work, not polish.
