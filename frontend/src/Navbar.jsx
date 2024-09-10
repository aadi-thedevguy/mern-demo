import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl, useAuth } from "./context/authContext";

function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => axios.post(`${baseUrl}/users/logout`),
    onSuccess: () => {
      logout();
      navigate("/");
    },
    onError: (error) => {
      alert(error.message);
    },
  });
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl">Quiz App</Link>
      </div>
      <div className="flex-none">
        <button
          disabled={isPending}
          className="btn btn-ghost"
          onClick={() => mutate()}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
