import { Link, useNavigate } from "react-router-dom";
import { baseUrl, useAuth } from "../context/authContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { toast } from "sonner";
import { queryClient } from "../main";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isLoading,
    isError,
    error,
    isFetched,
    data: quizzes,
  } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const response = await axios.get(`${baseUrl}/quizzes`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return response.data;
    },
  });

  const { mutate: deleteQuiz, isPending: isDeleting } = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${baseUrl}/quizzes/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast("Quiz deleted successfully");
      // Invalidate every query with a key that starts with `todos`
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    onError: (error) => {
      toast.error(
        error?.response ? error.response.data.message : error.message
      );
    },
  });

  useEffect(() => {
    if (!user) return navigate("/login");
  }, [user, navigate]);

  if (isLoading)
    return (
      <div className="grid h-screen place-content-center">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );

  if (isError) {
    return (
      <section className="h-screen place-content-center grid">
        <div role="alert" className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {error.response ? error.response.data.message : error.message}
          </span>
        </div>
      </section>
    );
  }

  if (isFetched && quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center h-screen justify-center">
        <h1 className="text-3xl font-bold italic">No quizzes found</h1>
        <Link to="/quizzes/create" className="btn btn-info">
          Create a Quiz
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto px-6">
      <div className="flex justify-between my-6">
        <h1 className="font-bold text-4xl">Your Quizzes</h1>
        <Link to="/quizzes/create" className="btn btn-info">
          Create
        </Link>
      </div>
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="card bg-base-100 w-96 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{quiz.title}</h2>
              <p>{quiz.description}</p>
              <div className="card-actions justify-end gap-2">
                <button
                  className="btn btn-circle btn-error disabled:bg-opacity-55"
                  disabled={isDeleting}
                  onClick={() => deleteQuiz(quiz._id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trash-2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
                <Link
                  to={`/quizzes/edit/${quiz._id}`}
                  className="btn btn-circle btn-primary"
                  title="Edit Quiz"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-file-pen-line"
                  >
                    <path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
                    <path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                    <path d="M8 18h1" />
                  </svg>
                </Link>
                <Link
                  to={`/quizzes/${quiz._id}`}
                  title="View Quiz"
                  className="btn btn-circle btn-success"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-eye"
                  >
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;
