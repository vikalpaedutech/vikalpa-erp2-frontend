import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/auth.service";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email);

      setMessage(
        response.message ||
          "Password reset mail has been sent to your registered email."
      );
    } catch (error) {
      console.error("Forgot password failed:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center">
          Forgot Password
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Enter your registered email address.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">

          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="mt-2 w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-3 text-sm text-green-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 w-full text-sm text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;