# MERN Quiz App

This App has been scaffolded in a few hours and is not production-ready.
The UI for this app is currently under development.

## It includes the following:

- Backend API with Express & MongoDB
- Routes for auth, logout, register for Users
- CRUD For Users, Quizzes
- Generated Reports for Quizzes taken by the user
- JWT authentication stored in HTTP-only cookie
- Protected routes and endpoints
- Frontend with React Router, React Query, React Hook Form and Tailwind CSS

## Improvements

- Cors to block requests from other domains
- Unit Testing for React Components with Storybook or React Testing Library
- Centralized state management with Redux or Zustand
- Centralized Server logging with Winston or Pino
- OAuth with Google, Facebook, Twitter, etc.
- Better form Validation on the frontend and backend

### Development

Clone this Repo

```
git clone https://github.com/aadi-thedevguy/mern-demo.git
```

Create a `.env` file in the server and add the following:

```
NODE_ENV = development
PORT = 3000
MONGO_URI = your mongodb uri
JWT_SECRET = 'abc123'
```

Change the JWT_SECRET to what you want

### Install Dependencies (frontend & backend)

```
cd backend
npm install
cd frontend
npm install
```

### Run

```
# Run frontend
cd ./frontend
npm run dev

# Run backend
cd ./backend
npm run dev
```
