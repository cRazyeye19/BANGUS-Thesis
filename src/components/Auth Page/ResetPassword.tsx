import React from "react";
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import { auth } from "../../config/firebase";
import Logo from "../../assets/images/feed.png";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";

const ResetPassword = () => {
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [isEmailSent, setIsEmailSent] = React.useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast.success("Password reset email sent. Please check your inbox.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        className: "text-sm",
      });
    } catch (error) {
      const firebaseError = error as FirebaseError;

      if (firebaseError.code === "auth/user-not-found") {
        setEmailError("User not found. Please check your email.");
        toast.error("User not found. Please check your email.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          className: "text-sm",
        });
      } else if (firebaseError.code === "auth/invalid-email") {
        setEmailError("Invalid email format. Please enter a valid email.");
        toast.error("Invalid email format. Please enter a valid email.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          className: "text-sm",
        });
      } else {
        setEmailError("An error occurred. Please try again later.");
        toast.error("An error occurred. Please try again later.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          className: "text-sm",
        });
      }
      console.error(firebaseError);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-bangus-white">
      <div className="w-full max-w-[400px] mx-4">
        <Link
          to="/"
          className="flex items-center justify-center align-middle mb-8"
        >
          <img src={Logo} alt="BANGUS Logo" className="size-12" />
          <p className="header tracking-wider mx-2 mt-2 text-2xl font-bold text-bangus-cyan hover:text-bangus-teal transition-colors">
            BANGUS
          </p>
        </Link>

        {!isEmailSent ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Reset Your Password
            </h2>
            <p className="text-sm text-center text-gray-500 mb-4">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm text-gray-600"
              >
                Email Address
              </label>
              <input
                type="email"
                name=""
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.address"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan placeholder-gray-400"
                required
              />
              {emailError &&
                toast.error(emailError, {
                  position: "top-right",
                  autoClose: 2000,
                  hideProgressBar: true,
                  className: "text-sm",
                })}
            </div>

            <button
              type="submit"
              className="w-full bg-bangus-cyan text-white py-2 rounded hover:bg-bangus-teal transition-colors cursor-pointer"
            >
              Send Password Reset Link
            </button>

            <div className="text-center mt-4">
              <Link
                to="/auth/login"
                className="text-sm text-bangus-cyan hover:underline"
              >
                Return to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Check your Email
            </h2>
            <p className="text-sm text-gray-600">
              We've sent a password reset link to{" "}
              <strong>{email}</strong>. Please
              check your inbox and follow the instructions to reset your
              password.
            </p>
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full bg-bangus-cyan hover:bg-bangus-teal text-white py-2 rounded cursor-pointer mt-4"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
