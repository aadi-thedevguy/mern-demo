import { useForm, useFieldArray } from "react-hook-form";
import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth, baseUrl } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (newQuiz) => {
      const response = await axios.post(`${baseUrl}/quizzes`, newQuiz);
      if (!response.ok) {
        throw new Error("Failed to create quiz");
      }
      return response.data;
    },
    onSuccess: () => {
      //   reset();
      navigate("/dashboard");
    },
  });

  const onSubmit = (data) => {
    mutate({ ...data, user: user._id });
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  if (!user) return null;

  return (
    <div className="my-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 shadow-md rounded-lg max-w-2xl mx-auto p-4"
      >
        <h1 className="text-2xl font-bold mb-4">Create a New Quiz</h1>
        <div className="flex flex-col gap-2">
          <div>
            <label className="block textarea-md text-gray-600">Title</label>
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
            <label className="block textarea-md text-gray-600">
              Description
            </label>
            <textarea
              placeholder="Description"
              className="block w-full h-32 px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md md:h-48 d focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
              {...register("description", {
                required: "Description is required",
              })}
            />
          </div>
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            <div className="flex flex-col gap-2 space-y-4">
              <div className="flex-1">
                <label className="block textarea-md text-gray-600">
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
                <label className="block textarea-md text-gray-600">
                  Options
                </label>
                {field.options.map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    type="text"
                    {...register(`questions.${index}.options.${optionIndex}`, {
                      required: "Option is required",
                    })}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600  focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                ))}
              </div>
              {errors.questions?.[index]?.options && (
                <p className="text-red-500 text-sm">
                  {errors.questions[index].options.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 space-y-2">
              <div className="flex-1">
                <label className="block textarea-md text-gray-600">
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
              className="mt-2 btn btn-error"
            >
              Remove -
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
          className="m-2 btn-info btn"
        >
          Add +
        </button>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isPending}
            className={`btn btn-wide ${isError ? "btn-error" : "btn-success"}`}
          >
            {isPending ? "Creating..." : "Create Quiz"}
          </button>
        </div>
        <div className="my-6">
          {isError && (
            <p className="text-red-500 text-sm italic">
              {error.response.data.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
