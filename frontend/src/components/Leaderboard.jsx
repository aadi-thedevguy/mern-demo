import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "../context/authContext";

function Leaderboard({ quizId, user }) {
  const {
    data: report,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reports", quizId],
    queryFn: async () => {
      const response = await axios.get(`${baseUrl}/quizzes/${quizId}/reports`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return response.data;
    },
    enabled: !!quizId,
  });

  if (isLoading)
    return (
      <div className="grid h-[50vh] place-content-center">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );

  if (isError) {
    return (
      <div
        role="alert"
        className="mt-10 mx-auto max-w-screen-lg alert alert-error"
      >
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
        {error.response ? error.response.data.message : error.message}
      </div>
    );
  }

  if (!report) return null;

  return (
    <>
      <h1 className="text-5xl text-center font-semibold italic mb-8">
        Leaderboard
      </h1>
      <div className="overflow-x-auto max-w-screen-xl mx-auto mb-8">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>User Name</th>
              <th>Score</th>
              <th>Time</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {report.map((item, index) => (
              <tr key={index}>
                <th>{index + 1}.</th>
                <td>{item.name}</td>
                <td>{item.score}</td>
                <td>{item.timeTaken}</td>
                <td>{item.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Leaderboard;
