import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Save token in localStorage
      localStorage.setItem("token", token);

      // Redirect to dashboard (or wherever)
      navigate("/dashboard");
    } else {
      navigate("/login?error=no_token");
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
};

export default AuthSuccess;
