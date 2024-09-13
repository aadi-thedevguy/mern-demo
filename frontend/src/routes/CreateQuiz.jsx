import { useForm, useFieldArray } from "react-hook-form";
import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth, baseUrl } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const CreateQuiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate("/login");
  }, [navigate, user]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      questions: [
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ],
    },
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (newQuiz) => {
      const response = await axios.post(`${baseUrl}/quizzes`, newQuiz, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return response.data;
    },
    onError: (error) => {
      console.error(error.message);
      toast.error(
        error?.response ? error.response.data.message : error.message
      );
    },
    onSuccess: () => {
      //   reset();
      navigate("/");
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  if (!user) return null;

  return (
    <div className="my-6">
      <h1 className="text-4xl font-bold mb-4 text-center">Create a New Quiz</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-screen-lg mx-auto p-4"
      >
        <div className="border-blue-600 border rounded-lg p-4">
          <div className="flex flex-col gap-2">
            <div>
              <label className="label text-xl text-gray-600">Title</label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600  focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex-1">
              <label className="label text-xl text-gray-600">Description</label>
              <textarea
                placeholder="Description"
                className="block w-full h-32 px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md md:h-48 d focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                {...register("description", {
                  required: "Description is required",
                })}
              />
            </div>
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div className="border-blue-600 border rounded-lg p-4">
          <h1 className="text-2xl font-bold mb-4">Questions</h1>
          {fields.map((field, index) => (
            <React.Fragment key={field.id}>
              <div className="flex flex-col gap-2 space-y-4">
                <div className="flex-1">
                  <label className="label text-xl text-gray-600">
                    Question {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`questions.${index}.question`, {
                      required: "Question is required",
                    })}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600  focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                </div>
                {errors.questions?.[index]?.question && (
                  <p className="text-red-500 text-sm">
                    {errors.questions[index].question.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 space-y-2">
                <div className="flex-1">
                  <label className="label text-xl text-gray-600">Options</label>
                  {field.options.map((option, optionIndex) => (
                    <React.Fragment key={optionIndex}>
                      <input
                        type="text"
                        {...register(
                          `questions.${index}.options.${optionIndex}`,
                          {
                            required: "Option is required",
                          }
                        )}
                        className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600  focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                      />
                      {errors.questions?.[index]?.options?.[optionIndex] && (
                        <p className="text-red-500 text-sm">
                          {errors.questions[index].options[optionIndex].message}
                        </p>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 space-y-2">
                <div className="flex-1">
                  <label className="label text-xl text-gray-600">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    {...register(`questions.${index}.correctAnswer`, {
                      required: "Correct answer is required",
                    })}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600  focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                </div>
                {errors.questions?.[index]?.correctAnswer && (
                  <p className="text-red-500 text-sm">
                    {errors.questions[index].correctAnswer.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-2 btn btn-error text-white"
              >
                Remove
                <svg
                  className="lucide lucide-circle-minus"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                </svg>
              </button>
            </React.Fragment>
          ))}
          <button
            type="button"
            onClick={() =>
              append({
                question: "",
                options: ["", "", "", ""],
                correctAnswer: "",
              })
            }
            className="m-2 bg-blue-600 text-white btn"
          >
            Add
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
              className="lucide lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isPending}
            className={`btn btn-wide ${
              isError ? "btn-error text-white" : "btn-success text-white"
            }`}
          >
            Create
            {isPending ? (
              <span className="loading loading-dots loading-xs"></span>
            ) : null}
            {isError ? (
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
                className="lucide lucide-circle-x"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            ) : null}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
