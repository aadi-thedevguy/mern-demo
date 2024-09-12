import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Signup from "./routes/signup";
import Dashboard from "./routes/Dashboard";
import Login from "./routes/login";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/authContext";
import CreateQuiz from "./routes/CreateQuiz";
import TakeQuiz from "./routes/TakeQuiz";
import EditQuiz from "./routes/EditQuiz";

// Create a client
export const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Navbar />
          <Toaster position="bottom-right" />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/quizzes/create" element={<CreateQuiz />} />
            <Route path="/quizzes/edit/:id" element={<EditQuiz />} />
            <Route path="/quizzes/:id" element={<TakeQuiz />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
