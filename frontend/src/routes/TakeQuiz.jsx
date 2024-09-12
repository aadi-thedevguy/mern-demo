import { useForm } from "react-hook-form";
import { useAuth, baseUrl } from "../context/authContext";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import Leaderboard from "../components/Leaderboard";
import { useEffect, useState } from "react";

const TakeQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = useParams();
  const quizId = params.id;
  const [startTime, setStartTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      answers: [],
    },
  });

  const {
    data: quiz,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const response = await axios.get(`${baseUrl}/quizzes/${quizId}`);
      return response.data;
    },
    enabled: !!quizId,
  });

  const { mutate, isPending, isSuccess, data } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${baseUrl}/quizzes/submit/${quizId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast("Your answers have been submitted successfully");
      if (user) navigate(`/quizzes/${quizId}`);
    },
    onError: (error) => {
      toast.error(
        error?.response ? error.response.data.message : error.message
      );
    },
  });

  useEffect(() => {
    if (quiz) {
      setStartTime(Date.now());
    }
  }, [quiz]);

  useEffect(() => {
    let timer;
    if (startTime) {
      timer = setInterval(() => {
        setDisplayTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const onSubmit = async (data) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    mutate({ ...data, timeTaken: formatTime(timeTaken) });
  };

  if (isLoading)
    return (
      <div className="grid h-[50vh] place-content-center">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );

  if (isError) {
    return (
      <div role="alert" className="mt-10 mx-auto max-w-fit alert alert-error">
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
    );
  }

  if (isSuccess) {
    return (
      <main className="mx-auto mt-10 gap-4 px-6 flex flex-col items-center justify-center">
        <div
          className="radial-progress text-blue-600"
          style={{ "--value": data.percentage, "--size": "12rem" }}
          role="progressbar"
        >
          {data.percentage}%
        </div>
        <h1 className="text-4xl font-bold italic ">
          Thanks for taking the quiz, {data.name}
        </h1>
        <h2 className="text-3xl font-semibold italic text-gray-500">
          Your Score :{data.score}/{data.userAnswers}
        </h2>
        <h2 className="text-3xl font-semibold italic text-gray-500">
          Time Taken :{data.timeTaken}
        </h2>
        <div>
          <div className="flex items-center gap-3 my-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10f473"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-check-big"
            >
              <path d="M21.801 10A10 10 0 1 1 17 3.335" />
              <path d="m9 11 3 3L22 4" />
            </svg>
            <span>Correct Answers : {data.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f41010"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-x"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
            <span>Incorrect Answers : {data.userAnswers - data.score}</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="my-6">
      {user && quizId && (
        <div className="my-6">
          <Leaderboard quizId={quizId} user={user} />
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 shadow-md rounded-lg max-w-2xl mx-auto p-4"
      >
        <div className="text-5xl text-center">
          Timer : {formatTime(displayTime)}
        </div>
        <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
        <p className="mb-4">{quiz.description}</p>
        <div className="flex flex-col gap-2">
          <div>
            <label className="label text-xl text-gray-600">Your Name</label>
            <input
              placeholder="John Doe"
              type="text"
              {...register("name", { required: "Name is required" })}
              className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600  focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {quiz.questions.map((question, index) => (
          <div key={question._id} className="flex flex-col gap-2 space-y-4">
            <div className="flex-1">
              <label className="label text-xl text-gray-600">
                {question.question}
              </label>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={option}
                    {...register(`answers.${index}`, {
                      required: "This question is required",
                    })}
                    className="radio checked:bg-blue-500 my-2"
                  />
                  <span>{option}</span>
                </div>
              ))}
              {errors.answers && errors.answers[index] && (
                <p className="text-red-500 text-sm">
                  {errors.answers[index].message}
                </p>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 disabled:bg-opacity-70 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-400 focus:ring-opacity-40"
        >
          {isPending ? "Submitting..." : "Submit Quiz"}
        </button>
      </form>
    </main>
  );
};

export default TakeQuiz;
