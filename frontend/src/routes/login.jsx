import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth, baseUrl } from "../context/authContext";
import { useEffect } from "react";
import axios from "axios";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const {
    mutate,
    isPending: isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: (data) =>
      axios
        .post(`${baseUrl}/users/auth`, {
          data,
        })
        .then((res) => res.data),
    onSuccess: (data) => {
      login(data);
      navigate("/");
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  if (user) return null;

  return (
    <>
      <section className="bg-white ">
        <div className="container flex items-center justify-center min-h-screen px-6 mx-auto">
          <form className="w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-center mx-auto">
              <img
                className="w-auto h-7 sm:h-8"
                src="https://merakiui.com/images/logo.svg"
                alt="background"
              />
            </div>

            <div className="flex items-center justify-center mt-6">
              <Link
                to="/login"
                className="w-1/3 pb-4 font-medium text-center text-gray-800 capitalize border-b-2 border-blue-500 "
              >
                sign in
              </Link>
              <Link
                to="/signup"
                className="w-1/3 pb-4 font-medium text-center text-gray-500 capitalize border-b "
              >
                sign up
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative flex items-center mt-6">
                <span className="absolute">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 mx-3 text-gray-300 "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>

                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11  focus:border-blue-400  focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm italic">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative flex items-center mt-4">
                <span className="absolute">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 mx-3 text-gray-300 "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>

                <input
                  type="password"
                  className="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg  focus:border-blue-400  focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm italic">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 text-sm font-medium tracking-wide disabled:bg-opacity-55 disabled:cursor-not-allowed text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
            <div className="my-6">
              {isError && (
                <p className="text-red-500 text-sm italic">{error.message}</p>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default Login;
