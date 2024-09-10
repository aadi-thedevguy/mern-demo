import { Link, Outlet } from "react-router-dom";

function Dashboard() {
  return (
    <main className="mx-auto container">
      <h1 className="font-bold text-4xl text-center my-6">Quiz App</h1>
      <button className="btn btn-link">
        <Link to="/quizzes/create">Create Quiz</Link>
      </button>
      <Outlet />
    </main>
  );
}

export default Dashboard;
