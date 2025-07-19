import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Logo from "../../assets/images/feed.png";
import { FirebaseError } from "firebase/app";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface AuthFormProps {
  mode: "signIn" | "signUp";
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isSignInMode = mode === "signIn";

  const validateForm = () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let isValid = true;

    if (!email) {
      setEmailError("Email is required.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!isSignInMode && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignInMode) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Sign in successful!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Sign up successful!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
      navigate("/dashboard");
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = "An error occurred. Please try again.";

      if (isSignInMode) {
        if (
          firebaseError.code === "auth/invalid-email" ||
          firebaseError.code === "auth/user-not-found" ||
          firebaseError.code === "auth/wrong-password"
        ) {
          setEmailError("Wrong credentials. Please try again.");
          errorMessage = "Wrong credentials. Please try again.";
        }
      } else {
        if (firebaseError.code === "auth/email-already-in-use") {
          setEmailError("Email already in use. Please use a different email.");
          errorMessage = "Email already in use. Please use a different email.";
        } else if (firebaseError.code === "auth/invalid-email") {
          setEmailError("Invalid email address.");
          errorMessage = "Invalid email address.";
        } else if (firebaseError.code === "auth/weak-password") {
          setPasswordError("Password is too weak.");
          errorMessage = "Password is too weak.";
        }
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Sign in successful!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Google sign-in failed. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bangus-white">
      <div className="w-full max-w-[400px] mx-4">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={Logo} alt="BANGUS Logo" className="size-12" />
          <p className="header tracking-wider mx-1 mt-2 text-2xl font-bold text-bangus-cyan hover:text-bangus-teal transition-colors">
            BANGUS
          </p>
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm text-gray-600">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.address"
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan placeholder-gray-400"
              required
              disabled={loading}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm text-gray-600">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignInMode ? "Your secret password" : "Create a strong password"}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan placeholder-gray-400"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          {!isSignInMode && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm text-gray-600">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan placeholder-gray-400"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {confirmPasswordError && <p className="text-xs text-red-500">{confirmPasswordError}</p>}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-bangus-cyan text-white py-2 rounded hover:bg-bangus-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignInMode ? "Sign In" : "Sign Up"}
          </button>

          <div className="relative flex items-center justify-center">
            <hr className="w-full border-gray-200" />
            <span className="absolute bg-bangus-white px-4 text-sm text-gray-500">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isSignInMode ? "Sign in with Google" : "Sign up with Google"}
          </button>

          {isSignInMode ? (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Did you forget your password?{" "}
                <Link to="/auth/reset-password" className="text-bangus-cyan hover:underline">
                  <span className="text-bangus-cyan">Reset it now</span>
                </Link>
              </p>
            </div>
          ) : null}

          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600">
              {isSignInMode ? "Don't have an account yet?" : "Already have an account?"}
            </p>
            <Link
              to={isSignInMode ? "/auth/signup" : "/auth/login"}
              className="text-sm text-bangus-cyan hover:underline"
            >
              {isSignInMode ? "Sign up here" : "Sign in here"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;