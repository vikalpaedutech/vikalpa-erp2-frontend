import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../services/auth.service";

function ChangePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from old password.");
      return;
    }

    try {
      setLoading(true);

      const response = await changePassword({
        oldPassword,
        newPassword,
      });

      setMessage(
        response.message || "Password changed successfully."
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Change password failed:", error);

      const message =
        error.response?.data?.message ||
        "Unable to change password. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">

        <h1 className="text-3xl font-bold text-center">
          Change Password
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Update your account password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">

          <label className="block text-sm font-medium text-gray-700">
            Current Password
          </label>

          <input
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            placeholder="Enter current password"
            className="mt-2 w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block mt-4 text-sm font-medium text-gray-700">
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
            Confirm New Password
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
            {loading ? "Changing..." : "Change Password"}
          </button>

        </form>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 w-full text-sm text-blue-600 hover:underline"
        >
          Back to Dashboard
        </button>

      </div>
    </div>
  );
}

export default ChangePassword;