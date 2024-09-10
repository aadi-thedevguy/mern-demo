import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Dashboard() {
  const { user } = useAuth();
  return (
    <main className="mx-auto container">
      <h1 className="font-bold text-4xl text-center my-6">Quiz App</h1>
      <div className="flex items-center gap-4">
        <button className="btn btn-link">
          {user ? (
            <Link to="/quizzes/create">Create Quiz</Link>
          ) : (
            <Link to="/login">Login to get Started</Link>
          )}
        </button>
      </div>
      {/* <Outlet /> */}
    </main>
  );
}

export default Dashboard;
