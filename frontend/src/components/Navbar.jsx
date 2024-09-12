import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Quiz App
        </Link>
      </div>
      <div className="flex-none">
        {user ? (
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        ) : (
          <Link className="btn btn-primary text-lg" to="/login">
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;
