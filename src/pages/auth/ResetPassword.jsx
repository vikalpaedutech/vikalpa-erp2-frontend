import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";

function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post(
        `/auth/reset-password/${resetToken}`,
        {
          newPassword,
        }
      );

      setMessage(
        response.data?.message || "Password reset successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password failed:", error);

      const message =
        error.response?.data?.message ||
        "Unable to reset password. The link may be invalid or expired.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">

        <h1 className="text-3xl font-bold text-center">
          Reset Password
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">

          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter new password"
            className="mt-2 w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block mt-4 text-sm font-medium text-gray-700">
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            placeholder="Confirm new password"
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
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;