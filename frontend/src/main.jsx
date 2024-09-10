import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Signup from "./routes/signup";
import Dashboard from "./routes/Dashboard";
import Login from "./routes/login";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/authContext";
import CreateQuiz from "./routes/CreateQuiz";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Dashboard />
      </>
    ),
  },
  {
    path: "/quizzes/create",
    element: (
      <>
        <Navbar />
        <CreateQuiz />
      </>
    ),
  },
  // {
  //   path: "/quizzes/:id",
  //   element: (
  //     <>
  //       <Navbar />
  //       <CreateQuiz />
  //     </>
  //   ),
  // },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
