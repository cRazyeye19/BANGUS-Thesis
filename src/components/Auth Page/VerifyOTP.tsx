import React, { useState } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../config/firebase";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import Logo from "../../assets/images/feed.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const VerifyOTP = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [actionCode, setActionCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("oobCode");
    if (code && !isVerified) {
      setActionCode(code);
      verifyCode(code);
    }
  }, [location.search, isVerified]);

  const verifyCode = async (code: string) => {
    try {
      if(isVerified) return;
      const email = await verifyPasswordResetCode(auth, code);
      setIsVerified(true);
      toast.success(`Verification successful for ${email}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        className: "text-sm",
      });
    } catch (error) {
      const firebaseError = error as FirebaseError;
      setError("Invalid or expired code. Please try again.");
      toast.error("Invalid or expired code. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        className: "text-sm",
      });
      console.error("Error verifying code:", firebaseError);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      toast.success("Password reset successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        className: "text-sm",
      });
      navigate("/auth/login");
    } catch (error) {
      const firebaseError = error as FirebaseError;
      setError("Failed to reset password. Please try again.");
      toast.error("Failed to reset password. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        className: "text-sm",
      });
      console.error("Error resetting password:", firebaseError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bangus-white">
      <div className="w-full max-w-[400px] mx-4">
        <Link
          to="/"
          className="flex items-center justify-center mb-8"
        >
          <img src={Logo} alt="BANGUS Logo" className="size-12" />
          <p className="header tracking-wider mx-1 mt-2 text-2xl font-bold text-bangus-cyan hover:text-bangus-teal transition-colors">
            BANGUS
          </p>
        </Link>

        {!actionCode ? (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Invalid Link
            </h2>
            <p className="text-sm text-gray-600">
              The password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link
              to="/auth/reset-password"
              className="block w-full bg-bangus-cyan text-white py-2 rounded hover:bg-bangus-teal transition-colors cursor-pointer mt-4 text-center"
            >
              Request New Link
            </Link>
          </div>
        ) : !isVerified ? (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Verifying...
            </h2>
            <p className="text-sm text-gray-600">
              Please wait while we verify your reset code.
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Create New Password
            </h2>

            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm text-gray-600"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm text-gray-600"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full bg-bangus-cyan text-white py-2 rounded hover:bg-bangus-teal transition-colors cursor-pointer"
            >
              Reset Password
            </button>

            <div className="text-center mt-4">
              <Link
                to="/auth/login"
                className="text-sm text-bangus-cyan hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;
